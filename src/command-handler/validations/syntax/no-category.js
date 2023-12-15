module.exports = (command) => {
    const { commandObject, commandName } = command;

    if (!commandObject.category) {
        throw new Error(
            `[FedCommands] Command "${commandName}" does not have a category.`,
        );
    }
};