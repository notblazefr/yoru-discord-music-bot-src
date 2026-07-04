const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'play',
    aliases: ['p', 'search'],
    category: 'music',
    description: 'Streams audio content directly into your voice channel connection.',
    async execute(client, message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ You must be connected to an voice channel to use this command.');

        const query = args.join(' ');
        if (!query) return message.reply('❌ Provide a song name or song URL.');

        let player = client.lavalink.getPlayer(message.guild.id);
        
        // 🔒 Guardrail: Ensure the user is in the same voice channel if Yoru is already connected
        if (player && voiceChannel.id !== player.voiceChannelId) {
            return message.reply('❌ You must be in the same voice channel as Yoru to use this command.');
        }
        
        if (!player) {
            player = await client.lavalink.createPlayer({
                guildId: message.guild.id,
                voiceChannelId: voiceChannel.id,
                textChannelId: message.channel.id,
                selfDeaf: true,
                volume: 80
            });
        }

        if (!player.connected) await player.connect();

        const res = await player.search({ query }, message.author);
        
        if (!res || !res.tracks || res.tracks.length === 0) {
            return message.reply('❌ Cannot find any results for your query.');
        }

        const embedColor = client.config.color || '#ffffff';
        const statusEmbed = new EmbedBuilder().setColor(embedColor);

        if (res.loadType === 'playlist') {
            for (const track of res.tracks) {
                await player.queue.add(track);
            }
            statusEmbed.setDescription(`📥 Added playlist **${res.playlist?.name || 'Collection'}** (\`${res.tracks.length}\` songs) to the queue.`);
            message.reply({ embeds: [statusEmbed] });
        } else {
            const track = res.tracks[0];
            await player.queue.add(track);
            
            statusEmbed.setDescription(`➕ Added [${track.info.title}](${track.info.uri || '#'}) to the queue.`);
            message.reply({ embeds: [statusEmbed] });
        }

        if (!player.playing && !player.paused) await player.play();
    }
};