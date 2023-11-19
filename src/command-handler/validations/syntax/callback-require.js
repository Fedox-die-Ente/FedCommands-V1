module.exports = (command) => {
    const { commandObject, commandName } = command

    if(!commandObject.callback) {
        throw new Error(
            `[FedCommands] Command ${commandName} does not have a callback function!`
        )
    }
}