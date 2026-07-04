const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'skip',
    aliases: ['s', 'next'],
    category: 'music',
    description: 'Forces playback advancement to the next index track.',
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
                embeds: [new EmbedBuilder().setColor(embedColor).setDescription('❌ You must be in the same voice channel as Yoru to skip the current track.')]
            });
        }

        const isAutoplay = player.get('autoplay');

        // 🛡️ Guardrail: Check if the queue is empty to prevent RangeError crashes
        if (!player.queue.tracks.length) {
            if (isAutoplay) {
                // Autoplay is ON: Stopping the track forces queueEnd, which seamlessly fetches the next radio song
                await player.stopPlaying();
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(embedColor).setDescription('⏭️ **Skipped!** Autoplay is fetching the next track...')]
                });
            } else {
                // Autoplay is OFF: Prevent skipping into the void
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(embedColor).setDescription('❌ The queue is empty! There is nothing left to skip.')]
                });
            }
        }

        // Standard execution if there are upcoming songs in the queue array
        await player.skip();

        return message.reply({
            embeds: [new EmbedBuilder().setColor(embedColor).setDescription('⏭️ Skipped the current track.')]
        });
    }
};