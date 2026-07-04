const { MessageFlags } = require('discord.js');

// ⏰ Utility time converter
function formatTime(ms) {
    if (!ms || isNaN(ms)) return '00:00';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    const formattedSecs = seconds < 10 ? `0${seconds}` : seconds;
    const formattedMins = minutes < 10 ? `0${minutes}` : minutes;

    return hours > 0 ? `${hours}:${formattedMins}:${formattedSecs}` : `${formattedMins}:${formattedSecs}`;
}

// 🎛️ Generates a bold, modern geometric progress bar
function createProgressBar(current, total, size = 16) {
    const progress = Math.min(size, Math.max(0, Math.floor((current / total) * size)));
    const bar = '▬'.repeat(progress) + '🔘' + '▬'.repeat(size - progress);
    return bar;
}

module.exports = {
    name: 'nowplaying',
    aliases: ['np', 'current'],
    category: 'music',
    description: 'Displays a live streamlined layout matrix of the song currently playing.',
    async execute(client, message, args) {
        const player = client.lavalink.getPlayer(message.guild.id);
        
        if (!player || !player.queue.current) {
            return message.reply('❌ There is no active music streaming player running on this server.');
        }

        const track = player.queue.current;
        const currentPos = player.position || 0;
        const totalDuration = track.info.duration || 0;

        // Fetch live context flags from player metrics
        const loopStatus = player.repeatMode === 'track' ? 'Enabled 🔂' : 'Disabled 🛑';
        const liveVolume = `${player.volume}% 🔊`;

        let playbackMetrics = '';
        if (track.info.isStream) {
            playbackMetrics = `🔴 **LIVE STREAM** ▬▬▬🔘 \`[ Live ]\``;
        } else {
            const bar = createProgressBar(currentPos, totalDuration, 14);
            playbackMetrics = `\`${formatTime(currentPos)}\` ${bar} \`${formatTime(totalDuration)}\``;
        }

        // Return clean layout matrix directly bypassing traditional embed restrictions
        return message.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [
                {
                    type: 17, // Container Layout Card
                    components: [
                        { 
                            type: 10, 
                            content: `## 🎶 NOW STREAMING\n### ${track.info.title}` 
                        },
                        { type: 14 }, // Separator Line
                        { 
                            type: 10, 
                            content: playbackMetrics 
                        },
                        { type: 14 }, // Separator Line
                        { 
                            type: 10, 
                            content: `* **Artist** : \`${track.info.author || 'Unknown'}\`\n* **Requested By** : **${track.requester?.username || 'System'}**` 
                        },
                        { type: 14 }, // Separator Line
                        { 
                            type: 10, 
                            content: `-# 📊 Vol: \`${liveVolume}\`  •  🔂 Track Loop: \`${loopStatus}\`` 
                        }
                    ]
                }
            ]
        });
    }
};