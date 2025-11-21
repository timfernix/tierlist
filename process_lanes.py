import json
import urllib.request
from common import get_latest_version

CHAMPION_JSON_URL_TEMPLATE = "https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json"

def download_champion_data(version):
    """Download champion data from Data Dragon."""
    url = CHAMPION_JSON_URL_TEMPLATE.format(version=version)
    print(f"Downloading champion data from Data Dragon ({version})...")
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode("utf-8"))

def get_all_champions(champion_data):
    """Extract all champion names from the data."""
    champions = []
    for champ_id, champ_info in champion_data["data"].items():
        champion_name = champ_info["name"]
        if not champion_name.startswith("Doom Bot"):
            champions.append(champion_name)
    return sorted(champions)

def update_lanes_json(all_champions, current_lanes):
    """Update lanes.json with all champions sorted into their respective lanes."""
    updated_lanes = {}
    
    for lane, champions in current_lanes.items():
        valid_champions = [c for c in champions if c in all_champions]
        updated_lanes[lane] = sorted(valid_champions)
    
    all_lane_champions = set()
    for champions in updated_lanes.values():
        all_lane_champions.update(champions)
    
    missing_champions = [c for c in all_champions if c not in all_lane_champions]
    
    if missing_champions:
        print(f"\nWarning: {len(missing_champions)} champions not assigned to any lane:")
        for champ in missing_champions:
            print(f"  - {champ}")
    
    return updated_lanes

def save_lanes_json(lanes_data, output_file="lanes.json"):
    """Save the updated lanes data to JSON file."""
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(lanes_data, f, indent=2, ensure_ascii=False)
    print(f"\nSaved lanes data to {output_file}")
    
    print("\nLane Statistics:")
    total = 0
    for lane, champions in sorted(lanes_data.items()):
        count = len(champions)
        total += count
        print(f"  {lane.capitalize()}: {count} champions")
    print(f"  Total: {total} champions")

def load_current_lanes(file_path="lanes.json"):
    """Load current lanes.json file."""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def main():
    try:
        version = get_latest_version()
        champion_data = download_champion_data(version)
        
        all_champions = get_all_champions(champion_data)
        print(f"Found {len(all_champions)} total champions in Data Dragon")
        
        current_lanes = load_current_lanes()
        
        updated_lanes = update_lanes_json(all_champions, current_lanes)
        
        save_lanes_json(updated_lanes)
        
        print("\nProcessing complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == "__main__":
    main()
