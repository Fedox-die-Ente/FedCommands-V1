module.exports = (command) => {
    const { commandObject, commandName } = command
    const { guildOnly, permissions = [] } = commandObject

    if (
        guildOnly !== true && permissions.length
    ) {
        throw new Error(
            `[FedCommands] Command ${commandName} has permissions but is not guild only!`
        )
    }
}