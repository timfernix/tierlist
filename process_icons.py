import json
import urllib.request
import re
from common import get_latest_version

# URLs
SUMMONER_ICONS_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-icons.json"
CHAMPION_DATA_URL_TEMPLATE = "https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json"

def download_summoner_icons():
    """Download the summoner icons JSON from CommunityDragon."""
    print("Downloading summoner icons data from CommunityDragon...")
    with urllib.request.urlopen(SUMMONER_ICONS_URL) as response:
        return json.loads(response.read().decode('utf-8'))

def download_champion_data(version):
    """Download champion data from Data Dragon."""
    url = CHAMPION_DATA_URL_TEMPLATE.format(version=version)
    print(f"Downloading champion data from Data Dragon ({version})...")
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode('utf-8'))
        return {champ['name']: champ for champ in data['data'].values()}

def process_icons(summoner_icons, champion_data):
    """Process summoner icons and group by champion."""
    icons_by_champion = {}
    
    # Special name mappings for icons that use different names
    name_variants = {
        'Nunu & Willump': ['Nunu & Willump', 'Nunu and Willump', 'Nunu'],
        'Vladimir': ['Vladimir', 'Vlad']
    }
    
    for champ_name in champion_data.keys():
        icons_by_champion[champ_name] = {
            'illustration': None,
            'chibi': None,
            'chibi_candidates': [],  # Champie icons
            'other': []
        }
    
    for icon in summoner_icons:
        icon_id = icon.get('id')
        title = icon.get('title', '')
        descriptions = icon.get('descriptions', [])
        
        if not icon_id:
            continue
        
        for champ_name in champion_data.keys():
            search_names = name_variants.get(champ_name, [champ_name])
            
            matched_in_title = False
            for search_name in search_names:
                escaped_name = re.escape(search_name)
                pattern = re.compile(escaped_name, re.IGNORECASE)
                
                if pattern.search(title):
                    matched_in_title = True
                    break
            
            matched_in_description = False
            if not matched_in_title and descriptions:
                for desc_obj in descriptions:
                    desc_text = desc_obj.get('description', '')
                    if desc_text:
                        for search_name in search_names:
                            escaped_name = re.escape(search_name)
                            pattern = re.compile(escaped_name, re.IGNORECASE)
                            
                            if pattern.search(desc_text):
                                matched_in_description = True
                                break
                    if matched_in_description:
                        break
            
            if matched_in_title or matched_in_description:
                if re.search(r'\bIllustration\b', title, re.IGNORECASE):
                    icons_by_champion[champ_name]['illustration'] = {'id': icon_id, 'title': title}
                
                elif re.search(r'\bChampie\b', title, re.IGNORECASE):
                    has_version_marker = bool(re.search(r'\b(II|2|III|3|IV|4)\b', title, re.IGNORECASE))
                    icons_by_champion[champ_name]['chibi_candidates'].append({
                        'id': icon_id,
                        'title': title,
                        'has_version': has_version_marker
                    })
                
                else:
                    if not any(item['id'] == icon_id for item in icons_by_champion[champ_name]['other']):
                        ill_id = icons_by_champion[champ_name]['illustration']['id'] if icons_by_champion[champ_name]['illustration'] else None
                        if icon_id != ill_id:
                            icons_by_champion[champ_name]['other'].append({'id': icon_id, 'title': title})
    
    for champ_name in icons_by_champion:
        candidates = icons_by_champion[champ_name]['chibi_candidates']
        
        if candidates:
            versioned = [c for c in candidates if c['has_version']]
            non_versioned = [c for c in candidates if not c['has_version']]
            
            selected = None
            if versioned:
                versioned.sort(key=lambda x: x['title'])
                selected = versioned[-1]
            else:
                selected = non_versioned[0]
            
            icons_by_champion[champ_name]['chibi'] = {'id': selected['id'], 'title': selected['title']}
            
            for candidate in candidates:
                if candidate['id'] != selected['id']:
                    if not any(item['id'] == candidate['id'] for item in icons_by_champion[champ_name]['other']):
                        icons_by_champion[champ_name]['other'].append({'id': candidate['id'], 'title': candidate['title']})
        
        del icons_by_champion[champ_name]['chibi_candidates']
    
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
        version = get_latest_version()
        summoner_icons = download_summoner_icons()
        champion_data = download_champion_data(version)
        
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
