const API_BASE = 'https://ddragon.leagueoflegends.com';
const LANGUAGE = 'en_US';
let latestVersion = '';
let allChampions = [];

const SUMMONER_SPELL_BLACKLIST = [
  'SummonerPoroRecall',
  'SummonerPoroThrow',
  'SummonerSnowURFSnowball_Mark',
  'Summoner_UltBookPlaceholder',
  'Summoner_UltBookSmitePlaceholder',
  'SummonerCherryFlash'
];

const ITEM_ID_BLACKLIST = [
  '9168', //placeholder
  '220003', '220001', '220004', '220002', '220006', '220005', '220007', '220000' //arena non items
];

const ITEM_NAME_BLOCK_PATTERNS = [
  /placeholder/i
];

const EVENT_ITEM_GROUPS = {
  swarm: [
    '9171', '9172', '9173', '9174', '9175', '9176', '9177', '9178', '9179',
    '9180', '9181', '9182', '9183', '9184', '9185', '9186', '9187', '9188',
    '9189', '9190', '9191', '9192', '9193' ,
    '9271', '9272', '9273', '9274', '9275', '9276', '9277', '9278', '9279',
    '9280', '9281', '9282', '9283', '9284', '9285', '9286', '9287', '9288',
    '9289', '9290', '9291', '9292', '9293',
    '9300', '9301', '9302', '9303', '9304', '9305', '9306', '9307', '9308',
    '9400', '9401', '9402', '9403', '9404', '9405', '9406', '9407', '9408'
  ],
};

async function getLatestVersion() {
  try {
    const response = await fetch(`${API_BASE}/api/versions.json`);
    const versions = await response.json();
    return versions[0]; 
  } catch (error) {
    console.error('Error fetching version:', error);
    return '15.22.1'; // Fallback version
  }
}

async function fetchAllChampions() {
  try {
    const response = await fetch(
      `${API_BASE}/cdn/${latestVersion}/data/${LANGUAGE}/champion.json`
    );
    const data = await response.json();
    return Object.values(data.data);
  } catch (error) {
    console.error('Error fetching champions:', error);
    return [];
  }
}

async function fetchChampionDetails(championId) {
  try {
    const response = await fetch(
      `${API_BASE}/cdn/${latestVersion}/data/${LANGUAGE}/champion/${championId}.json`
    );
    const data = await response.json();
    return data.data[championId];
  } catch (error) {
    console.error('Error fetching champion details:', error);
    return null;
  }
}

