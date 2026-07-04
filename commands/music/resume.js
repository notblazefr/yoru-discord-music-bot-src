const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'resume',
    aliases: ['unpause', 'res'],
    category: 'music',
    description: 'Resumes a suspended audio stream pipeline.',
    async execute(client, message, args) {
        const player = client.lavalink.getPlayer(message.guild.id);

        if (!player || !player.queue.current) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ The queue is empty.')]
            });
        }

        if (!message.member.voice.channel || message.member.voice.channel.id !== player.voiceChannelId) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ You must be in the same voice channel as Yoru to resume the music.')]
            });
        }

        if (!player.paused) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ The music is already playing.')]
            });
        }

        await player.resume();

        message.reply({
            embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('▶️ music resumed.')]
        });
    }
};