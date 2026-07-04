const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'autoplay',
    aliases: ['ap', 'infinite'],
    category: 'music',
    description: 'Toggles infinite autoplay mode when the music playlist ends.',
    async execute(client, message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ You must be connected to a voice channel to use this command.');

        const player = client.lavalink.getPlayer(message.guild.id);
        if (!player) return message.reply('❌ There is no active music player running on this server.');

        // 🔒 Guardrail: Ensure user is in the same voice channel
        if (voiceChannel.id !== player.voiceChannelId) {
            return message.reply('❌ You must be in the same voice channel as Yoru to use this command.');
        }

        // Toggle the current autoplay state (defaults to false if undefined)
        const currentSetting = player.get('autoplay') || false;
        const newSetting = !currentSetting;
        player.set('autoplay', newSetting);

        const embedColor = client.config.color || '#ffffff';
        const statusEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setDescription(
                newSetting 
                    ? `🔄 **Autoplay enabled by ${message.author}**` 
                    : `🛑 **Autoplay disabled by ${message.author}**`
            );

        return message.reply({ embeds: [statusEmbed] });
    }
};