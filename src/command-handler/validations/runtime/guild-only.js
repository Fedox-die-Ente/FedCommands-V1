module.exports = (command, usage) => {
    const { guildOnly } = command.commandObject
    const { guild, message, interaction } = usage

    if (guildOnly === true && !guild) {
        const text = 'This command can only be used in a server.'

        if (message) message.reply(text)
        else if (interaction) interaction.reply(text)

        return false
    }

    return true
}