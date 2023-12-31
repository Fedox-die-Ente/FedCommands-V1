const path = require("path");

const getAllFiles = require("../util/get-all-files");
const Command = require("./BaseCommand");
const SlashCommands = require("./SlashCommands");
const { cooldownTypes } = require("../util/Cooldowns");
const ChannelCommands = require("./ChannelCommands");
const CustomCommands = require("./CustomCommands");
const DisabledCommands = require("./DisabledCommands");
const PrefixHandler = require("./PrefixHandler");
const { Message } = require("discord.js");

class CommandHandler {
    _validations = this.getValidations(
        path.join(__dirname, "validations", "runtime"),
    );
    _prefixes = new PrefixHandler();

    constructor(instance, commandsDir, client) {
        this._instance = instance;
        this._commandsDir = commandsDir;
        this._slashCommands = new SlashCommands(client);
        this._client = client;

        this._validations = [
            ...this._validations,
            ...this.getValidations(instance.validations?.runtime),
        ];

        this.readFiles();
    }

    // <commandName, instance of the Command class>
    _commands = new Map();

    get commands() {
        return this._commands;
    }

    _channelCommands = new ChannelCommands();

    get channelCommands() {
        return this._channelCommands;
    }

    _customCommands = new CustomCommands(this);

    get customCommands() {
        return this._customCommands;
    }

    _disabledCommands = new DisabledCommands();

    get disabledCommands() {
        return this._disabledCommands;
    }

    get slashCommands() {
        return this._slashCommands;
    }

    get prefixHandler() {
        return this._prefixes;
    }

    async readFiles() {
        const defaultCommands = getAllFiles(path.join(__dirname, "./commands"));
        const files = getAllFiles(this._commandsDir);
        const validations = [
            ...this.getValidations(
                path.join(__dirname, "validations", "syntax"),
            ),
            ...this.getValidations(this._instance.validations?.syntax),
        ];

        for (let file of [...defaultCommands, ...files]) {
            const commandObject = require(file);

            let commandName = file.split(/[\/\\]/);
            commandName = commandName.pop();
            commandName = commandName.split(".")[0];

            const command = new Command(
                this._instance,
                commandName,
                commandObject,
            );

            const {
                description,
                type,
                testOnly,
                delete: del,
                aliases = [],
                category,
                init = () => {},
            } = commandObject;

            if (
                del ||
                this._instance.disabledDefaultCommands.includes(
                    commandName.toLowerCase(),
                )
            ) {
                if (type === "SLASH" || type === "BOTH") {
                    if (testOnly) {
                        for (const guildId of this._instance.testServers) {
                            await this._slashCommands.delete(
                                command.commandName,
                                guildId,
                            );
                        }
                    } else {
                        await this._slashCommands.delete(command.commandName);
                    }
                }

                return;
            }

            for (const validation of validations) {
                validation(command);
            }

            await init(this._client, this._instance);

            const names = [command.commandName, ...aliases];

            for (const name of names) {
                this._commands.set(name, command);
            }

            if (type === "SLASH" || type === "BOTH") {
                const options =
                    commandObject.options ||
                    this._slashCommands.createOptions(commandObject);

                if (testOnly) {
                    for (const guildId of this._instance.testServers) {
                        this._slashCommands.create(
                            command.commandName,
                            description,
                            options,
                            guildId,
                        );
                    }
                } else {
                    this._slashCommands.create(
                        command.commandName,
                        description,
                        options,
                    );
                }
            }
        }
    }

    async runCommand(command, args, message, interaction) {
        const { callback, type, cooldowns } = command.commandObject;

        if (message && type === "SLASH") {
            return;
        }

        const messageOrInteraction = message ? message : interaction;
        const guild = message ? message.guild : interaction.guild;
        const member = message ? message.member : interaction.member;
        const user = message ? message.author : interaction.user;
        const channel = message ? message.channel : interaction.channel;
        const prefixUsed = this.prefixHandler.get(guild?.id);
        const reply =
            messageOrInteraction instanceof Message
                ? messageOrInteraction.reply.bind(messageOrInteraction)
                : interaction.reply.bind(interaction);
        const bot = messageOrInteraction.client;

        const usage = {
            bot,
            instance: command.instance,
            message,
            interaction,
            args,
            text: args.join(" "),
            guild,
            member,
            user,
            channel,
            messageOrInteraction,
            prefixUsed,
            reply,
        };

        for (const validation of this._validations) {
            if (
                !(await validation(
                    command,
                    usage,
                    this._prefixes.get(guild?.id),
                ))
            ) {
                return;
            }
        }

        if (cooldowns) {
            let cooldownType;

            for (const type of cooldownTypes) {
                if (cooldowns[type]) {
                    cooldownType = type;
                    break;
                }
            }

            const cooldownUsage = {
                cooldownType,
                userId: user.id,
                actionId: `command_${command.commandName}`,
                guildId: guild?.id,
                duration: cooldowns[cooldownType],
                errorMessage: cooldowns.errorMessage,
            };

            const result = this._instance.cooldowns.canRunAction(cooldownUsage);

            if (typeof result === "string") {
                return result;
            }

            await this._instance.cooldowns.start(cooldownUsage);

            usage.cancelCooldown = () => {
                this._instance.cooldowns.cancelCooldown(cooldownUsage);
            };

            usage.updateCooldown = (expires) => {
                this._instance.cooldowns.updateCooldown(cooldownUsage, expires);
            };
        }

        return await callback(usage);
    }

    getValidations(folder) {
        if (!folder) {
            return [];
        }

        const validations = getAllFiles(folder).map((filePath) =>
            require(filePath),
        );

        return validations;
    }
}

module.exports = CommandHandler;
