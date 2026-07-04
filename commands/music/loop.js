const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'loop',
    aliases: ['repeat', 'lp'],
    category: 'music',
    description: 'Toggles repeat mode on or off for the currently playing track.',
    async execute(client, message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ You must be connected to a voice channel to use this command.');

        const player = client.lavalink.getPlayer(message.guild.id);
        if (!player) return message.reply('❌ There is no active music player running on this server.');

        // 🔒 Guardrail: Ensure user is in the same voice channel
        if (voiceChannel.id !== player.voiceChannelId) {
            return message.reply('❌ You must be in the same voice channel as Yoru to use this command.');
        }

        const embedColor = client.config.color || '#ffffff';
        const statusEmbed = new EmbedBuilder().setColor(embedColor);

        // Toggle logic: If it's already looping the track, turn it off. Otherwise, turn track loop on.
        const targetMode = player.repeatMode === 'track' ? 'off' : 'track';
        await player.setRepeatMode(targetMode);

        // Feedback messaging based on the new state
        if (targetMode === 'track') {
            statusEmbed.setDescription('Loop enabled.');
        } else {
            statusEmbed.setDescription('Loop disabled.');
        }

        return message.reply({ embeds: [statusEmbed] });
    }
};