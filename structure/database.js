const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs'); // 📁 Native file system module to manage folders

class DatabaseManager {
    constructor(client) {
        this.client = client;
        this.cache = new Map(); // 🧠 In-memory high-speed cache layer

        // 🗺️ Define the path to your isolated data directory
        const dataDir = path.join(__dirname, '../data');
        const dbPath = path.join(dataDir, 'prefix.db');

        // Ensure the directory exists before SQLite tries to spin up files
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Initialize SQLite file directly inside the safe directory
        this.db = new Database(dbPath);

        // 🚀 Enable WAL mode safely inside the subfolder
        this.db.pragma('journal_mode = WAL');

        // Build the table schema layout
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS server_prefixes (
                guild_id TEXT PRIMARY KEY,
                prefix TEXT NOT NULL
            )
        `).run();

        // 🏎️ Compiled statements for performance optimization
        this.getStmt = this.db.prepare('SELECT prefix FROM server_prefixes WHERE guild_id = ?');
        this.setStmt = this.db.prepare('INSERT OR REPLACE INTO server_prefixes (guild_id, prefix) VALUES (?, ?)');
        this.deleteStmt = this.db.prepare('DELETE FROM server_prefixes WHERE guild_id = ?');
    }

    /**
     * Resolves a server's prefix using memory cache or SQLite instantly
     */
    getPrefix(guildId) {
        if (this.cache.has(guildId)) {
            return this.cache.get(guildId);
        }

        const row = this.getStmt.get(guildId);
        const prefix = row ? row.prefix : (this.client.config.prefix || ';');
        
        this.cache.set(guildId, prefix);
        return prefix;
    }

    /**
     * Updates or sets a custom prefix for a guild
     */
    setPrefix(guildId, newPrefix) {
        this.setStmt.run(guildId, newPrefix);
        this.cache.set(guildId, newPrefix);
        return true;
    }

    /**
     * Resets a custom prefix back to configuration defaults
     */
    resetPrefix(guildId) {
        this.deleteStmt.run(guildId);
        this.cache.set(guildId, this.client.config.prefix || ';');
        return true;
    }
}

module.exports = DatabaseManager;