import json
import urllib.request
import re

SUMMONER_ICONS_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-icons.json"
CHAMPION_DATA_URL = "https://ddragon.leagueoflegends.com/cdn/15.22.1/data/en_US/champion.json"

def download_summoner_icons():
    """Download the summoner icons JSON from CommunityDragon."""
    print("Downloading summoner icons data from CommunityDragon...")
    with urllib.request.urlopen(SUMMONER_ICONS_URL) as response:
        return json.loads(response.read().decode('utf-8'))

def download_champion_data():
    """Download champion data from Data Dragon."""
    print("Downloading champion data from Data Dragon...")
    with urllib.request.urlopen(CHAMPION_DATA_URL) as response:
        data = json.loads(response.read().decode('utf-8'))
        return {champ['name']: champ for champ in data['data'].values()}

def process_icons(summoner_icons, champion_data):
    """Process summoner icons and group by champion."""
    icons_by_champion = {}
    
    for champ_name in champion_data.keys():
        icons_by_champion[champ_name] = {
            'illustration': None,
            'chibi': None,
            'other': []
        }
    
    for icon in summoner_icons:
        icon_id = icon.get('id')
        title = icon.get('title', '')
        
        if not icon_id or not title:
            continue
        
        for champ_name in champion_data.keys():
            escaped_name = re.escape(champ_name)
            pattern = re.compile(escaped_name, re.IGNORECASE)
            
            if pattern.search(title):
                if re.search(r'\bIllustration\b', title, re.IGNORECASE):
                    icons_by_champion[champ_name]['illustration'] = icon_id
                
                elif re.search(r'\bChampie\b', title, re.IGNORECASE):
                    icons_by_champion[champ_name]['chibi'] = icon_id
                
                else:
                    if (icon_id != icons_by_champion[champ_name]['illustration'] and 
                        icon_id != icons_by_champion[champ_name]['chibi'] and
                        icon_id not in icons_by_champion[champ_name]['other']):
                        icons_by_champion[champ_name]['other'].append(icon_id)
    
    return icons_by_champion

def save_icons_json(icons_data, output_file='icons.json'):
    """Save the processed icons data to a JSON file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(icons_data, f, indent=2, ensure_ascii=False)
    print(f"\nSaved icons data to {output_file}")
    
    print("\nIcon Statistics:")
    illustration_count = sum(1 for data in icons_data.values() if data['illustration'])
    chibi_count = sum(1 for data in icons_data.values() if data['chibi'])
    other_count = sum(len(data['other']) for data in icons_data.values())
    
    print(f"  Champions with Illustration icons: {illustration_count}")
    print(f"  Champions with Champie (Chibi) icons: {chibi_count}")
    print(f"  Total other icons: {other_count}")
    print(f"  Total champions: {len(icons_data)}")

def main():
    try:
        summoner_icons = download_summoner_icons()
        champion_data = download_champion_data()
        
        print(f"\nProcessing {len(summoner_icons)} summoner icons...")
        print(f"Processing {len(champion_data)} champions...\n")
        
        icons_data = process_icons(summoner_icons, champion_data)
        save_icons_json(icons_data)
        
        print("\nProcessing complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == '__main__':
    main()
