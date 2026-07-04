require('dotenv').config();
const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./index.js', {
    token: process.env.TOKEN,
    totalShards: 'auto', 
    respawn: true,
});

manager.on('shardCreate', (shard) => {
    console.log(`[MASTER] 🚀 Shard #${shard.id} spun up safely.`);
});

manager.spawn().catch(err => console.error('[MASTER ERROR] Sharding manager failed:', err));