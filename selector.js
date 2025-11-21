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

async function getLatestVersion() {
  try {
    const response = await fetch(`${API_BASE}/api/versions.json`);
    const versions = await response.json();
    return versions[0]; 
  } catch (error) {
    console.error('Error fetching version:', error);
    return '15.23.1'; // Fallback version
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
            const iconData = iconsData[champ.name].illustration;
            const iconId = typeof iconData === 'object' ? iconData.id : iconData;
            const iconTitle = typeof iconData === 'object' ? iconData.title : '';
            images.push({
              url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${iconId}.png`,
              name: iconTitle ? `${champ.name} (${iconTitle})` : champ.name,
              id: champ.id,
              type: 'icon'
            });
          }
        });
      } else if (options.type === 'chibi') {
        const iconsData = await fetchIconsData();
        filteredChampions.forEach((champ) => {
          if (iconsData && iconsData[champ.name] && iconsData[champ.name].chibi) {
            const iconData = iconsData[champ.name].chibi;
            const iconId = typeof iconData === 'object' ? iconData.id : iconData;
            const iconTitle = typeof iconData === 'object' ? iconData.title : '';
            images.push({
              url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${iconId}.png`,
              name: iconTitle ? `${champ.name} (${iconTitle})` : champ.name,
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
        
        if (championIcons.illustration) {
          const iconData = championIcons.illustration;
          const iconId = typeof iconData === 'object' ? iconData.id : iconData;
          const iconTitle = typeof iconData === 'object' ? iconData.title : 'Illustration';
          images.push({
            url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${iconId}.png`,
            name: `${champ.name} (${iconTitle})`,
            id: champ.id,
            type: 'icon'
          });
        }
        
        if (championIcons.chibi) {
          const iconData = championIcons.chibi;
          const iconId = typeof iconData === 'object' ? iconData.id : iconData;
          const iconTitle = typeof iconData === 'object' ? iconData.title : 'Champie';
          images.push({
            url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${iconId}.png`,
            name: `${champ.name} (${iconTitle})`,
            id: champ.id,
            type: 'icon'
          });
        }
        
        if (championIcons.other && championIcons.other.length > 0) {
          championIcons.other.forEach((iconData, index) => {
            const iconId = typeof iconData === 'object' ? iconData.id : iconData;
            const iconTitle = typeof iconData === 'object' ? iconData.title : `Icon ${index + 1}`;
            images.push({
              url: `${API_BASE}/cdn/${latestVersion}/img/profileicon/${iconId}.png`,
              name: `${champ.name} (${iconTitle})`,
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

async function fetchMapsData() {
  try {
    const response = await fetch('maps.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching maps data:', error);
    return null;
  }
}

async function loadMaps(options) {
  const images = [];
  const seen = new Set();
  const type = options.type || 'minimap';
  const scopes = options.scopes && options.scopes.length ? options.scopes : ['11', '12'];
  
  const mapsData = await fetchMapsData();
  if (!mapsData) return [];

  scopes.forEach(mapId => {
    const def = mapsData[mapId];
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
  const itemsMapData = await fetchItemsMapData();
  const images = [];

  const scopeId = options.scope || '11';
  
  const allowedItemIds = new Set(itemsMapData[scopeId] || []);

  const entries = Object.entries(items)
    .sort((a, b) => {
      const [idA] = a; const [idB] = b;
      if (idA.length !== idB.length) return idA.length - idB.length;
      return parseInt(idA, 10) - parseInt(idB, 10);
    });

  const seenNames = new Set();

  for (const [id, item] of entries) {
    if (!item) continue;
    if (!item.gold && scopeId !== '33') continue;
    if (ITEM_ID_BLACKLIST.includes(id)) continue;
    
    const name = (item.name || '').trim();
    if (!name) continue;
    if (ITEM_NAME_BLOCK_PATTERNS.some((re) => re.test(name))) continue;

    if (!allowedItemIds.has(id)) continue;

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
  
  document.querySelector('input[name="emotes-scope"][value="all"]').checked = true;
  document.getElementById('emotesChampionSelect').style.display = 'none';
  document.getElementById('emotesChampionInput').value = '';
  document.getElementById('emotesChampionInput').dataset.championId = '';
  const emotesSug = document.getElementById('emotesSuggestions');
  emotesSug.classList.remove('active');
  emotesSug.innerHTML = '';
}

let selectedCategory = '';

async function init() {
  latestVersion = await getLatestVersion();
  allChampions = await fetchAllChampions();
  await populateItemScopes();
  await populateMapScopes();
  
  const modal = document.getElementById('optionsModal');
  const generateBtn = document.getElementById('generateBtn');
  
  if (modal && modal.open) {
    modal.close();
  }
  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="bi bi-arrow-right-circle-fill"></i> Generate Tierlist';
  }
  resetModalForm();
  setupEventListeners();
}

window.addEventListener('pageshow', (event) => {
  const modal = document.getElementById('optionsModal');
  const generateBtn = document.getElementById('generateBtn');
  
  if (modal && modal.open) {
    modal.close();
  }
  
  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="bi bi-arrow-right-circle-fill"></i> Generate Tierlist';
  }
  
  if (typeof resetModalForm === 'function') {
    resetModalForm();
  }
  selectedCategory = null;
  
  // Clear any session flags
  sessionStorage.removeItem('selectorNeedsReset');
});

function setupEventListeners() {
  const modal = document.getElementById('optionsModal');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const generateBtn = document.getElementById('generateBtn');

  const getSkinsChampion = setupChampionAutocomplete('skinsChampionInput', 'skinsSuggestions');
  const getProfileIconsChampion = setupChampionAutocomplete('profileIconsChampionInput', 'profileIconsSuggestions');
  const getAbilitiesChampion = setupChampionAutocomplete('abilitiesChampionInput', 'abilitiesSuggestions');
  const getEmotesChampion = setupChampionAutocomplete('emotesChampionInput', 'emotesSuggestions');

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

  document.querySelectorAll('input[name="emotes-scope"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const selectDiv = document.getElementById('emotesChampionSelect');
      
      if (e.target.value === 'select') {
        selectDiv.style.display = 'block';
      } else {
        selectDiv.style.display = 'none';
        document.getElementById('emotesChampionInput').value = '';
        document.getElementById('emotesChampionInput').dataset.championId = '';
        const emotesSug = document.getElementById('emotesSuggestions');
        emotesSug.classList.remove('active');
        emotesSug.innerHTML = '';
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
            const selectedScope = document.querySelector('input[name="items-scope"]:checked')?.value;
            options.scope = selectedScope || '11';
            images = await loadItems(options);
          }
          break;

        case 'spells':
          images = await loadSpells();
          break;

        case 'maps':
          options.type = document.querySelector('input[name="maps-type"]:checked')?.value || 'minimap';
          const selectedScopes = Array.from(document.querySelectorAll('input[name="maps-scope"]:checked')).map(cb => cb.value);
          options.scopes = selectedScopes.length ? selectedScopes : ['11', '12'];
          images = await loadMaps(options);
          break;

        case 'buildchampion':
          images = await loadBuildChampion();
          sessionStorage.setItem('tierlistMode', 'buildchampion');
          break;

        case 'prestige':
          images = await loadPrestigeSkins();
          break;

        case 'emotes':
          options.championScope = document.querySelector('input[name="emotes-scope"]:checked').value;
          options.selectedChampion = getEmotesChampion();
          
          if (options.championScope === 'select' && !options.selectedChampion) {
            alert('Please select a champion');
            return;
          }
          images = await loadEmotes(options);
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

async function fetchItemsMapData() {
  try {
    const response = await fetch('items.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching items map data:', error);
    return {};
  }
}

async function populateItemScopes() {
  const container = document.getElementById('items-scope-container');
  if (!container) return;

  const mapsData = await fetchMapsData();
  const itemsMapData = await fetchItemsMapData();
  
  if (!mapsData || !itemsMapData) return;

  container.innerHTML = '';

  const availableMapIds = Object.keys(itemsMapData);
  const priority = ['11', '12', '30', '21', '33', '35', 'special']; // SR, ARAM, Arena, NB, Swarm, Brawl, Special
  
  const sortedIds = availableMapIds.sort((a, b) => {
    const idxA = priority.indexOf(a);
    const idxB = priority.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  sortedIds.forEach((mapId, index) => {
    const mapDef = mapsData[mapId];
    const mapName = mapDef ? mapDef.name : `Map ${mapId}`;
    
    const label = document.createElement('label');
    label.className = 'radio-option';
    
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'items-scope';
    input.value = mapId;
    if (index === 0) input.checked = true;
    
    const span = document.createElement('span');
    span.textContent = mapName;
    
    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
  });
}

async function populateMapScopes() {
  const container = document.getElementById('maps-scope-container');
  if (!container) return;

  const mapsData = await fetchMapsData();
  if (!mapsData) return;

  container.innerHTML = '';

  const priority = ['11', '12', '30', '21', '33', '35', 'special'];
  
  const availableMapIds = Object.keys(mapsData);
  
  const sortedIds = availableMapIds.sort((a, b) => {
    const idxA = priority.indexOf(a);
    const idxB = priority.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  sortedIds.forEach((mapId) => {
    const mapDef = mapsData[mapId];
    const mapName = mapDef ? mapDef.name : `Map ${mapId}`;
    
    const label = document.createElement('label');
    label.className = 'checkbox-option';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'maps-scope';
    input.value = mapId;
    
    if (mapId === '11' || mapId === '12') {
      input.checked = true;
    }
    
    const span = document.createElement('span');
    span.textContent = mapName;
    
    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
  });
}

async function loadEmotes(options = {}) {
  showLoading();
  const images = [];
  
  try {
    const response = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-emotes.json');
    const emotes = await response.json();
    
    let selectedChampionKey = null;
    if (options.championScope === 'select' && options.selectedChampion) {
      const champ = allChampions.find(c => c.id === options.selectedChampion);
      if (champ) {
        selectedChampionKey = parseInt(champ.key);
      }
    }

    emotes.forEach(emote => {
      // Ignore IDs
      if (emote.id >= 1 && emote.id <= 10) return;
      
      if (selectedChampionKey !== null) {
        if (!emote.taggedChampionsIds || !emote.taggedChampionsIds.includes(selectedChampionKey)) {
          return;
        }
      }
  
      let iconPath = emote.inventoryIcon;
      if (!iconPath) return;
      
      iconPath = iconPath.toLowerCase();
      iconPath = iconPath.replace('/lol-game-data/assets/assets/', '/lol-game-data/assets/');
      
      const url = iconPath.replace('/lol-game-data/', 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/');
      
      images.push({
        url: url,
        name: emote.name || `Emote ${emote.id}`,
        id: emote.id,
        type: 'emote'
      });
    });
    
  } catch (error) {
    console.error('Error loading emotes:', error);
    alert('Failed to load emotes.');
  }
  
  return images;
}

init();
