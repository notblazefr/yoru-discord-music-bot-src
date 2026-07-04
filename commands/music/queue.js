const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

// ✂️ Premium text clamping utility to protect layout wrapping
const truncateTitle = (title, maxLen = 42) => {
    if (!title) return 'Unknown Track';
    return title.length > maxLen ? title.substring(0, maxLen - 3) + '...' : title;
};

module.exports = {
    name: 'queue',
    aliases: ['q'],
    category: 'music',
    description: 'Displays the queued playlist data stream with interactive page buttons.',
    async execute(client, message, args) {
        const player = client.lavalink.getPlayer(message.guild.id);
        
        if (!player || !player.queue.current) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffffff')
                        .setDescription('❌ There is no active music streaming player running on this server.')
                ]
            });
        }

        const currentTrack = player.queue.current;
        const tracks = player.queue.tracks || [];

        // Pagination Math Parameters
        const tracksPerPage = 10;
        const totalPages = Math.ceil(tracks.length / tracksPerPage) || 1;
        let currentPage = 0;

        // Dynamic Embed Compiler function
        const generateEmbed = (page) => {
            const cleanCurrentTitle = truncateTitle(currentTrack.info.title, 48);
            
            let queueDescription = `🎵 **Now Streaming:**\n↳ \`${cleanCurrentTitle}\` \`[${currentTrack.requester?.username || 'System'}]\`\n`;

            if (tracks.length > 0) {
                queueDescription += `\n⏳ **Upcoming Songs (Page ${page + 1}/${totalPages}):**\n`;
                
                const start = page * tracksPerPage;
                const end = start + tracksPerPage;
                const pageTracks = tracks.slice(start, end);

                for (let i = 0; i < pageTracks.length; i++) {
                    const cleanTrackTitle = truncateTitle(pageTracks[i].info.title, 40);
                    // 📐 padStart aligns single digits (01) perfectly with double digits (10)
                    const paddedIndex = String(start + i + 1).padStart(2, '0');
                    
                    queueDescription += `\`${paddedIndex}.\` ${cleanTrackTitle} \`[${pageTracks[i].requester?.username || 'Anon'}]\`\n`;
                }
            } else {
                queueDescription += `\n*The playback queue is currently empty.*`;
            }

            return new EmbedBuilder()
                .setColor('#ffffff')
                .setAuthor({ name: `${message.guild.name.toUpperCase()} AUDIO DIRECTORY`, iconURL: client.user.displayAvatarURL() })
                .setDescription(queueDescription)
                .setFooter({ text: `📊 Total Songs: ${tracks.length}  •  Page ${page + 1} of ${totalPages}` });
        };

        // Dynamic Component Row Builder function
        const generateButtons = (page) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('queue_prev')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('queue_next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === totalPages - 1)
            );
        };

        // Send baseline context payload (only load action rows if pages actually exceed 1)
        const componentsRow = totalPages > 1 ? [generateButtons(currentPage)] : [];
        const queueMessage = await message.reply({
            embeds: [generateEmbed(currentPage)],
            components: componentsRow
        });

        if (totalPages <= 1) return;

        // Deploy Component Event Collector (Lasts 60 seconds per invocation)
        const collector = queueMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: '❌ Only the person who typed the command can turn these pages.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'queue_prev') {
                if (currentPage > 0) currentPage--;
            } else if (interaction.customId === 'queue_next') {
                if (currentPage < totalPages - 1) currentPage++;
            }

            await interaction.update({
                embeds: [generateEmbed(currentPage)],
                components: [generateButtons(currentPage)]
            });
        });

        // Cleanup: Disable button objects when interaction times out
        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('d1').setLabel('◀️').setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId('d2').setLabel('▶️').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );

            try {
                await queueMessage.edit({ components: [disabledRow] });
            } catch (err) {
                // Suppresses errors if the user deletes the text message before the timeout completes
            }
        });
    }
};