const CommandHandler = require("./CommandHandler");

class FedCommands {
    constructor({ client, commandsDir }) {
        if(!client) {
            throw new Error('[FedCommands] Client is required!')
        }

        if (commandsDir) {
            new CommandHandler(commandsDir, client)
        }
    }
}

module.exports = FedCommands