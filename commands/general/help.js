const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h', 'cmds'],
    category: 'general',
    description: 'Displays all available command profiles registered to Yoru using Components v2 formatting.',
    async execute(client, message, args) {
        const prefix = client.db.getPrefix(message.guild.id);
        const searchTarget = args[0]?.toLowerCase();

        // links
        const inviteLink = client.config?.invite || `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;
        const supportLink = client.config?.support || "https://discord.gg/your-support-server";

        // buttons
        const buttonsActionRow = {
            type: 1, // Action Row component
            components: [
                {
                    type: 2, // Button component
                    style: 5, // Link type style
                    url: inviteLink,
                    label: "INVITE YORU"
                },
                {
                    type: 2, // Button component
                    style: 5, // Link type style
                    url: supportLink,
                    label: "SUPPORT SERVER"
                }
            ]
        };

        // vc cmd help
        if (searchTarget === 'vc' || searchTarget === 'voice') {
            return message.reply({ 
                flags: [MessageFlags.IsComponentsV2],
                components: [
                    {
                        type: 17, // Container component
                        components: [
                            { type: 10, content: "## YORU CMD HELP" },
                            { type: 14 }, // Separator
                            { type: 10, content: "### * `VC` CMD " },
                            { type: 14 }, // Separator
                            { type: 10, content: "* **[ALIASES]** : `voice`\n* **[DISCRIPTION]** : `vc kick [user]`, `vc mute [user]`, `vc unmute [user]`, `vc deafen [user]`, `vc undeafen [user]`, `vc move [user] [channel]`, `vc drag [user] [channel]`, `vc pull [user]`, `vc lock`, `vc unlock`, `vc public`, `vc private`, `vc muteall`, `vc unmuteall`, `vc deafenall`, `vc undeafenall`, `vc moveall`, `vc dragall`, `vc pullall`, `vc limit [number]`" },
                            { type: 14 }, // Separator
                            { type: 10, content: `-# requested by **${message.author.username}**` },
                            { type: 14 }, // Separator
                            buttonsActionRow
                        ]
                    }
                ]
            });
        }

        // specific cmd help
        if (searchTarget) {
            const cmd = client.commands.get(searchTarget) || client.commands.find(c => c.aliases && c.aliases.includes(searchTarget));

            if (!cmd) {
                return message.reply({ content: `❌ Could not resolve command or alias string matching \`${args[0]}\`.` });
            }

            const cleanAliases = cmd.aliases && cmd.aliases.length > 0 ? cmd.aliases.map(a => `\`${a}\``).join(', ') : '`None`';
            const cleanDescription = cmd.description || 'No operational brief provided.';

            return message.reply({ 
                flags: [MessageFlags.IsComponentsV2],
                components: [
                    {
                        type: 17, // Container component
                        components: [
                            { type: 10, content: "## YORU CMD HELP" },
                            { type: 14 }, // Separator
                            { type: 10, content: `### * \`${cmd.name.toUpperCase()}\` CMD ` },
                            { type: 14 }, // Separator
                            { type: 10, content: `* **[ALIASES]** : ${cleanAliases}\n* **[DISCRIPTION]** : ${cleanDescription}` },
                            { type: 14 }, // Separator
                            { type: 10, content: `-# requested by **${message.author.username}**` },
                            { type: 14 }, // Separator
                            buttonsActionRow
                        ]
                    }
                ]
            });
        }

        // help menu
        return message.reply({ 
            flags: [MessageFlags.IsComponentsV2],
            components: [
                {
                    type: 17, // Container component
                    components: [
                        { type: 10, content: "### YORU HELP MENU" },
                        { type: 14 }, // Separator
                        { type: 10, content: `* __TOTAL CMDS__ : **${client.commands.size}**\n* PREFIX : \`${prefix}\`` },
                        { type: 14 }, // Separator
                        { type: 10, content: "### OTHER CMDS\n**$** `help`, `ping`, `botinfo`" },
                        { type: 14 }, // Separator
                        { type: 10, content: "### MUSIC CMDS\n**$** `join`, `loop`, `pause`, `play`, `queue`, `resume`, `shuffle`, `skip`, `stop`, `volume`" },
                        { type: 14 }, // Separator
                        { type: 10, content: "### VC CMDS\n**$** `vc kick [user]`, `vc mute [user]`, `vc unmute [user]`, `vc deafen [user]`, `vc undeafen [user]`, `vc move [user] [channel]`, `vc drag [user] [channel]`, `vc pull [user]`, `vc lock`, `vc unlock`, `vc public`, `vc private`, `vc muteall`, `vc unmuteall`, `vc deafenall`, `vc undeafenall`, `vc moveall`, `vc dragall`, `vc pullall`, `vc limit [number]`" },
                        { type: 14 }, // Separator
                        buttonsActionRow
                    ]
                }
            ]
        });
    }
};