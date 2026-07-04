const Yoru = require('./structure/yoru.js');

// Boot up this shard instance
new Yoru();

// Global catch-alls to ensure one faulty shard doesn't crash your entire cluster
process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRASH SHIELD] Unhandled Rejection:', promise, 'Reason:', reason);
});
process.on('uncaughtException', (err, origin) => {
    console.error('[CRASH SHIELD] Uncaught Exception:', err, 'Origin:', origin);
});