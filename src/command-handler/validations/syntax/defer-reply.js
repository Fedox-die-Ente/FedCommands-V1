module.exports = (command) => {
    const { commandObject, commandName } = command
    const { deferReply } = commandObject

    if(deferReply && typeof deferReply !== 'boolean' && deferReply !== 'ephemeral') {
        throw new Error(
            `[FedCommands] Command ${commandName} has an invalid deferReply value! Must be "ephemeral" or an boolean.`
        )
    }
}