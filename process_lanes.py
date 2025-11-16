import json
import urllib.request

CHAMPION_JSON_URL = "https://ddragon.leagueoflegends.com/cdn/15.22.1/data/en_US/champion.json"

def download_champion_data():
    """Download champion data from Data Dragon."""
    print("Downloading champion data from Data Dragon...")
    with urllib.request.urlopen(CHAMPION_JSON_URL) as response:
        return json.loads(response.read().decode("utf-8"))

def get_all_champions(champion_data):
    """Extract all champion names from the data."""
    champions = []
    for champ_id, champ_info in champion_data["data"].items():
        champion_name = champ_info["name"]
        # Filter out special characters if needed
        if not champion_name.startswith("Doom Bot"):
            champions.append(champion_name)
    return sorted(champions)

def update_lanes_json(all_champions, current_lanes):
    """Update lanes.json with all champions sorted into their respective lanes."""
    updated_lanes = {}
    
    # For each lane, keep only champions that exist in the full champion list
    for lane, champions in current_lanes.items():
        valid_champions = [c for c in champions if c in all_champions]
        updated_lanes[lane] = sorted(valid_champions)
    
    # Find champions not in any lane
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
    
    # Print statistics
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
        # Download champion data
        champion_data = download_champion_data()
        
        # Get all champion names
        all_champions = get_all_champions(champion_data)
        print(f"Found {len(all_champions)} total champions in Data Dragon")
        
        # Load current lanes
        current_lanes = load_current_lanes()
        
        # Update lanes with validated champions
        updated_lanes = update_lanes_json(all_champions, current_lanes)
        
        # Save to lanes.json
        save_lanes_json(updated_lanes)
        
        print("\nProcessing complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == "__main__":
    main()
