const { LavalinkManager } = require('lavalink-client');
const { EmbedBuilder } = require('discord.js');
const { generateMusicCard } = require('../utils/musicCard');

function formatTime(ms) {
    if (!ms || isNaN(ms)) return '00:00';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    const formattedSecs = seconds < 10 ? `0${seconds}` : seconds;
    const formattedMins = minutes < 10 ? `0${minutes}` : minutes;

    return hours > 0 ? `${hours}:${formattedMins}:${formattedSecs}` : `${formattedMins}:${formattedSecs}`;
}

module.exports = (client) => {
    client.lavalink = new LavalinkManager({
        nodes: [
            {
                id: "Yoru-Node-01",
                host: process.env.LAVALINK_HOST || "localhost",
                port: parseInt(process.env.LAVALINK_PORT) || 2333,
                authorization: process.env.LAVALINK_PASSWORD || "youshallnotpass",
                secure: process.env.LAVALINK_SECURE === 'true'
            }
        ],
        sendToShard: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        client: {
            id: process.env.CLIENT_ID,
            username: "Yoru"
        },
        autoSkip: true
    });

    client.on("raw", (d) => client.lavalink.sendRawData(d));

    client.lavalink.on("nodeConnect", (node) => console.log(`[LAVALINK] ✅ Node [${node.options.id}] online.`));
    client.lavalink.on("nodeError", (node, error) => console.error(`[LAVALINK] ❌ Node [${node.options.id}] error:`, error.message));

    // 🎶 Track Start Handler
    client.lavalink.on("trackStart", async (player, track) => {
        const textChannel = client.channels.cache.get(player.textChannelId);
        if (!textChannel) return;

        const durationDisplay = track.info.isStream ? 'Live' : formatTime(track.info.duration);

        try {
            const attachment = await generateMusicCard(track, durationDisplay);

            const nowPlayingEmbed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription(`Currently playing [${track.info.title}](${track.info.uri || '#'})`)
                .setImage('attachment://yoru-player.png')
                .setFooter({ 
                    text: `Requested by: ${track.requester?.username || 'System'}`,
                    iconURL: track.requester?.displayAvatarURL ? track.requester.displayAvatarURL() : null 
                });

            textChannel.send({ embeds: [nowPlayingEmbed], files: [attachment] });

        } catch (error) {
            console.error("[CARD GEN ERROR] Falling back to standard streamlined embed:", error);
            
            const fallbackEmbed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription(`Currently playing [${track.info.title}](${track.info.uri || '#'})`)
                .setFooter({ 
                    text: `Requested by: ${track.requester?.username || 'System'}`,
                    iconURL: track.requester?.displayAvatarURL ? track.requester.displayAvatarURL() : null 
                });

            textChannel.send({ embeds: [fallbackEmbed] });
        }
    });

    // 🛸 Queue Ended & Autoplay Handler
    client.lavalink.on("queueEnd", async (player, track) => {
        const textChannel = client.channels.cache.get(player.textChannelId);
        const isAutoplayEnabled = player.get('autoplay') || false;

        // If Autoplay is ON, intercept the queue end and fetch related music
        if (isAutoplayEnabled && track) {
            try {
                // TRICK: Adding &list=RD forces YouTube to return an auto-generated Mix Playlist of related songs
                let searchQuery = `https://www.youtube.com/watch?v=${track.info.identifier}&list=RD${track.info.identifier}`;

                // Fallback for non-YouTube sources (Spotify/SoundCloud)
                if (!track.info.sourceName?.includes('youtube')) {
                    searchQuery = `ytsearch:${track.info.author} ${track.info.title} mix`;
                }

                // Search for the related track
                const res = await player.search({ query: searchQuery }, client.user);

                if (res && res.tracks && res.tracks.length > 0) {
                    // Filter out the track we just listened to so it doesn't repeat
                    const relatedTracks = res.tracks.filter(t => t.info.identifier !== track.info.identifier);
                    
                    // Pick the first track from the filtered related list
                    let nextTrack = relatedTracks[0];

                    // Extreme fallback just in case the filter emptied the array
                    if (!nextTrack) nextTrack = res.tracks[1] || res.tracks[0];
                    
                    await player.queue.add(nextTrack);
                    await player.play();

                    if (textChannel) {
                        const autoPlayEmbed = new EmbedBuilder()
                            .setColor('#ffffff')
                            .setDescription(`**Autoplay** queued up:**[${nextTrack.info.title}](${nextTrack.info.uri || '#'})**`);
                        textChannel.send({ embeds: [autoPlayEmbed] }).catch(() => null);
                    }
                    return; // Exit here so it doesn't destroy the player
                }
            } catch (error) {
                console.error('[LAVALINK] Autoplay fetch error:', error);
            }
        }

        // Default standard behavior (Autoplay is OFF or failed to find a track)
        if (textChannel) {
            const endEmbed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription('🛸 **Queue ended.** Leaving the voice channel.');
            
            textChannel.send({ embeds: [endEmbed] }).catch(() => null);
        }

        await player.destroy();
    });

    // ⏰ Auto-Leave System
    client.on("voiceStateUpdate", async (oldState, newState) => {
        if (!client.voiceTimeouts) client.voiceTimeouts = new Map();

        const guildId = oldState.guild.id;
        const player = client.lavalink.getPlayer(guildId);

        if (!player || !player.voiceChannelId) {
            if (client.voiceTimeouts.has(guildId)) {
                clearTimeout(client.voiceTimeouts.get(guildId));
                client.voiceTimeouts.delete(guildId);
            }
            return;
        }

        const voiceChannel = oldState.guild.channels.cache.get(player.voiceChannelId);
        if (!voiceChannel) return;

        // Filter to ensure we only look for actual human members
        const humanMembers = voiceChannel.members.filter(m => !m.user.bot);

        if (humanMembers.size === 0) {
            if (!client.voiceTimeouts.has(guildId)) {
                const timeout = setTimeout(async () => {
                    try {
                        const textChannel = client.channels.cache.get(player.textChannelId);
                        if (textChannel) {
                            const leaveEmbed = new EmbedBuilder()
                                .setColor('#ffffff')
                                .setDescription('**Leaving the voice channel due to inactivity.**');
                            
                            textChannel.send({ embeds: [leaveEmbed] }).catch(() => null);
                        }

                        await player.destroy();
                        client.voiceTimeouts.delete(guildId);
                    } catch (error) {
                        console.error(`[VOICE ERROR] Problem executing auto-leave for guild ${guildId}:`, error);
                    }
                }, 3 * 60 * 1000); // 3 minutes

                client.voiceTimeouts.set(guildId, timeout);
            }
        } else {
            if (client.voiceTimeouts.has(guildId)) {
                clearTimeout(client.voiceTimeouts.get(guildId));
                client.voiceTimeouts.delete(guildId);
            }
        }
    });
};