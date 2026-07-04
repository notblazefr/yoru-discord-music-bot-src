const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    aliases: ['latency', 'pong'],
    category: 'general',
    description: 'Check the responsiveness parameters of the shard framework.',
    async execute(client, message, args) {
        const embedColor = client.config?.color || '#ffffff';

        // ping msg
        const msg = await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(embedColor)
                    .setDescription('🏓 Pinging system gateway...')
            ]
        });

        const latency = msg.createdTimestamp - message.createdTimestamp;

        // ping embed
        const pingEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '🛰️ API Latency', value: `\`${client.ws.ping}ms\``, inline: true },
                { name: '⏱️ Roundtrip', value: `\`${latency}ms\``, inline: true }
            );

        await msg.edit({ embeds: [pingEmbed] });
    }
};