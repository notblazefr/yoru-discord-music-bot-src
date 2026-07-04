<div align="center">

# 🌙 Yoru Discord Music Bot

*A powerful Discord music bot source built with **Discord.js v15** and **Lavalink**, featuring music playback, voice channel moderation, and a clean, beginner-friendly codebase.*

![Node.js](https://img.shields.io/badge/Node.js-v24.17.0-339933?style=for-the-badge\&logo=node.js)
![Discord.js](https://img.shields.io/badge/Discord.js-v15-5865F2?style=for-the-badge\&logo=discord)
![Lavalink](https://img.shields.io/badge/Lavalink-Enabled-orange?style=for-the-badge)
![Prefix Commands](https://img.shields.io/badge/Commands-Prefix-blue?style=for-the-badge)

</div>

---

## ✨ Features

### 🎵 Music

* Play songs from supported sources
* Queue management
* Skip, Pause, Resume & Stop
* Shuffle queue
* Loop modes
* Autoplay
* Volume control
* Remove songs
* Clear queue
* Now Playing
* Join voice channel

### 🎤 Voice Channel Moderation

* Voice channel management commands
* Easy moderation utilities

### ⚡ General

* Ping command
* Help command
* Prefix command
* Bot information
* Modular command handler
* Event handler
* Lavalink handler
* Sharding support

---

# 📁 Project Structure

```text
│   .env
│   config.json
│   index.js
│   package.json
│   shards.js
│
├───commands
│   ├───general
│   │       botinfo.js
│   │       help.js
│   │       ping.js
│   │       prefix.js
│   │
│   ├───music
│   │       autoplay.js
│   │       clear.js
│   │       join.js
│   │       loop.js
│   │       nowplaying.js
│   │       pause.js
│   │       play.js
│   │       queue.js
│   │       remove.js
│   │       resume.js
│   │       shuffle.js
│   │       skip.js
│   │       stop.js
│   │       volume.js
│   │
│   └───vc
│           vc.js
│
├───data
│
├───events
│       ready.js
│
├───handles
│       chatHandler.js
│       CmdHandler.js
│       eventHandler.js
│       lavalinkHandler.js
│
├───structure
│       database.js
│       yoru.js
│
└───utils
        musicCard.js
```

---

# 🚀 Requirements

* Node.js **v24.17.0**
* Discord.js **v15**
* A running Lavalink server
* Discord Bot Token

---

# ⚙️ Environment Variables

Create a `.env` file using the following template:

```env
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here

LAVALINK_HOST=your_lavalink_host_here
LAVALINK_PORT=your_lavalink_port_here
LAVALINK_PASSWORD=your_lavalink_password_here
LAVALINK_SECURE=true
```

---

# 📦 Installation

Clone the repository

```bash
git clone https://github.com/notblazefr/yoru-discord-music-bot-src.git
```

Move into the project

```bash
cd yoru-discord-music-bot-src
```

Install dependencies

```bash
npm install
```

Configure your `.env` file and `config.json`.

---

# ▶️ Starting the Bot

**Without sharding**

```bash
node index
```

**With sharding (Recommended)**

```bash
node shards
```

---

# 📚 Commands

### 🎵 Music

* play
* join
* queue
* nowplaying
* pause
* resume
* stop
* skip
* shuffle
* loop
* autoplay
* remove
* clear
* volume

### 🎤 Voice

* 

### ⚙️ General

* help
* ping
* botinfo
* prefix

---

# 💡 Notes

* Uses **prefix commands** (No Slash Commands).
* Powered by **Lavalink** for reliable music streaming.
* Includes sharding support for larger bots.
* Designed with a modular architecture for easy customization.

---

<div align="center">

## ⭐ Star the repository if you found it useful!

Made with ❤️ by **NotBLAZE/7lirt/d2eo**
join the [Discord](https://discord.gg/yF9JWPmE6y)

</div>
