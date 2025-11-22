# League of Legends Tierlist Maker

A web-based tierlist maker for League of Legends with support for champions, skins, abilities, items, maps, profile icons, and summoner spells.

🔗 **[Try it here](https://timfernix.github.io/tierlist)**

## Features

### Multiple Categories

- **Champions**: Create tierlists with champion icons, illustration icons, champie (chibi) icons, loading screens, or splash arts
  - Filter by lane (Top, Jungle, Middle, Bottom, Support)
  - Filter by role (Tank, Assassin, Fighter, Mage, Marksman, Support)
- **Skins**: Rank skins from all champions or focus on a specific champion
  - Filter by rarity (Standard, Epic, Legendary, Mythic, Ultimate, Transcendent)
- **Profile Icons**: Rank champion-themed profile icons (illustration, champie, and other variants)
  - Select all icons or focus on a specific champion's icons
- **Abilities**: Compare champion abilities (Passive, Q, W, E, R)
  - Select abilities from different champions
- **Items**: Rank items including event items and Swarm mode items
- **Maps**: Create tierlists for different gamemodes and maps
- **Summoner Spells**: Rank summoner spells
- **Emotes**: Rank all available emotes
  - Filter by champion or view all
- **Chromas**: Rank chromas by champion or color
  - Filter by champion
  - Filter by color (Red, Blue, Green, etc.) when viewing all champions

### Special Tierlists

- **Build Your Champion**: Create your perfect champion by picking one ability from each slot (Passive, Q, W, E, R) from different champions
- **Prestige Skins**: Rank all prestige edition skins across all champions

### Interactive Features

- **Drag & Drop**: Easily move images between tiers (works on desktop and mobile)
- **Touch Support**: Full mobile support with touch drag-and-drop
- **Image Preview**: Click on images to see a larger preview with the name
- **Customizable Tiers**: Add, remove, reorder, and customize tier colors and labels
- **Download**: Export your tierlist as a PNG image
- **Auto-scroll**: Automatically scrolls when dragging items near the edge (desktop)
- **Loading Indicators**: Visual feedback while generating tierlists

## How to Use

🔗 **[Read here](./HOWTO.md)**

## Built With

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_Icons-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Riot Games API](https://img.shields.io/badge/Riot_Games_API-D32936?style=for-the-badge&logo=riotgames&logoColor=white)
![html2canvas](https://img.shields.io/badge/html2canvas-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

## Automated Data Updates

This project uses GitHub Actions to automatically update game data daily:

- **Skins, Chromas & Rarity**: Fetches latest skin data, chromas, and rarity classifications from Community Dragon
- **Icons**: Updates champion profile icons (illustration, champie, and other variants)
- **Lanes**: Validates champion lane assignments against current patch data
- **Roles**: Champion role classifications (manually maintained)

All data files are automatically committed when changes are detected.

## Data Sources

All game assets and data are sourced from:

- [Riot Games API / Data Dragon](https://developer.riotgames.com/docs/lol)
- [Community Dragon](https://www.communitydragon.org/)

This project was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.

## Credits

Made with 💖 by [timfernix](https://timfernix.github.io)

---

*League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.*
