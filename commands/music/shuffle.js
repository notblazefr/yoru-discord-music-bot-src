const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shuffle',
    aliases: ['mix', 'shuff'],
    category: 'music',
    description: 'Randomizes the order of all upcoming tracks in the buffer.',
    async execute(client, message, args) {
        const player = client.lavalink.getPlayer(message.guild.id);

        if (!player || !player.queue.current) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ The queue is empty.')]
            });
        }

        if (!message.member.voice.channel || message.member.voice.channel.id !== player.voiceChannelId) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ You must be in the same voice channel as Yoru to shuffle the queue.')]
            });
        }

        // Validate if there are actually enough tracks to perform a random sort
        if (!player.queue.tracks || player.queue.tracks.length < 2) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ There are not enough songs in the queue to shuffle.')]
            });
        }

        await player.queue.shuffle();

        message.reply({
            embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('🔀 Shuffled the queue successfully.')]
        });
    }
};