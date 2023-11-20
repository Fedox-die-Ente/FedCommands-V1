const mongoose = require("mongoose");

const CommandHandler = require("./command-handler/CommandHandler");

class FedCommands {
    constructor({ client, mongoUri, commandsDir, testServers = [] }) {
        if(!client) {
            throw new Error('[FedCommands] Client is required!')
        }

        this._testServers = testServers

        if (mongoUri) {
            this.connectToMongo(mongoUri)
        }

        if (commandsDir) {
            new CommandHandler(this, commandsDir, client)
        }
    }

    get testServers() {
        return this._testServers
    }

    connectToMongo(mongoUri) {
        mongoose.set('strictQuery', false);
        mongoose.connect(mongoUri, {
            keepAlive: true
        })
    }
}

module.exports = FedCommands