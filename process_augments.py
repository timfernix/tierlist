import json
import urllib.request
import os
import re

URL = "https://raw.communitydragon.org/latest/game/maps/modespecificdata/augments.bin.json"
OUTPUT_FILE = "aram_augments.json"

def fetch_data():
    print(f"Fetching data from {URL}...")
    with urllib.request.urlopen(URL) as response:
        return json.loads(response.read().decode('utf-8'))

def process_augments(data):
    augments = []
    
    for key, value in data.items():
        if key.startswith("Maps/ModeSpecificData/Augments/ARAM_") and "/Loadable" not in key and "Augment_ARAM_" not in key:
            augment_id = value.get("AugmentNameId")
            
            icon_path = value.get("AugmentLargeIconPath", "")
            if icon_path:
                icon_path = icon_path.lower().replace(".tex", ".png")
                icon_url = f"https://raw.communitydragon.org/latest/game/{icon_path}"
            else:
                icon_url = ""
            
            name = augment_id
            if name:
                if name.startswith("ARAM_"):
                    name = name[5:]
                name = re.sub(r'(?<!^)(?=[A-Z])', ' ', name)

            augments.append({
                "id": key,
                "name": name,
                "url": icon_url
            })
            
    return augments

def main():
    data = fetch_data()
    augments = process_augments(data)
    
    print(f"Found {len(augments)} ARAM augments.")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(augments, f, indent=2)
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
