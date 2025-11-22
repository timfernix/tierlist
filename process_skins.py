import json
import urllib.request
import math

SKINS_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json"
CHAMPIONS_SUMMARY_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json"

COLOR_PALETTE = {
    "Red": (255, 0, 0),
    "Green": (0, 255, 0),
    "Blue": (0, 0, 255),
    "Yellow": (255, 255, 0),
    "Cyan": (0, 255, 255),
    "Magenta": (255, 0, 255),
    "White": (255, 255, 255),
    "Black": (0, 0, 0),
    "Orange": (255, 165, 0),
    "Purple": (128, 0, 128),
    "Pink": (255, 192, 203),
    "Brown": (165, 42, 42),
    "Grey": (128, 128, 128),
    "Teal": (0, 128, 128),
    "Navy": (0, 0, 128),
    "Maroon": (128, 0, 0),
    "Olive": (128, 128, 0),
    "Gold": (255, 215, 0),
    "Silver": (192, 192, 192),
    "Ruby": (224, 17, 95),
    "Sapphire": (15, 82, 186),
    "Emerald": (80, 200, 120),
    "Amethyst": (153, 102, 204),
    "Pearl": (234, 224, 200),
    "Obsidian": (20, 20, 20),
    "Rose": (255, 0, 127),
    "Catseye": (224, 224, 0), 
    "Tanzanite": (73, 0, 128),
    "Aquamarine": (127, 255, 212),
    "Turquoise": (64, 224, 208)
}

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        return (0, 0, 0)
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_closest_color_name(hex_color):
    if not hex_color:
        return "Unknown"
    
    try:
        r, g, b = hex_to_rgb(hex_color)
    except:
        return "Unknown"
        
    min_dist = float('inf')
    closest_name = "Unknown"
    
    for name, (cr, cg, cb) in COLOR_PALETTE.items():
        dist = math.sqrt((r - cr)**2 + (g - cg)**2 + (b - cb)**2)
        if dist < min_dist:
            min_dist = dist
            closest_name = name
            
    return closest_name

def download_json(url):
    print(f"Downloading data from {url}...")
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode('utf-8'))

def process_skins_by_rarity(skins_data):
    """Group skins by rarity and extract only skin names."""
    rarity_groups = {}
    
    for skin_id, skin_info in skins_data.items():
        if skin_info.get('isBase', False):
            continue
            
        rarity = skin_info.get('rarity', 'kNoRarity')
        if rarity == 'kRare':
            rarity = 'kNoRarity'
        skin_name = skin_info.get('name', '')
        
        if skin_name:
            if rarity not in rarity_groups:
                rarity_groups[rarity] = []
            rarity_groups[rarity].append(skin_name)
    
    for rarity in rarity_groups:
        rarity_groups[rarity].sort()
    
    return rarity_groups

def process_chromas(skins_data, champions_summary):
    """Extract chroma information grouped by champion."""
    chromas_by_champion = {}
    
    # Create a map of champion ID to name
    champ_id_map = {c['id']: c['name'] for c in champions_summary if c['id'] != -1}
    
    for skin_id, skin_info in skins_data.items():
        if 'chromas' not in skin_info or not skin_info['chromas']:
            continue
            
        # Determine champion ID from skin ID (usually floor(skinId / 1000))
        try:
            skin_id_int = int(skin_id)
            champ_id = skin_id_int // 1000
        except ValueError:
            continue
            
        if champ_id not in champ_id_map:
            continue
            
        champ_name = champ_id_map[champ_id]
        
        if champ_id not in chromas_by_champion:
            chromas_by_champion[champ_id] = {
                "id": champ_id,
                "name": champ_name,
                "chromas": []
            }
            
        for chroma in skin_info['chromas']:
            chroma_colors = chroma.get('colors', [])
            color_names = [get_closest_color_name(c) for c in chroma_colors]
            # Remove duplicates and Unknowns
            color_names = sorted(list(set([c for c in color_names if c != "Unknown"])))
            
            chromas_by_champion[champ_id]["chromas"].append({
                "id": chroma.get('id'),
                "name": chroma.get('name'),
                "colors": chroma_colors,
                "colorNames": color_names,
                "chromaPath": chroma.get('chromaPath') # Useful for images if needed
            })
            
    return chromas_by_champion

def save_json(data, output_file):
    """Save data to a JSON file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved data to {output_file}")

def main():
    try:
        skins_data = download_json(SKINS_URL)
        champions_summary = download_json(CHAMPIONS_SUMMARY_URL)
        
        # Process Rarity
        rarity_data = process_skins_by_rarity(skins_data)      
        save_json(rarity_data, 'rarity.json')
        
        print("\nRarity Statistics:")
        for rarity, skins in sorted(rarity_data.items()):
            print(f"  {rarity}: {len(skins)} skins")
            
        # Process Chromas
        chromas_data = process_chromas(skins_data, champions_summary)
        save_json(chromas_data, 'chromas.json')
        print(f"\nProcessed chromas for {len(chromas_data)} champions.")
        
        print("\nProcessing complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == '__main__':
    main()
