import os
import json

MODES_DIR = 'modes'
OUTPUT_FILE = 'modes.json'

def process_modes():
    modes = []
    
    if not os.path.exists(MODES_DIR):
        print(f"Directory '{MODES_DIR}' not found. Creating it...")
        os.makedirs(MODES_DIR)
        return []

    print(f"Scanning '{MODES_DIR}' for images...")
    
    for filename in os.listdir(MODES_DIR):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
            name_no_ext = os.path.splitext(filename)[0]
            title = name_no_ext.replace('_', ' ')
            
            modes.append({
                "id": name_no_ext,
                "name": title,
                "url": f"{MODES_DIR}/{filename}",
                "type": "gamemode"
            })
            
    modes.sort(key=lambda x: x['name'])
    
    return modes

def save_json(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} modes to {output_file}")

def main():
    try:
        modes_data = process_modes()
        save_json(modes_data, OUTPUT_FILE)
        print("\nProcessing complete!")
    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == '__main__':
    main()
