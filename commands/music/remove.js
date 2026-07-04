const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'remove',
    aliases: ['rm', 'delete'],
    category: 'music',
    description: 'Removes a specific track from the queue using its listing number.',
    async execute(client, message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ You must be connected to a voice channel to use this command.');

        const player = client.lavalink.getPlayer(message.guild.id);
        if (!player) return message.reply('❌ There is no active music player running on this server.');

        // 🔒 Guardrail: Ensure user is in the same voice channel
        if (voiceChannel.id !== player.voiceChannelId) {
            return message.reply('❌ You must be in the same voice channel as Yoru to use this command.');
        }

        const tracks = player.queue.tracks || [];
        if (tracks.length === 0) return message.reply('❌ The playback queue is currently empty.');

        // Validate user input arguments
        if (!args[0]) return message.reply('❌ Please specify the track number you want to remove (e.g., `$remove 3`).');

        const targetIndex = parseInt(args[0], 10) - 1; // Convert 1-based UI indexing to 0-based array index

        if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= tracks.length) {
            return message.reply(`❌ Invalid track number. Please choose a number between **1** and **${tracks.length}**.`);
        }

        // Capture track data for the feedback embed before extraction
        const trackToRemove = tracks[targetIndex];

        // Safely extract the single track from the lavalink-client queue array
        player.queue.splice(targetIndex, 1);

        const embedColor = client.config.color || '#ffffff';
        const statusEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setDescription(`Removed **[${trackToRemove.info.title}](${trackToRemove.info.uri || '#'})** from the queue.`);

        return message.reply({ embeds: [statusEmbed] });
    }
};