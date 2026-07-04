const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'volume',
    aliases: ['vol', 'v'],
    category: 'music',
    description: 'Adjusts or displays the current music streaming player volume intensity.',
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

        // Path A: Display current volume if no argument is passed
        if (!args[0]) {
            statusEmbed.setDescription(`Current volume: **${player.volume}%**`);
            return message.reply({ embeds: [statusEmbed] });
        }

        const volumeAmount = parseInt(args[0], 10);

        // Validation bounds check
        if (isNaN(volumeAmount) || volumeAmount < 0 || volumeAmount > 150) {
            return message.reply('❌ Please provide a valid numerical value between **0** and **150**.');
        }

        // Apply volume directly to the Lavalink core node connection
        await player.setVolume(volumeAmount);

        statusEmbed.setDescription(`Volume set to: **${volumeAmount}%**`);
        return message.reply({ embeds: [statusEmbed] });
    }
};