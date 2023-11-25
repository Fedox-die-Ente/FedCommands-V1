const mongoose = require("mongoose");

const CommandHandler = require("./command-handler/CommandHandler");
const Cooldowns = require("./util/Cooldowns");

class FedCommands {
    constructor({
        client,
        mongoUri,
        commandsDir,
        testServers = [],
        botOwners = [] ,
        cooldownConfig = {},
        disabledDefaultCommands = []
    }) {
        if(!client) {
            throw new Error('[FedCommands] Client is required!')
        }

        this._testServers = testServers
        this._botOwners = botOwners

        this._disabledDefaultCommands = disabledDefaultCommands.map(c => c.toLowerCase())

        if (mongoUri) {
            this.connectToMongo(mongoUri)
            this._cooldowns = new Cooldowns({
                instance: this,
                ...cooldownConfig
            })
        }

        if (commandsDir) {
            this._commandHandler = new CommandHandler(this, commandsDir, client)
        }
    }

    get testServers() {
        return this._testServers
    }

    get botOwners() {
        return this._botOwners
    }

    get cooldowns() {
        return this._cooldowns
    }

    get disabledDefaultCommands() {
        return this._disabledDefaultCommands
    }

    get commandHandler() {
        return this._commandHandler
    }

    connectToMongo(mongoUri) {
        mongoose.set('strictQuery', false);
        mongoose.connect(mongoUri, {
            keepAlive: true
        })
    }
}

module.exports = FedCommands