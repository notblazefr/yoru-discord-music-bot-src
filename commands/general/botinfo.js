const { MessageFlags } = require('discord.js');
const os = require('os');

module.exports = {
    name: 'botinfo',
    aliases: ['info', 'stats', 'status', 'bi'],
    category: 'general',
    description: 'Displays the server and core application diagnostic metrics matching Components v2 specifications.',
    execute: async (client, message, args) => {
        // cpu usage track
        const getCpuUsage = () => {
            const cpus = os.cpus();
            let totalMs = 0;
            let idleMs = 0;
            for (const cpu of cpus) {
                for (const type in cpu.times) {
                    totalMs += cpu.times[type];
                }
                idleMs += cpu.times.idle;
            }
            return { totalMs, idleMs };
        };

        const startCpu = getCpuUsage();
        // accurate reading
        await new Promise(resolve => setTimeout(resolve, 100));
        const endCpu = getCpuUsage();

        const idleDelta = endCpu.idleMs - startCpu.idleMs;
        const totalDelta = endCpu.totalMs - startCpu.totalMs;
        const cpuPercent = totalDelta ? ((1 - idleDelta / totalDelta) * 100).toFixed(1) : '0.0';

        // shards
        let totalGuilds = client.guilds.cache.size;
        let totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        let totalMemory = process.memoryUsage().heapUsed;

        if (client.shard) {
            try {
                const [guildResults, memberResults, memoryResults] = await Promise.all([
                    client.shard.broadcastEval(c => c.guilds.cache.size),
                    client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)),
                    client.shard.broadcastEval(() => process.memoryUsage().heapUsed)
                ]);

                totalGuilds = guildResults.reduce((a, b) => a + b, 0);
                totalMembers = memberResults.reduce((a, b) => a + b, 0);
                totalMemory = memoryResults.reduce((a, b) => a + b, 0);
            } catch (err) {
                console.error('[STATS ERROR] Failure gathering cross-shard engine matrices:', err);
            }
        }

        const memoryAllocated = (totalMemory / 1024 / 1024).toFixed(2);
        const botAvatar = client.user.displayAvatarURL({ forceStatic: true, size: 512 });

        // links
        const inviteLink = client.config?.invite || `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;
        const supportLink = client.config?.support || "https://discord.gg/your-support-server";

        // send response
        return message.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [
                {
                    type: 17, // Container component
                    components: [
                        {
                            type: 9, // Section component
                            components: [
                                {
                                    type: 10, // Text display component
                                    content: `## YORU\n* **Another bot ?**\n* **Overseeing ${totalMembers.toLocaleString()} users across ${totalGuilds.toLocaleString()} guilds.**\n* **[DEVELOPERS]** : **__7lirt__**/**__d2eo__**`
                                }
                            ],
                            accessory: {
                                type: 11, // Media element component
                                media: {
                                    url: botAvatar
                                }
                            }
                        },
                        {
                            type: 14 // Separator component
                        },
                        {
                            type: 10, // Text display component
                            content: `### $ CLIENT\n* Commands : \`${client.commands.size}\`\n* Library : discord.js\n* Node.js : ${process.version}`
                        },
                        {
                            type: 14 // Separator component
                        },
                        {
                            type: 10, // Text display component
                            content: `### SYSTEM\n* CPU : ${cpuPercent}%\n* MEMORY : ${memoryAllocated} MB\n* LATENCY : ${client.ws.ping}ms`
                        },
                        {
                            type: 14 // Separator component
                        },
                        {
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
                        }
                    ]
                }
            ]
        });
    }
};