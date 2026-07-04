const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pause',
    category: 'music',
    description: 'Suspends track audio processing operations.',
    async execute(client, message, args) {
        const player = client.lavalink.getPlayer(message.guild.id);

        if (!player || !player.queue.current) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ The queue is empty.')]
            });
        }

        if (!message.member.voice.channel || message.member.voice.channel.id !== player.voiceChannelId) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ You must be in the same voice channel as Yoru to pause the music')]
            });
        }

        if (player.paused) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ The music is already paused.')]
            });
        }

        await player.pause(true);

        message.reply({
            embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('⏸️ music paused.')]
        });
    }
};