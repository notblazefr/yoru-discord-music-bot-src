const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'prefix',
    aliases: ['setprefix', 'changeprefix'],
    execute: async (client, message, args) => {
        const guildId = message.guild.id;

        // perm check
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const noPerms = new EmbedBuilder()
                .setColor(client.config.color || '#ffffff')
                .setDescription('❌ You must have the **Administrator** permission to change the bot prefix.');
            return message.reply({ embeds: [noPerms] });
        }

        const currentPrefix = client.db.getPrefix(guildId);

        // mention check
        if (!args[0]) {
            const infoEmbed = new EmbedBuilder()
                .setColor(client.config.color || '#ffffff')
                .setDescription(`⚙️ The current prefix for this server is: \`${currentPrefix}\`\n\nTo change it, use:\n\`${currentPrefix}prefix [new_prefix]\`\n\nTo reset to default, use:\n\`${currentPrefix}prefix reset\``);
            return message.reply({ embeds: [infoEmbed] });
        }

        const newPrefix = args[0].trim();

        // prefix change
        if (newPrefix.toLowerCase() === 'reset') {
            client.db.resetPrefix(guildId);
            const resetEmbed = new EmbedBuilder()
                .setColor(client.config.color || '#ffffff')
                .setDescription(`✅ Prefix has been reset to default: \`${client.config.prefix || ';'}\``);
            return message.reply({ embeds: [resetEmbed] });
        }

        // validation
        if (newPrefix.length > 5) {
            const validationEmbed = new EmbedBuilder()
                .setColor(client.config.color || '#ffffff')
                .setDescription('❌ The prefix length cannot exceed **5** characters.');
            return message.reply({ embeds: [validationEmbed] });
        }

        // update prefix
        client.db.setPrefix(guildId, newPrefix);

        const successEmbed = new EmbedBuilder()
            .setColor(client.config.color || '#ffffff')
            .setDescription(`🚀 Success! The custom prefix for this server has been updated to: \`${newPrefix}\``);
        
        return message.reply({ embeds: [successEmbed] });
    }
};