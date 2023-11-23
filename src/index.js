const mongoose = require("mongoose");

const CommandHandler = require("./command-handler/CommandHandler");

class FedCommands {
    constructor({ client, mongoUri, commandsDir, testServers = [], botOwners = [] }) {
        if(!client) {
            throw new Error('[FedCommands] Client is required!')
        }

        this._testServers = testServers
        this._botOwners = botOwners

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

    get botOwners() {
        return this._botOwners
    }

    connectToMongo(mongoUri) {
        mongoose.set('strictQuery', false);
        mongoose.connect(mongoUri, {
            keepAlive: true
        })
    }
}

module.exports = FedCommands