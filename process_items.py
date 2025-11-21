import json
import urllib.request
import os
from common import get_latest_version

# URLs
ITEM_DATA_URL_TEMPLATE = "https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/item.json"

# Local files
MAPS_FILE = 'maps.json'
OUTPUT_FILE = 'items.json'

def download_items(version):
    url = ITEM_DATA_URL_TEMPLATE.format(version=version)
    print(f"Downloading items from {url}...")
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode('utf-8'))

def load_maps():
    print(f"Loading maps from {MAPS_FILE}...")
    if not os.path.exists(MAPS_FILE):
        print(f"Warning: {MAPS_FILE} not found. Using default map IDs.")
        return {}
    
    with open(MAPS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def process_items(items_data, maps_data):
    print("Processing items...")
    items_by_map = {}
    
    for map_id in maps_data.keys():
        if map_id == "special": 
            continue
        items_by_map[map_id] = []    
    all_items = items_data['data']
    
    for item_id, item in all_items.items():
        if "placeholder" in item['name'].lower():
            continue
            
        item_maps = item.get('maps', {})
        
        for map_id, available in item_maps.items():
            if available:
                if map_id not in items_by_map:
                    items_by_map[map_id] = []
                items_by_map[map_id].append(item_id)

    return items_by_map

def save_items_json(data):
    print(f"Saving to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("Done.")

def main():
    try:
        version = get_latest_version()
        items_data = download_items(version)
        maps_data = load_maps()
        
        processed_data = process_items(items_data, maps_data)
        save_items_json(processed_data)
        
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

if __name__ == "__main__":
    main()
