const { PermissionsBitField } = require("discord.js");
module.exports = {
    description: "Change the prefix of the bot for this server",

    minArgs: 1,
    syntaxError: "Correct syntax: {PREFIX}prefix {ARGS}",
    expectedArgs: "<prefix>",

    type: "BOTH",
    guildOnly: true,
    category: "Built-In",

    permissions: [PermissionsBitField.Administrator],

    callback: ({ instance, guild, text: prefix }) => {
        instance.commandHandler.prefixHandler.set(guild.id, prefix);

        return `The prefix for this server is now "${prefix}"`;
    },
};
