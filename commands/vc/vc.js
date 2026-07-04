const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'vc',
    aliases: ['voice'],
    category: 'vc',
    description: 'Complete voice channel administration suite.',
    async execute(client, message, args) {
        const embedColor = client.config?.color || '#ffffff';
        const subCommand = args[0]?.toLowerCase();

        const sendResponse = (text, isError = false) => message.reply({
            embeds: [new EmbedBuilder().setColor(isError ? '#ff0000' : embedColor).setDescription(text)]
        });

        if (!subCommand) return sendResponse('❌ Command not found. Use `;help vc`', true);

        const botMember = message.guild.members.me;
        const myChannel = message.member.voice.channel;
        
        const hasPerms = (perm) => {
            if (!botMember.permissions.has(perm)) {
                sendResponse('❌ The bot lacks the required permissions.', true);
                return false;
            }
            if (!message.member.permissions.has(perm)) {
                sendResponse('❌ You need the required permissions to perform this action.', true);
                return false;
            }
            return true;
        };

        const getTarget = () => message.mentions.members.first() || message.guild.members.cache.get(args[1]);
        const findChannel = (input) => message.guild.channels.cache.find(c => 
            (c.id === input || c.name.toLowerCase() === input.toLowerCase()) && c.type === ChannelType.GuildVoice
        );

        switch (subCommand) {
            case 'kick': {
                if (!hasPerms(PermissionFlagsBits.MoveMembers)) return;
                const target = getTarget();
                if (!target?.voice.channel) return sendResponse('❌ User not found or not in a VC.', true);
                await target.voice.setChannel(null);
                return sendResponse(`Disconnected **${target.user.username}**.`);
            }

            case 'mute':
            case 'unmute': {
                if (!hasPerms(PermissionFlagsBits.MuteMembers)) return;
                const target = getTarget();
                if (!target?.voice.channel) return sendResponse('❌ User not found or not in a VC.', true);
                await target.voice.setMute(subCommand === 'mute');
                return sendResponse(`${subCommand === 'mute' ? 'Muted' : 'Unmuted'} **${target.user.username}**.`);
            }

            case 'deafen':
            case 'undeafen': {
                if (!hasPerms(PermissionFlagsBits.DeafenMembers)) return;
                const target = getTarget();
                if (!target?.voice.channel) return sendResponse('❌ User not found or not in a VC.', true);
                await target.voice.setDeaf(subCommand === 'deafen');
                return sendResponse(`${subCommand === 'deafen' ? 'Deafened' : 'Undeafened'} **${target.user.username}**.`);
            }

            case 'move':
            case 'drag': {
                if (!hasPerms(PermissionFlagsBits.MoveMembers)) return;
                const target = getTarget();
                const dest = findChannel(args.slice(2).join(' '));
                if (!target || !dest) return sendResponse('❌ Usage: `;vc move [@user] [Channel Name/ID]`', true);
                await target.voice.setChannel(dest);
                return sendResponse(`Moved **${target.user.username}** to **${dest.name}**.`);
            }

            case 'pull': {
                if (!myChannel) return sendResponse('❌ You must be connected to a voice channel.', true);
                if (!hasPerms(PermissionFlagsBits.MoveMembers)) return;
                const target = getTarget();
                if (!target?.voice.channel) return sendResponse('❌ User not found or not in a VC.', true);
                await target.voice.setChannel(myChannel);
                return sendResponse(`Pulled **${target.user.username}** to **${myChannel.name}**.`);
            }

            case 'limit': {
                if (!hasPerms(PermissionFlagsBits.ManageChannels) || !myChannel) return;
                const limit = parseInt(args[1]);
                if (isNaN(limit) || limit < 0 || limit > 99) return sendResponse('❌ Please specify a number between 0 and 99.', true);
                await myChannel.setUserLimit(limit);
                return sendResponse(`Set **${myChannel.name}** limit to ${limit === 0 ? 'Unlimited' : limit}.`);
            }

            case 'lock':
            case 'unlock': {
                if (!myChannel || !hasPerms(PermissionFlagsBits.ManageChannels)) return;
                await myChannel.permissionOverwrites.edit(message.guild.roles.everyone, { Connect: subCommand === 'lock' ? false : null });
                return sendResponse(`${subCommand === 'lock' ? 'Locked' : 'Unlocked'} **${myChannel.name}**.`);
            }

            case 'private':
            case 'public': {
                if (!myChannel || !hasPerms(PermissionFlagsBits.ManageChannels)) return;
                await myChannel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: subCommand === 'private' ? false : null });
                return sendResponse(`Made **${myChannel.name}** ${subCommand === 'private' ? 'private' : 'public'}.`);
            }

            case 'muteall':
            case 'unmuteall': {
                if (!myChannel || !hasPerms(PermissionFlagsBits.MuteMembers)) return;
                const state = subCommand === 'muteall';
                const members = [...myChannel.members.values()].filter(m => !m.user.bot);
                await Promise.all(members.map(m => m.voice.setMute(state).catch(() => null)));
                return sendResponse(`${state ? 'Muted' : 'Unmuted'} ${members.length} members in **${myChannel.name}**.`);
            }

            case 'deafenall':
            case 'undeafenall': {
                if (!myChannel || !hasPerms(PermissionFlagsBits.DeafenMembers)) return;
                const state = subCommand === 'deafenall';
                const members = [...myChannel.members.values()].filter(m => !m.user.bot);
                await Promise.all(members.map(m => m.voice.setDeaf(state).catch(() => null)));
                return sendResponse(`${state ? 'Deafened' : 'Undeafened'} ${members.length} members in **${myChannel.name}**.`);
            }

            case 'moveall':
            case 'dragall': {
                if (!myChannel || !hasPerms(PermissionFlagsBits.MoveMembers)) return;
                const dest = findChannel(args.slice(1).join(' '));
                if (!dest) return sendResponse('❌ Target channel not found.', true);
                const members = [...myChannel.members.values()];
                await Promise.all(members.map(m => m.voice.setChannel(dest).catch(() => null)));
                return sendResponse(`Moved ${members.length} members to **${dest.name}**.`);
            }

            case 'pullall': {
                if (!myChannel || !hasPerms(PermissionFlagsBits.MoveMembers)) return;
                const otherChannels = message.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice && c.id !== myChannel.id);
                const allMembers = [];
                for (const channel of otherChannels.values()) {
                    allMembers.push(...channel.members.values());
                }
                await Promise.all(allMembers.map(m => m.voice.setChannel(myChannel).catch(() => null)));
                return sendResponse(`Pulled ${allMembers.length} members into **${myChannel.name}**.`);
            }

            default:
                return sendResponse('❌ Command not found. Use `;help vc`', true);
        }
    }
};