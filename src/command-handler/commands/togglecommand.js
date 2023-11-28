const {
    PermissionsBitField,
    ApplicationCommandOptionType,
} = require("discord.js");
module.exports = {
    description: "Toggles a command on or off for your guild.",

    type: "SLASH",
    guildOnly: true,
    testOnly: true,

    permissions: [PermissionsBitField.Administrator],

    options: [
        {
            name: "command",
            description: "The command to toggle.",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
    ],

    autocomplete: (_, command) => {
        return [...command.instance.commandHandler.commands.keys()];
    },

    callback: async ({ instance, guild, text: commandName, interaction }) => {
        const { disabledCommands } = instance.commandHandler;

        if (disabledCommands.isDisabled(guild.id, commandName)) {
            await disabledCommands.enable(guild.id, commandName);

            interaction.reply(`The command "${commandName}" has been enabled.`);
        } else {
            await disabledCommands.disable(guild.id, commandName);

            interaction.reply(
                `The command "${commandName}" has been disabled.`,
            );
        }
    },
};
