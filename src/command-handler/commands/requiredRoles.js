const {
    PermissionFlagsBits,
    ApplicationCommandOptionType,
} = require("discord.js");
const requiredroles = require("../../models/required-roles-schema");

module.exports = {
    description: "Sets what commands require what roles",

    type: "SLASH",
    guildOnly: true,

    roles: [PermissionFlagsBits.Administrator],
    category: "Built-In",

    options: [
        {
            name: "command",
            description: "The command to set roles to",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: "role",
            description: "The role to set for the command",
            type: ApplicationCommandOptionType.Role,
            required: false,
        },
    ],

    autocomplete: (_, command) => {
        return [...command.instance.commandHandler.commands.keys()];
    },

    callback: async ({ instance, guild, args }) => {
        const [commandName, role] = args;

        const command = instance.commandHandler.commands.get(commandName);
        if (!command) {
            return `The command "${commandName}" does not exist.`;
        }

        const _id = `${guild.id}-${command.commandName}`;

        if (!role) {
            const document = await requiredroles.findById(_id);

            const roles =
                document && document.roles?.length
                    ? document.roles.map((roleId) => `<@&${roleId}>`)
                    : "None.";

            return {
                content: `Here are the roles for "${commandName}": ${roles}`,
                allowedMentions: {
                    roles: [],
                },
            };
        }

        const alreadyExists = await requiredroles.findOne({
            _id,
            roles: {
                $in: [role],
            },
        });

        if (alreadyExists) {
            await requiredroles.findOneAndUpdate(
                {
                    _id,
                },
                {
                    _id,
                    $pull: {
                        roles: role,
                    },
                },
            );

            return {
                content: `The command "${commandName}" no longer requires the role <@&${role}>`,
                allowedMentions: {
                    roles: [],
                },
            };
        }

        await requiredroles.findOneAndUpdate(
            {
                _id,
            },
            {
                _id,
                $addToSet: {
                    roles: role,
                },
            },
            {
                upsert: true,
            },
        );

        return {
            content: `The command "${commandName}" now requires the role <@&${role}>`,
            allowedMentions: {
                roles: [],
            },
        };
    },
};
