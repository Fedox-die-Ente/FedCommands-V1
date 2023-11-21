const path = require("path");

const getAllFiles = require("../util/get-all-files");
const BaseCommand = require("./BaseCommand");
const SlashCommands = require("./SlashCommands");

class CommandHandler {

    // <commandName, instance of the BaseCommandClass>
    commands = new Map()

    constructor(instance, commandsDir, client) {
        this._instance = instance
        this._commandsDir = commandsDir
        this._slashCommands = new SlashCommands(client)

        this.readFiles()
        this.messageListener(client)
    }

    readFiles() {
        const files = getAllFiles(this._commandsDir)
        const validations = this.getValidations('syntax')

        for (const file of files) {
            const commandObject = require(file)

            let commandName = file.split(/[\\/]/)
            commandName = commandName.pop()
            commandName = commandName.split(".")[0]

            const command = new BaseCommand(this._instance, commandName, commandObject)

            for (const validation of validations) {
                validation(command)
            }

            const { description, options = [], type, testOnly } = commandObject

            this.commands.set(command.commandName, command)

            if (type === 'SLASH' || type === 'BOTH') {
                if (testOnly) {
                    for (const guildId of this._instance.testServers) {
                        this._slashCommands.create(
                            command.commandName,
                            description,
                            options,
                            guildId
                        )
                    }
                } else {
                    this._slashCommands.create(
                        command.commandName,
                        description,
                        options
                    )
                }
            }
        }
    }

    messageListener(client) {
        const validations = this.getValidations('run-time')
        const prefix = "!";

        client.on('messageCreate', (message) => {
            const { content } = message

            if (!content.startsWith(prefix)) {
                return
            }

            const args = content.split(/\s+/)
            const commandName = args.shift().substring(prefix.length).toLowerCase()

            const command = this.commands.get(commandName)
            if (!command) {
                return
            }
            const { callback, type } = command.commandObject

            if (message && type === 'SLASH') {
                return
            }

            const usage = { message, args, text: args.join(' '), guild: message.guild }

            for (const validation of validations) {
                if (!validation(command, usage, prefix)) {
                    return
                }
            }

            callback(usage)
        })
    }

    getValidations(folder) {
        const validations = getAllFiles(
            path.join(__dirname, `./validations/${folder}`)
        ).map((filePath) => require(filePath))

        return validations
    }
}

module.exports = CommandHandler