const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    description: "Specifies what command can be used in what channels.",

    type: "SLASH",
    guildOnly: true,

    options: [
        {
            name: "command",
            description: "The command you want to specify.",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: "channel",
            description: "The channel to use for this command",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
    ],

    autocomplete: async (_, command) => {
        return [...command.instance.commandHandler.commands.keys()];
    },

    callback: async ({ instance, guild, interaction }) => {
        const commandName = interaction.options.getString("command");
        const channel = interaction.options.getChannel("channel");

        const command = instance.commandHandler.commands.get(
            commandName.toLowerCase(),
        );
        if (!command) {
            return `The command "${commandName}" does not exist.`;
        }

        const { channelCommands } = instance.commandHandler;

        let availableChannels = [];
        const canRun = (
            await channelCommands.getAvailableChannels(guild.id, commandName)
        ).includes(channel.id);

        if (canRun) {
            availableChannels = await channelCommands.remove(
                guild.id,
                commandName,
                channel.id,
            );
        } else {
            availableChannels = await channelCommands.add(
                guild.id,
                commandName,
                channel.id,
            );
        }

        if (availableChannels.length) {
            const channelNames = availableChannels.map((c) => `<#${c}> `);
            return `The command "${commandName}" can now only be ran inside of the following channels: ${channelNames}`;
        }

        return `The command "${commandName}" can now be ran in any channel.`;
    },
};