const { AttachmentBuilder } = require('discord.js');
const { initializeFonts, Bloom } = require('musicard');

// Initialize the font registry once when the utility module is imported
initializeFonts();

/**
 * Generates a visual audio profile card using the musicard framework.
 * @param {Object} track - The active Lavalink track data profile.
 * @param {string} durationDisplay - Formatted string representing track length (e.g., "03:45" or "Live").
 * @returns {Promise<AttachmentBuilder>} - Compiled native Discord image attachment.
 */
async function generateMusicCard(track, durationDisplay) {
    const albumArtwork = track.info.artworkUrl || "https://i.imgur.com/b6b5Mux.png";

    const cardBuffer = await Bloom({
        trackName: track.info.title,
        artistName: track.info.author || 'Unknown Artist',
        albumArt: albumArtwork,
        timeAdjust: {
            timeStart: "0:00",
            timeEnd: durationDisplay,
        },
        progressBar: 0, // Keeps the layout initial load tracking at baseline
        styleConfig: {
            backgroundColor: "#111116", // Premium deep-dark container setting
        }
    });

    return new AttachmentBuilder(cardBuffer, { name: 'yoru-player.png' });
}

module.exports = { generateMusicCard };