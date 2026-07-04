const { Client, GatewayIntentBits, Collection } = require('discord.js');
const path = require('path');
const DatabaseManager = require('./database'); // 🗄️ Import our new SQLite DB manager
require('dotenv').config();

class Yoru extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.commands = new Collection();
        this.voiceTimeouts = new Map();
        this.config = require('../config.json');

        // Instantiate the dedicated SQLite manager layer
        this.db = new DatabaseManager(this);

        this.boot();
    }

    async boot() {
        try {
            // Orchestrate core framework systems
            require(path.join(__dirname, '../handles/lavalinkHandler'))(this);
            require(path.join(__dirname, '../handles/eventHandler'))(this); 
            require(path.join(__dirname, '../handles/CmdHandler'))(this);
            require(path.join(__dirname, '../handles/chatHandler'))(this);
        } catch (error) {
            console.error('❌ [CRITICAL] Failed to wire up application handles:', error);
            throw error;
        }

        await this.login(process.env.TOKEN);
    }
}

module.exports = Yoru;