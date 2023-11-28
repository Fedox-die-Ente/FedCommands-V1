module.exports = (command, usage) => {
    const { instance, commandObject } = command
    const { guild } = usage

    if (commandObject.testOnly !== true) {
        return true
    }

    if (!guild || !instance.testServers.includes(guild?.id)) {
        usage.message.reply('This command can only be used in test servers!')
    }

    return instance.testServers.includes(guild?.id)
}