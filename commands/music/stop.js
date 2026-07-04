const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'stop',
    aliases: ['leave', 'disconnect', 'dc'],
    category: 'music',
    description: 'Terminates active audio instances and safely severs the voice link.',
    async execute(client, message, args) {
        const embedColor = client.config?.color || '#ffffff';
        const player = client.lavalink.getPlayer(message.guild.id);

        if (!player) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(embedColor).setDescription('❌ There are no active playback sessions in this guild.')]
            });
        }

        if (!message.member.voice.channel || message.member.voice.channel.id !== player.voiceChannelId) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(embedColor).setDescription('❌ You must be in the same voice channel as Yoru to stop the music.')]
            });
        }

        await player.destroy();

        message.reply({
            embeds: [new EmbedBuilder().setColor(embedColor).setDescription('🛑 Stopped the music and disconnected from the voice channel.')]
        });
    }
};