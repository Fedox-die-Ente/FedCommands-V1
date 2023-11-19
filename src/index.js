const mongoose = require("mongoose");

const CommandHandler = require("./command-handler/CommandHandler");

class FedCommands {
    constructor({ client, mongoUri, commandsDir }) {
        if(!client) {
            throw new Error('[FedCommands] Client is required!')
        }

        if (mongoUri) {
            this.connectToMongo(mongoUri)
        }

        if (commandsDir) {
            new CommandHandler(commandsDir, client)
        }
    }

    connectToMongo(mongoUri) {
        mongoose.set('strictQuery', false);
        mongoose.connect(mongoUri, {
            keepAlive: true
        })
    }
}

module.exports = FedCommands