async function fetchAllItems() {
  try {
    const response = await fetch(
      `${API_BASE}/cdn/${latestVersion}/data/${LANGUAGE}/item.json`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching items:', error);
    return {};
  }
}

async function fetchSummonerSpells() {
  try {
    const response = await fetch(
      `${API_BASE}/cdn/${latestVersion}/data/${LANGUAGE}/summoner.json`
    );
    const data = await response.json();
    return Object.values(data.data);
  } catch (error) {
    console.error('Error fetching summoner spells:', error);
    return [];
  }
}

async function fetchRarityData() {
  try {
    const response = await fetch('rarity.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rarity data:', error);
    return null;
  }
}

async function fetchRolesData() {
  try {
    const response = await fetch('roles.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching roles data:', error);
    return null;
  }
}

async function fetchLanesData() {
  try {
    const response = await fetch('lanes.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching lanes data:', error);
    return null;
  }
}

async function fetchIconsData() {
  try {
    const response = await fetch('icons.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching icons data:', error);
    return null;
  }
}

async function generateImageUrls(category, options) {
  const images = [];

  switch (category) {
    case 'champions':
      // Filter champions based on lane/role selection
      let filteredChampions = allChampions;
      
      if (options.filter && options.filter !== 'all') {
        if (options.filter.startsWith('lane-')) {
          const lane = options.filter.replace('lane-', '');
          const lanesData = await fetchLanesData();
          if (lanesData && lanesData[lane]) {
            filteredChampions = allChampions.filter(champ => 
              lanesData[lane].includes(champ.name)
            );
          }
        } else if (options.filter.startsWith('role-')) {
          const role = options.filter.replace('role-', '');
          const rolesData = await fetchRolesData();
          if (rolesData && rolesData[role]) {
            filteredChampions = allChampions.filter(champ => 
              rolesData[role].includes(champ.name)
            );
          }
        }
      }

      if (options.type === 'icons') {
        filteredChampions.forEach((champ) => {
          images.push({
            url: `${API_BASE}/cdn/${latestVersion}/img/champion/${champ.id}.png`,
            name: champ.name,
            id: champ.id,
            type: 'icon'
          });
        });
      } else if (options.type === 'illustration') {
        const iconsData = await fetchIconsData();
        filteredChampions.forEach((champ) => {
          if (iconsData && iconsData[champ.name] && iconsData[champ.name].illustration) {
            images.push({
              url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${iconsData[champ.name].illustration}.png`,
              name: champ.name,
              id: champ.id,
              type: 'icon'
            });
          }
        });
      } else if (options.type === 'chibi') {
        const iconsData = await fetchIconsData();
        filteredChampions.forEach((champ) => {
          if (iconsData && iconsData[champ.name] && iconsData[champ.name].chibi) {
            images.push({
              url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${iconsData[champ.name].chibi}.png`,
              name: champ.name,
              id: champ.id,
              type: 'icon'
            });
          }
        });
      } else if (options.type === 'loading') {
        filteredChampions.forEach((champ) => {
          images.push({
            url: `${API_BASE}/cdn/img/champion/loading/${champ.id}_0.jpg`,
            name: champ.name,
            id: champ.id,
            type: 'loading'
          });
        });
      } else if (options.type === 'splash') {
        filteredChampions.forEach((champ) => {
          images.push({
            url: `${API_BASE}/cdn/img/champion/splash/${champ.id}_0.jpg`,
            name: champ.name,
            id: champ.id,
            type: 'splash'
          });
        });
      }
      break;

    case 'profileicons':
      const iconsData = await fetchIconsData();
      let championsForIcons = allChampions;
      
      if (options.championScope === 'select' && options.selectedChampion) {
        championsForIcons = allChampions.filter(champ => champ.name === options.selectedChampion);
      }
      
      championsForIcons.forEach((champ) => {
        const championIcons = iconsData[champ.name];
        if (!championIcons) return;
        
        // Add illustration icon
        if (championIcons.illustration) {
          images.push({
            url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${championIcons.illustration}.png`,
            name: `${champ.name} (Illustration)`,
            id: champ.id,
            type: 'icon'
          });
        }
        
        // Add champie (chibi) icon
        if (championIcons.chibi) {
          images.push({
            url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${championIcons.chibi}.png`,
            name: `${champ.name} (Champie)`,
            id: champ.id,
            type: 'icon'
          });
        }
        
        // Add other icons
        if (championIcons.other && championIcons.other.length > 0) {
          championIcons.other.forEach((iconId, index) => {
            images.push({
              url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${iconId}.png`,
              name: `${champ.name} (Icon ${index + 1})`,
              id: champ.id,
              type: 'icon'
            });
          });
        }
      });
      break;

    case 'skins':
      return null;
    case 'abilities':
      return null;
    case 'items':
      return null;
    case 'spells':
      return null;
    case 'maps':
      return null;
  }
  return images;
}

// Static mapping for maps
const MAPS_DEFINITION = {
  arena: {
    label: 'Arena',
    minimap: [],
    full: [
      { id: 'arena_woods_full', name: 'Ancestral Woods', url: './maps/Arena_Ancestral_Woods.png' },
      { id: 'arena_desert_full', name: 'Desert Oasis', url: './maps/Arena_Desert_Oasis.png' },
      { id: 'arena_frostbite_full', name: 'Frostbite Thicket', url: './maps/Arena_Frostbite_Thicket.png' },
      { id: 'arena_magma_full', name: 'Magma Chamber', url: './maps/Arena_Magma_Chamber.png' },
      { id: 'arena_reckoner_full', name: 'Reckoner Arena', url: './maps/Arena_Reckoner_Arena.png' },
    ]
  },
  aram: {
    label: 'ARAM',
    minimap: [
      { id: 'aram_normal_minimap', name: 'Howling Abyss – Normal (Minimap)', url: './maps/Howling_Abyss_Minimap.png' },
      { id: 'aram_butchers_minimap', name: "Butcher's Bridge (Minimap)", url: './maps/Butchers_Bridge_Minimap.png' },
      { id: 'aram_progress_minimap', name: 'Bridge of Progress (Minimap)', url: './maps/Bridge_of_Progress_Minimap.png' },
      { id: 'aram_crossing_minimap', name: "Koeshin's Crossing (Minimap)", url: './maps/Koeshins_Crossing_Minimap.png' },
    ],
    full: [
      { id: 'aram_normal_full', name: 'Howling Abyss – Normal (Full)', url: './maps/Howling_Abyss.png' },
      { id: 'aram_butchers_full', name: "Butcher's Bridge (Full)", url: './maps/Butchers_Bridge.png' },
      { id: 'aram_progress_full', name: 'Bridge of Progress (Full)', url: './maps/Bridge_of_Progress.png' },
      { id: 'aram_crossing_full', name: "Koeshin's Crossing (Full)", url: './maps/Koeshins_Crossing.png' },
    ]
  },
  sr: {
    label: "Summoner's Rift",
    minimap: [
      { id: 'sr_current_minimap', name: "Summoner's Rift – Current (Minimap)", url: './maps/Summoners_Rift_Minimap.png' },
    ],
    full: [
      { id: 'sr_current_full', name: "Summoner's Rift – Current (Full)", url: './maps/Summoners_Rift.png' },
      { id: 'sr_winter_full', name: "Summoner's Rift – Winter (Full)", url: './maps/Summoners_Rift_Winter.webp' },
      { id: 'sr_arcade_full', name: "Summoner's Rift – Arcade (Full)", url: './maps/Summoners_Rift_Arcade.png' },
      { id: 'sr_bloodmoon_full', name: "Summoner's Rift – Blood Moon (Full)", url: './maps/Summoners_Rift_Bloodmoon.png' },
    ]
  },
  special: {
    label: 'Event / Special Maps',
    minimap: [
      { id: 'special_bandlewood_minimap', name: 'The Bandlewood (Minimap)', url: './maps/The_Bandlewood_Minimap.png' },
      { id: 'special_treeline_minimap', name: 'Twisted Treeline (Minimap)', url: './maps/Twisted_Treeline_Minimap.png' },
      { id: 'special_blitz_minimap', name: 'Temple of Lily and Lotus (Minimap)', url: './maps/Temple_of_Lily_and_Lotus_Minimap.png' },
      { id: 'special_provinggrounds_minimap', name: 'Proving Grounds (Minimap)', url: './maps/Proving_Grounds_Minimap.png' },
      { id: 'special_crystalscar_minimap', name: 'Crystal Scar (Minimap)', url: './maps/Crystal_Scar_Minimap.png' }
    ],
    full: [
      { id: 'special_magma_full', name: 'Magma Chamber (Concept)', url: './maps/Magma_Chamber_Concept.jpg' },
      { id: 'special_bandlewood_full', name: 'The Bandlewood (Full)', url: './maps/The_Bandlewood.png' },
      { id: 'special_treeline_full', name: 'Twisted Treeline (Full)', url: './maps/Twisted_Treeline.jpg' },
      { id: 'special_valoran_full', name: 'Valoran City Park (Full)', url: './maps/Valoran_City_Park.jpg' },
      { id: 'special_blitz_full', name: 'Temple of Lily and Lotus (Full)', url: './maps/Temple_of_Lily_and_Lotus.jpg' },
      { id: 'special_substructure_full', name: 'Substructure 43 (Full)', url: './maps/Substructure_43.png'},
      { id: 'special_provinggrounds_full', name: 'Proving Grounds (Full)', url: './maps/Proving_Grounds.png' },
      { id: 'special_crystalscar_full', name: 'Crystal Scar (Full)', url: './maps/Crystal_Scar.jpg' },
      { id: 'special_cosmicruins_full', name: 'Cosmic Ruins (Full)', url: './maps/Cosmic_Ruins.jpg' },
      { id: 'special_odyssey_full', name: 'Odyssey Crash Site (Full)', url: './maps/Odyssey_Crash_Site.jpg' },
      { id: 'special_swarmdistrict_full', name: 'Swarm Warehouse District (Full)', url: './maps/Swarm_Warehouse_District.png' },
      { id: 'special_swarmoutskirts_full', name: 'Swarm The Outskirts (Full)', url: './maps/Swarm_The_Outskirts.png' },
      { id: 'special_swarmlab_full', name: 'Swarm Subterranean Lab (Full)', url: './maps/Swarm_Subterranean_Lab.png' },
      { id: 'special_swarmbeachhead_full', name: 'Swarm The Beachhead (Full)', url: './maps/Swarm_The_Beachhead.png' }
    ]
  }
};

async function loadMaps(options) {
  const images = [];
  const seen = new Set();
  const type = options.type || 'minimap';
  const scopes = options.scopes && options.scopes.length ? options.scopes : ['aram', 'sr'];

  scopes.forEach(scope => {
    const def = MAPS_DEFINITION[scope];
    if (!def) return;
    const list = def[type] || [];
    list.forEach(entry => {
      if (!entry.url) return;
      if (seen.has(entry.id)) return;
      seen.add(entry.id);
      images.push({
        url: entry.url,
        name: entry.name,
        id: entry.id,
        type: 'map'
      });
    });
  });

  return images;
}

async function loadSkins(options) {
  const images = [];
  const champions = options.championScope === 'all' 
    ? allChampions 
    : [allChampions.find(c => c.id === options.selectedChampion)];

  showLoading();

  let rarityFilter = null;
  if (options.championScope === 'all' && options.rarities && options.rarities.length > 0 && !options.rarities.includes('all')) {
    rarityFilter = await fetchRarityData();
    if (!rarityFilter) {
      console.warn('Failed to load rarity data, showing all skins');
    }
  }

  for (const champ of champions) {
    if (!champ) continue;
    const details = await fetchChampionDetails(champ.id);
    if (details && details.skins) {
      details.skins.forEach((skin) => {
        const skinName = `${champ.name} - ${skin.name}`;
        
        if (rarityFilter) {
          let matchesRarity = false;
          for (const rarity of options.rarities) {
            if (rarityFilter[rarity] && rarityFilter[rarity].includes(skin.name)) {
              matchesRarity = true;
              break;
            }
          }
          if (!matchesRarity) return;
        }
        
        const skinNum = skin.num;
        const urlType = options.skinType === 'splash' ? 'splash' : 'loading';
        images.push({
          url: `${API_BASE}/cdn/img/champion/${urlType}/${champ.id}_${skinNum}.jpg`,
          name: skinName,
          id: `${champ.id}_${skinNum}`,
          type: options.skinType
        });
      });
    }
  }

  return images;
}

async function loadAbilities(options) {
  const images = [];
  const champions = options.championScope === 'all'
    ? allChampions
    : [allChampions.find(c => c.id === options.selectedChampion)];

  showLoading();

  for (const champ of champions) {
    if (!champ) continue;
    const details = await fetchChampionDetails(champ.id);
    if (!details) continue;

    const spells = options.spells || ['all'];
    const includeAll = spells.includes('all');

    if (includeAll || spells.includes('passive')) {
      images.push({
        url: `${API_BASE}/cdn/${latestVersion}/img/passive/${details.passive.image.full}`,
        name: `${champ.name} - ${details.passive.name}`,
        id: `${champ.id}_passive`,
        type: 'ability'
      });
    }

    const spellKeys = ['q', 'w', 'e', 'r'];
    details.spells.forEach((spell, index) => {
      const key = spellKeys[index];
      if (includeAll || spells.includes(key)) {
        images.push({
          url: `${API_BASE}/cdn/${latestVersion}/img/spell/${spell.image.full}`,
          name: `${champ.name} - ${spell.name} (${key.toUpperCase()})`,
          id: `${champ.id}_${key}`,
          type: 'ability'
        });
      }
    });
  }

  return images;
}

async function loadItems(options = {}) {
  showLoading();
  const items = await fetchAllItems();
  const images = [];

  const scopes = Array.isArray(options.scopes) && options.scopes.length
    ? options.scopes
    : ['normal'];

  const allEventIds = new Set(Object.values(EVENT_ITEM_GROUPS).flat());
  const swarmIds = new Set(EVENT_ITEM_GROUPS.swarm || []);

  const entries = Object.entries(items)
    .sort((a, b) => {
      const [idA] = a; const [idB] = b;
      if (idA.length !== idB.length) return idA.length - idB.length;
      return parseInt(idA, 10) - parseInt(idB, 10);
    });

  const seenNames = new Set();

  for (const [id, item] of entries) {
    if (!item) continue;
    if (!item.gold || item.gold.purchasable === false) continue;
    if (ITEM_ID_BLACKLIST.includes(id)) continue;
    const name = (item.name || '').trim();
    if (!name) continue;
    if (ITEM_NAME_BLOCK_PATTERNS.some((re) => re.test(name))) continue;

    let include = false;
    if (scopes.includes('normal') && !allEventIds.has(id)) include = true;
    if (scopes.includes('swarm') && swarmIds.has(id)) include = true;
    if (!include) continue;

    const key = name.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);

    images.push({
      url: `${API_BASE}/cdn/${latestVersion}/img/item/${id}.png`,
      name: name,
      id: id,
      type: 'item'
    });
  }

  // Sort A-Z
  //images.sort((a, b) => a.name.localeCompare(b.name));

  return images;
}

async function loadSpells() {
  showLoading();
  const spells = await fetchSummonerSpells();
  const images = [];

  spells.forEach((spell) => {
    if (SUMMONER_SPELL_BLACKLIST.includes(spell.id)) return;
    
    images.push({
      url: `${API_BASE}/cdn/${latestVersion}/img/spell/${spell.image.full}`,
      name: spell.name,
      id: spell.id,
      type: 'spell'
    });
  });

  return images;
}

async function loadPrestigeSkins() {
  showLoading();
  const images = [];

  for (const champ of allChampions) {
    const details = await fetchChampionDetails(champ.id);
    if (details && details.skins) {
      details.skins.forEach((skin) => {
        if (skin.name.includes('Prestige')) {
          const skinNum = skin.num;
          images.push({
            url: `${API_BASE}/cdn/img/champion/splash/${champ.id}_${skinNum}.jpg`,
            name: `${champ.name} - ${skin.name}`,
            id: `${champ.id}_${skinNum}`,
            type: 'splash'
          });
        }
      });
    }
  }

  return images;
}

async function loadBuildChampion() {
  showLoading();
  const images = [];
  
  const sortedChampions = [...allChampions].sort((a, b) => a.name.localeCompare(b.name));

  for (const champ of sortedChampions) {
    const details = await fetchChampionDetails(champ.id);
    if (!details) continue;

    images.push({
      url: `${API_BASE}/cdn/${latestVersion}/img/passive/${details.passive.image.full}`,
      name: `${champ.name} - ${details.passive.name}`,
      id: `${champ.id}_passive`,
      type: 'ability',
      championName: champ.name
    });

    const spellKeys = ['Q', 'W', 'E', 'R'];
    details.spells.forEach((spell, index) => {
      images.push({
        url: `${API_BASE}/cdn/${latestVersion}/img/spell/${spell.image.full}`,
        name: `${champ.name} - ${spell.name} (${spellKeys[index]})`,
        id: `${champ.id}_${spellKeys[index].toLowerCase()}`,
        type: 'ability',
        championName: champ.name
      });
    });
  }

  return images;
}

function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}



function storeDataForTierlist(images) {
  sessionStorage.setItem('tierlistImages', JSON.stringify(images));
}

function setupChampionAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);
  let selectedChampion = null;

  input.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    suggestions.innerHTML = '';
    
    if (value.length === 0) {
      suggestions.classList.remove('active');
      selectedChampion = null;
      input.dataset.championId = '';
      return;
    }

    const filtered = allChampions
      .filter(c => c.name.toLowerCase().includes(value) || c.id.toLowerCase().includes(value))
      .slice(0, 5);

    if (filtered.length > 0) {
      filtered.forEach(champ => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<img src="${API_BASE}/cdn/${latestVersion}/img/champion/${champ.id}.png" alt="${champ.name} icon"><span>${champ.name}</span>`;
        div.dataset.championId = champ.id;
        
        div.addEventListener('click', () => {
          input.value = champ.name;
          input.dataset.championId = champ.id;
          selectedChampion = champ.id;
          suggestions.classList.remove('active');
          suggestions.innerHTML = '';
          input.blur();
          
          if (inputId === 'skinsChampionInput') {
            document.getElementById('skinsTypeSelect').style.display = 'block';
          }
        });
        
        suggestions.appendChild(div);
      });
      suggestions.classList.add('active');
    } else {
      suggestions.classList.remove('active');
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.remove('active');
    }
  });

  return () => selectedChampion || input.dataset.championId;
}

function resetModalForm() {
  document.querySelector('input[name="skins-scope"][value="all"]').checked = true;
  document.getElementById('skinsChampionSelect').style.display = 'none';
  document.getElementById('skinsTypeSelect').style.display = 'block'; // Show for "All"
  document.getElementById('skinsRaritySelect').style.display = 'block'; // Show for "All"
  document.getElementById('skinsChampionInput').value = '';
  document.getElementById('skinsChampionInput').dataset.championId = '';
  const skinsSug = document.getElementById('skinsSuggestions');
  skinsSug.classList.remove('active');
  skinsSug.innerHTML = '';
  document.querySelector('input[name="skins-type"][value="splash"]').checked = true;
  
  document.querySelector('input[name="skins-rarity"][value="all"]').checked = true;
  document.querySelectorAll('input[name="skins-rarity"]:not([value="all"])').forEach(cb => {
    cb.checked = false;
    cb.disabled = true;
  });
  
  document.querySelector('input[name="profileicons-scope"][value="all"]').checked = true;
  document.getElementById('profileIconsChampionSelect').style.display = 'none';
  document.getElementById('profileIconsChampionInput').value = '';
  document.getElementById('profileIconsChampionInput').dataset.championId = '';
  const profileIconsSug = document.getElementById('profileIconsSuggestions');
  profileIconsSug.classList.remove('active');
  profileIconsSug.innerHTML = '';
  
  document.querySelector('input[name="abilities-scope"][value="all"]').checked = true;
  document.getElementById('abilitiesChampionSelect').style.display = 'none';
  document.getElementById('spellSelect').style.display = 'block';
  document.getElementById('abilitiesChampionInput').value = '';
  document.getElementById('abilitiesChampionInput').dataset.championId = '';
  const abilitiesSug = document.getElementById('abilitiesSuggestions');
  abilitiesSug.classList.remove('active');
  abilitiesSug.innerHTML = '';
  
  const allSpellCb = document.querySelector('#spellSelect input[name="spell"][value="all"]');
  if (allSpellCb) {
    const allLabel = allSpellCb.closest('.checkbox-option');
    if (allLabel) allLabel.style.display = 'none';
    allSpellCb.checked = false;
  }
  document.querySelectorAll('#spellSelect input[name="spell"]:not([value="all"])').forEach(cb => {
    cb.checked = false;
    cb.disabled = false;
  });
  
  document.querySelector('input[name="champions-type"][value="icons"]').checked = true;
}

let selectedCategory = '';

async function init() {
  showLoading();
  latestVersion = await getLatestVersion();
  allChampions = await fetchAllChampions();
  
  const versionInfo = document.getElementById('versionInfo');
  if (versionInfo) {
    versionInfo.textContent = `Patch Version: ${latestVersion}`;
  }
  
  hideLoading();
  setupEventListeners();
  
  const modal = document.getElementById('optionsModal');
  const generateBtn = document.getElementById('generateBtn');
  
  // Check if page needs reset after back navigation
  if (sessionStorage.getItem('selectorNeedsReset') === 'true') {
    sessionStorage.removeItem('selectorNeedsReset');
    if (modal && modal.open) {
      modal.close();
    }
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<i class="bi bi-arrow-right-circle-fill"></i> Generate Tierlist';
    }
    resetModalForm();
    selectedCategory = null;
  }
  
  if (modal && modal.open) {
    modal.close();
  }
  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="bi bi-arrow-right-circle-fill"></i> Generate Tierlist';
  }
  resetModalForm();
}

function setupEventListeners() {
  const modal = document.getElementById('optionsModal');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const generateBtn = document.getElementById('generateBtn');

  const getSkinsChampion = setupChampionAutocomplete('skinsChampionInput', 'skinsSuggestions');
  const getProfileIconsChampion = setupChampionAutocomplete('profileIconsChampionInput', 'profileIconsSuggestions');
  const getAbilitiesChampion = setupChampionAutocomplete('abilitiesChampionInput', 'abilitiesSuggestions');

  document.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      resetModalForm();
      
      selectedCategory = card.dataset.category;
      document.getElementById('modalTitle').textContent = 
        `Configure ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`;
      
      document.querySelectorAll('.options-group').forEach((group) => {
        group.style.display = 'none';
      });
      
      const relevantGroup = document.querySelector(`.options-group[data-category="${selectedCategory}"]`);
      if (relevantGroup) {
        relevantGroup.style.display = 'block';
      }
      
      modal.showModal();
    });
  });

  closeBtn.addEventListener('click', () => modal.close());
  cancelBtn.addEventListener('click', () => modal.close());

  document.querySelectorAll('input[name="skins-scope"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const selectDiv = document.getElementById('skinsChampionSelect');
      const typeDiv = document.getElementById('skinsTypeSelect');
      const rarityDiv = document.getElementById('skinsRaritySelect');
      
      if (e.target.value === 'select') {
        selectDiv.style.display = 'block';
        typeDiv.style.display = 'none';
        rarityDiv.style.display = 'none';
      } else {
        selectDiv.style.display = 'none';
        typeDiv.style.display = 'block';
        rarityDiv.style.display = 'block';
      }
    });
  });

  document.querySelector('input[name="skins-rarity"][value="all"]').addEventListener('change', (e) => {
    const otherCheckboxes = document.querySelectorAll('input[name="skins-rarity"]:not([value="all"])');
    if (e.target.checked) {
      otherCheckboxes.forEach(cb => {
        cb.checked = false;
        cb.disabled = true;
      });
    } else {
      otherCheckboxes.forEach(cb => cb.disabled = false);
    }
  });

  document.querySelectorAll('input[name="skins-rarity"]:not([value="all"])').forEach(cb => {
    cb.addEventListener('change', () => {
      const allCheckbox = document.querySelector('input[name="skins-rarity"][value="all"]');
      const anyChecked = Array.from(document.querySelectorAll('input[name="skins-rarity"]:not([value="all"])')).some(c => c.checked);
      if (anyChecked) {
        allCheckbox.checked = false;
      }
    });
  });

  document.querySelectorAll('input[name="profileicons-scope"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const selectDiv = document.getElementById('profileIconsChampionSelect');
      
      if (e.target.value === 'select') {
        selectDiv.style.display = 'block';
      } else {
        selectDiv.style.display = 'none';
        document.getElementById('profileIconsChampionInput').value = '';
        document.getElementById('profileIconsChampionInput').dataset.championId = '';
        const profileIconsSug = document.getElementById('profileIconsSuggestions');
        profileIconsSug.classList.remove('active');
        profileIconsSug.innerHTML = '';
      }
    });
  });

  document.querySelectorAll('input[name="abilities-scope"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const selectDiv = document.getElementById('abilitiesChampionSelect');
      const spellDiv = document.getElementById('spellSelect');
      
      if (e.target.value === 'select') {
        selectDiv.style.display = 'block';
        spellDiv.style.display = 'none';
      } else {
        selectDiv.style.display = 'none';
        spellDiv.style.display = 'block';
        const allCb = document.querySelector('#spellSelect input[name="spell"][value="all"]');
        if (allCb) {
          const allLabel = allCb.closest('.checkbox-option');
          if (allLabel) allLabel.style.display = 'none';
          allCb.checked = false;
        }
        document.querySelectorAll('#spellSelect input[name="spell"]:not([value="all"])').forEach(cb => {
          cb.disabled = false;
          cb.checked = false;
        });
      }
    });
  });

  document.querySelector('input[name="spell"][value="all"]').addEventListener('change', (e) => {
    const otherCheckboxes = document.querySelectorAll('input[name="spell"]:not([value="all"])');
    if (e.target.checked) {
      otherCheckboxes.forEach(cb => {
        cb.checked = false;
        cb.disabled = true;
      });
    } else {
      otherCheckboxes.forEach(cb => cb.disabled = false);
    }
  });

  document.querySelectorAll('input[name="spell"]:not([value="all"])').forEach(cb => {
    cb.addEventListener('change', () => {
      const allCheckbox = document.querySelector('input[name="spell"][value="all"]');
      const anyChecked = Array.from(document.querySelectorAll('input[name="spell"]:not([value="all"])')).some(c => c.checked);
      if (anyChecked) {
        allCheckbox.checked = false;
      }
    });
  });

  generateBtn.addEventListener('click', async () => {
    let images = [];
    const options = {};

    const originalHTML = generateBtn.innerHTML;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';

    try {
      sessionStorage.removeItem('tierlistMode');
      
      switch (selectedCategory) {
        case 'champions':
          options.type = document.querySelector('input[name="champions-type"]:checked').value;
          const filterRadio = document.querySelector('input[name="champions-filter"]:checked');
          options.filter = filterRadio ? filterRadio.value : 'all';
          images = await generateImageUrls('champions', options);
          break;

        case 'skins':
          options.skinType = document.querySelector('input[name="skins-type"]:checked').value;
          options.championScope = document.querySelector('input[name="skins-scope"]:checked').value;
          options.selectedChampion = getSkinsChampion();
          
          if (options.championScope === 'select' && !options.selectedChampion) {
            alert('Please select a champion');
            return;
          }
          
          const selectedRarities = Array.from(document.querySelectorAll('input[name="skins-rarity"]:checked'))
            .map(cb => cb.value);
          options.rarities = selectedRarities.length > 0 ? selectedRarities : ['all'];
          
          images = await loadSkins(options);
          break;

        case 'profileicons':
          options.championScope = document.querySelector('input[name="profileicons-scope"]:checked').value;
          options.selectedChampion = getProfileIconsChampion();
          
          if (options.championScope === 'select' && !options.selectedChampion) {
            alert('Please select a champion');
            return;
          }
          
          images = await generateImageUrls('profileicons', options);
          break;

        case 'abilities':
          options.championScope = document.querySelector('input[name="abilities-scope"]:checked').value;
          options.selectedChampion = getAbilitiesChampion();
          
          if (options.championScope === 'select' && !options.selectedChampion) {
            alert('Please select a champion');
            return;
          }

          const selectedSpells = Array.from(document.querySelectorAll('input[name="spell"]:checked'))
            .map(cb => cb.value);
          options.spells = selectedSpells.length > 0 ? selectedSpells : ['all'];
          
          images = await loadAbilities(options);
          break;

        case 'items':
          {
            const selectedItemScopes = Array.from(document.querySelectorAll('input[name="items-scope"]:checked')).map(cb => cb.value);
            options.scopes = selectedItemScopes.length ? selectedItemScopes : ['normal'];
            images = await loadItems(options);
          }
          break;

        case 'spells':
          images = await loadSpells();
          break;

        case 'maps':
          options.type = document.querySelector('input[name="maps-type"]:checked')?.value || 'minimap';
          const selectedScopes = Array.from(document.querySelectorAll('input[name="maps-scope"]:checked')).map(cb => cb.value);
          options.scopes = selectedScopes.length ? selectedScopes : ['aram','sr'];
          images = await loadMaps(options);
          break;

        case 'buildchampion':
          images = await loadBuildChampion();
          sessionStorage.setItem('tierlistMode', 'buildchampion');
          break;

        case 'prestige':
          images = await loadPrestigeSkins();
          break;
      }

      if (images && images.length > 0) {
        storeDataForTierlist(images);
        hideLoading();
        
        // Reset the page state before navigation
        sessionStorage.setItem('selectorNeedsReset', 'true');
        window.location.href = 'tierlist.html';
      } else {
        hideLoading();
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalHTML;
        alert('No images found for the selected options');
      }
    } catch (error) {
      console.error('Error generating tierlist:', error);
      hideLoading();
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalHTML;
      alert('An error occurred while generating the tierlist. Please try again.');
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
}

init();
