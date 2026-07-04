const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady, // Resolves to 'clientReady', wiping out the deprecation alert
    once: true,
    async execute(client) {
        console.log(`[YORU] ⛩️  ${client.user.tag} is online across all operational systems.`);
        
        // Connect and initialize your Lavalink audio nodes
        try {
            await client.lavalink.init({ ...client.user });
        } catch (err) {
            console.error('[LAVALINK ERR] Audio Engine initialization error:', err.message);
        }

        // 🎭 Production-Grade Presence Rotating System
        let activityIndex = 0;
        
        const updateBotPresence = () => {
            const serverCount = client.guilds.cache.size;
            const defaultPrefix = client.config.prefix || ';';

            // Define your rotating statuses here
            const activities = [
                { 
                    name: `🎵 music in ${serverCount} servers`, 
                    type: ActivityType.Listening 
                },
                { 
                    name: `${defaultPrefix}help | Mention me for info!`, 
                    type: ActivityType.Playing 
                },
                { 
                    name: `FASTER THAN LIGHT`, 
                    type: ActivityType.Listening 
                }
            ];

            const currentActivity = activities[activityIndex];

            client.user.setPresence({
                activities: [currentActivity],
                status: 'idle' // Options: 'online', 'idle', 'dnd', 'invisible'
            });

            // Move seamlessly to the next status row
            activityIndex = (activityIndex + 1) % activities.length;
        };

        // Fire off the initial presence mapping immediately upon successful gateway authorization
        updateBotPresence();

        // Rotate status smoothly every 5 minutes (Scale-safe execution interval)
        setInterval(updateBotPresence, 5 * 60 * 1000);
    }
};