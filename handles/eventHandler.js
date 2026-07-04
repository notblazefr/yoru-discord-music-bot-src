const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (!event.name || !event.execute) {
            console.warn(`[EVENT WARNING] Skipping ${file} due to a missing name or execution structure.`);
            continue;
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    }

    console.log(`[HANDLER] 📑 eventHandler processed ${eventFiles.length} gateway events.`);
};