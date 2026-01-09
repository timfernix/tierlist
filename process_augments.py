import json
import urllib.request
import os
import re

URL = "https://raw.communitydragon.org/latest/game/maps/modespecificdata/augments.bin.json"
STRINGTABLE_URL = "https://raw.communitydragon.org/latest/game/en_us/data/menu/en_us/lol.stringtable.json"
OUTPUT_FILE = "aram_augments.json"

def fetch_data():
    print(f"Fetching data from {URL}...")
    with urllib.request.urlopen(URL) as response:
        return json.loads(response.read().decode('utf-8'))

def fetch_strings():
    print(f"Fetching string table from {STRINGTABLE_URL}...")
    with urllib.request.urlopen(STRINGTABLE_URL) as response:
        return json.loads(response.read().decode('utf-8'))

def resolve_variables(description, values):
    def replace_match(match):
        var_name = match.group(1)
        multiplier_str = match.group(3)
        
        if var_name in values:
            val = values[var_name]
            if multiplier_str:
                val *= float(multiplier_str)
            
            if val.is_integer():
                return f"{int(val)}"
            else:
                 return f"{val:g}"
        return match.group(0)

    pattern = r'@(\w+)(\*([\d\.]+))?@'
    return re.sub(pattern, replace_match, description)

def clean_description(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace("{{ Item_Keyword_OnHit }}", "onhit")
    return text

def process_augments(data, strings):
    augments = []
    
    for key, value in data.items():
        if re.match(r"Maps/ModeSpecificData/Augments/[^/]+$", key):
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
            
            desc_key = value.get("DescriptionTra", "")
            description = ""
            
            if desc_key:
                if "entries" in strings:
                    description = strings["entries"].get(desc_key, "")
                    if not description:
                        description = strings["entries"].get(desc_key.lower(), "")
                else:
                    description = strings.get(desc_key, "")
                    if not description:
                        description = strings.get(desc_key.lower(), "")

            root_spell_key = value.get("RootSpell")
            values = {}
            if root_spell_key and root_spell_key in data:
                spell_data = data[root_spell_key]
                if "mSpell" in spell_data and "DataValues" in spell_data["mSpell"]:
                    for dv in spell_data["mSpell"]["DataValues"]:
                        var_name = dv.get("mName")
                        vals = dv.get("mValues")
                        if var_name and vals:
                            values[var_name] = vals[0]
            
            if description:
                description = resolve_variables(description, values)
                description = clean_description(description)

            augments.append({
                "id": key,
                "name": name,
                "url": icon_url,
                "description": description
            })
            
    return augments

def main():
    data = fetch_data()
    strings = fetch_strings()
    
    augments = process_augments(data, strings)
    
    print(f"Found {len(augments)} ARAM augments.")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(augments, f, indent=2)
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
