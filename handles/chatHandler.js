const { Events, EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const prefix = client.db.getPrefix(guildId);

        // 🔍 Create a regex matching the bot's mention at the very beginning of the string
        const mentionRegex = new RegExp(`^<@!?${client.user.id}>`);
        const hasMention = mentionRegex.test(message.content);

        let usedPrefix = '';

        if (hasMention) {
            // Extract the exact mention format used (<@id> or <@!id>)
            const match = message.content.match(mentionRegex);
            usedPrefix = match[0];

            // Case A: The message is ONLY the ping -> Send the info card
            if (message.content.trim() === usedPrefix) {
                const pingEmbed = new EmbedBuilder()
                    .setColor(client.config.color || '#ffffff')
                    .setDescription(`👋 My prefix for this server is \`${prefix}\`\nDouble tip: You can also use my mention as a prefix! Example: \`<@${client.user.id}> play\``);
                
                return message.reply({ embeds: [pingEmbed] }).catch(() => null);
            }
        } else if (message.content.startsWith(prefix)) {
            // Case B: The message starts with the server's standard custom prefix
            usedPrefix = prefix;
        } else {
            // Case C: Neither prefix nor mention was used -> Stop processing
            return;
        }

        // ✂️ Slice off whichever prefix was used, then grab command and arguments
        const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || 
                        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        try {
            await command.execute(client, message, args);
        } catch (error) {
            console.error(`[COMMAND ERROR] Failure encountered in command "${commandName}":`, error);
            message.reply('❌ There was an error executing this command.').catch(() => null);
        }
    });
};