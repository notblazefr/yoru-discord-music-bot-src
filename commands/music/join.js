const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'join',
    aliases: ['connect', 'j'],
    category: 'music',
    description: 'Connects Yoru to your current voice channel.',
    async execute(client, message, args) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ You must be in a voice channel first.')]
            });
        }

        let player = client.lavalink.getPlayer(message.guild.id);

        if (player) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor('#ffffff').setDescription('❌ Yoru is already connected to a voice channel.')]
            });
        }

        // Initialize the voice player node mapping without pushing any audio track payloads
        player = await client.lavalink.createPlayer({
            guildId: message.guild.id,
            voiceChannelId: voiceChannel.id,
            textChannelId: message.channel.id,
            selfDeaf: true,
            volume: 100
        });

        await player.connect();

        message.reply({
            embeds: [new EmbedBuilder().setColor('#ffffff').setDescription(`🔊 Joined **${voiceChannel.name}**.`)]
        });
    }
};