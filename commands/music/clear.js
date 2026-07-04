const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'clear',
    aliases: ['cls', 'clearqueue'],
    category: 'music',
    description: 'Clears all upcoming songs with a secure interactive button confirmation step.',
    async execute(client, message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ You must be connected to a voice channel to use this command.');

        const player = client.lavalink.getPlayer(message.guild.id);
        if (!player) return message.reply('❌ There is no active music player running on this server.');

        // 🔒 Guardrail: Ensure user is in the same voice channel
        if (voiceChannel.id !== player.voiceChannelId) {
            return message.reply('❌ You must be in the same voice channel as Yoru to use this command.');
        }

        const tracksCount = player.queue.tracks?.length || 0;
        if (tracksCount === 0) return message.reply('❌ The upcoming playback queue is already completely clear.');

        const embedColor = client.config.color || '#ffffff';

        // 🔘 Construct the choice confirmation button layout row
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_clear')
                .setLabel('Clear Queue')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_clear')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary)
        );

        const promptEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setDescription(`⚠️ Are you sure you want to clear **${tracksCount}** tracks from the upcoming queue?`);

        const promptMessage = await message.reply({
            embeds: [promptEmbed],
            components: [actionRow]
        });

        // 🧭 Deploy component tracker restricted to a 20-second threshold
        const collector = promptMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 20000
        });

        collector.on('collect', async (interaction) => {
            // Guardrail: Only let the execution author toggle the operation state
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: '❌ Only the user who initiated the clear sequence can handle this choice.',
                    ephemeral: true
                });
            }

            // Stop the collector immediately since a decision was explicitly made
            collector.stop('answered');

            if (interaction.customId === 'confirm_clear') {
                // Clear all upcoming items from the queue array
                player.queue.splice(0, tracksCount);

                const successEmbed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setDescription(`Successfully cleared **${tracksCount}** tracks from the upcoming queue.`);

                return await interaction.update({ embeds: [successEmbed], components: [] });
            } 
            
            if (interaction.customId === 'cancel_clear') {
                const cancelEmbed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setDescription('🛑 queue clear cancelled.');

                return await interaction.update({ embeds: [cancelEmbed], components: [] });
            }
        });

        // ⏳ Cleanup: Automatically run if the collector times out with no user inputs
        collector.on('end', async (collected, reason) => {
            if (reason === 'answered') return;

            const timeoutRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('c1').setLabel('Clear Queue').setStyle(ButtonStyle.Danger).setDisabled(true),
                new ButtonBuilder().setCustomId('c2').setLabel('Cancel').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );

            const timeoutEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription('Took too long no changes were made in queue.');

            try {
                await promptMessage.edit({ embeds: [timeoutEmbed], components: [timeoutRow] });
            } catch (err) {
                // Prevents crashes if the message was deleted before expiration completed
            }
        });
    }
};