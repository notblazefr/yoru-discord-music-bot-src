const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const categories = fs.readdirSync(commandsPath);

    let count = 0;

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        
        // Ensure we are only reading directories (music, general, admin, dev)
        if (!fs.lstatSync(categoryPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(categoryPath, file);
            const command = require(filePath);

            if (!command.name || !command.execute) {
                console.warn(`[CMD WARNING] Skipping file ${category}/${file} due to missing name or execution layout.`);
                continue;
            }

            // Map the command module to Yoru's global command Collection
            client.commands.set(command.name, command);
            count++;
        }
    }

    console.log(`[HANDLER] ⚔️  CmdHandler cached ${count} operational prefix commands.`);
};