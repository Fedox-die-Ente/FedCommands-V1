module.exports = async (command, usage) => {
    const { commandName, instance } = command;
    const { guild, message, interaction } = usage;

    if (!guild) {
        return true;
    }

    if (
        instance.commandHandler.disabledCommands.isDisabled(
            guild.id,
            commandName,
        )
    ) {
        const text = "This command is disabled";

        if (message) message.channel.send(text);
        else if (interaction) await interaction.reply(text);

        return false;
    }

    return true;
};
