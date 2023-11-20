module.exports = (command) => {
    const { instance, commandName, commandObject } = command

    if(commandObject.testOnly !== true || instance.testServers.length) {
        return
    }

    throw new Error(
        `[FedCommands] Command "${commandName}" is a test command, but no test servers were provided!`
    )
}