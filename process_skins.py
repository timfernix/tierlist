import json
import urllib.request

SKINS_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json"

def download_skins_data():
    """Download the skins JSON from CommunityDragon."""
    print("Downloading skins data from CommunityDragon...")
    with urllib.request.urlopen(SKINS_URL) as response:
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

def save_rarity_json(rarity_data, output_file='rarity.json'):
    """Save the processed rarity data to a JSON file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(rarity_data, f, indent=2, ensure_ascii=False)
    print(f"Saved rarity data to {output_file}")
    
    print("\nRarity Statistics:")
    for rarity, skins in sorted(rarity_data.items()):
        print(f"  {rarity}: {len(skins)} skins")

def main():
    try:
        skins_data = download_skins_data()
        rarity_data = process_skins_by_rarity(skins_data)      
        save_rarity_json(rarity_data)
        print("\nProcessing complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == '__main__':
    main()
