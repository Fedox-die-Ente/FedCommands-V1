module.exports = (command, usage) => {
    const { instance, commandObject } = command
    const { botOwners } = instance
    const { ownerOnly } = commandObject
    const { message, interaction, user } = usage

    if (ownerOnly === true && !botOwners.includes(user.id)) {
        const text = 'This command can only be used by the bot owner.'

        if (message) message.reply(text)
        else if (interaction) interaction.reply(text)

        return false
    }

    return true
}