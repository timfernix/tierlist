import json
import urllib.request
import os
import re

URL = "https://raw.communitydragon.org/latest/game/maps/modespecificdata/kiwi.bin.json"
STRINGTABLE_URL = "https://raw.communitydragon.org/latest/game/en_us/data/menu/en_us/lol.stringtable.json"
OUTPUT_FILE = "aram_augments.json"

def fetch_data():
    print(f"Fetching data from {URL}...")
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def fetch_strings():
    print(f"Fetching string table from {STRINGTABLE_URL}...")
    req = urllib.request.Request(STRINGTABLE_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def get_part_value(part, values):
    if "mNumber" in part:
        return part["mNumber"]
    if "mDataValue" in part and part["mDataValue"] in values:
        return values[part["mDataValue"]]
    if "mStartValue" in part:
        return part["mStartValue"]
    return 1.0

def resolve_calculation(name, calculations, values):
    if name not in calculations:
        return None
    
    calc = calculations[name]
    
    base_val = None
    if "mFormulaParts" in calc:
        for part in calc["mFormulaParts"]:
            if "mStartValue" in part and "mEndValue" in part:
                start = part["mStartValue"]
                end = part["mEndValue"]
                if start == end:
                    base_val = start
                else:
                    base_val = (start, end)
                break # Found base value
            elif "mNumber" in part:
                 base_val = part["mNumber"]
                 break # Found base value
    
    if "mModifiedGameCalculation" in calc:
        base_val = resolve_calculation(calc["mModifiedGameCalculation"], calculations, values)
    
    if base_val is None:
        return None
        
    if "mMultiplier" in calc:
        mult = calc["mMultiplier"]
        multiplier_val = 1.0
        
        if "mNumber" in mult: 
             multiplier_val = mult["mNumber"]
        elif "mPart1" in mult and "mPart2" in mult:
             v1 = get_part_value(mult["mPart1"], values)
             v2 = get_part_value(mult["mPart2"], values)
             multiplier_val = v1 * v2
        elif "mDataValue" in mult and mult["mDataValue"] in values:
             multiplier_val = values[mult["mDataValue"]]
        
        if mult.get("__type") == "ProductOfSubPartsCalculationPart":
             v1 = get_part_value(mult.get("mPart1", {}), values)
             v2 = get_part_value(mult.get("mPart2", {}), values)
             multiplier_val = v1 * v2

        if isinstance(base_val, tuple):
             return (base_val[0] * multiplier_val, base_val[1] * multiplier_val)
        else:
             return base_val * multiplier_val
             
    return base_val

def resolve_variables(description, values, calculations):
    def replace_match(match):
        var_name = match.group(1)
        multiplier_str = match.group(3)
        
        val = None
        
        if var_name in values:
            val = values[var_name]
        
        elif var_name in calculations:
            val = resolve_calculation(var_name, calculations, values)

        if val is not None:
             if multiplier_str:
                 mult = float(multiplier_str)
                 if isinstance(val, tuple):
                     val = (val[0] * mult, val[1] * mult)
                 else:
                     val = val * mult
             
             if isinstance(val, tuple):
                 return f"{val[0]:g}-{val[1]:g}"
             elif isinstance(val, str):
                 return val
             else:
                 if isinstance(val, float) and val.is_integer():
                     return f"{int(val)}"
                 return f"{val:g}"

        static_map = {
            "AP": "AP",
            "AD": "AD",
            "Armor": "Armor",
            "MR": "Magic Resist",
            "Health": "Health",
            "AdaptiveAmp": "Adaptive Force",
            "ShieldAmount": "Shield Amount", 
            "ADPerAS": "AD per Attack Speed",
            "TotalShield": "Shield",
            "TotalDamageOverTimeTooltip": "Damage"
        }
        if var_name in static_map:
            return static_map[var_name]
            
        return match.group(0)

    pattern = r'@(\w+)(\*([\d\.]+))?@'
    return re.sub(pattern, replace_match, description)

def clean_description(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'%i\s*[^"]*?%', '', text)
    text = re.sub(r'Spell\.[a-zA-Z0-9]+', '', text)
    text = text.replace("{{ Item_Keyword_OnHit }}", "onhit")
    text = text.replace(" .", ".")
    text = text.replace("  ", " ")
    return text.strip()

def clean_augment_name(name):
    if name.startswith("Quest_ "):
        name = name.replace("Quest_ ", "Quest: ")
    elif name.startswith("Upgrade_ "):
        name = name.replace("Upgrade_ ", "Upgrade: ")
    
    corrections = {
        "esc A P A De": "escAPADe",
        "A D A Pt": "ADAPt",
        "Threadthe Needle": "Thread the Needle",
        "Backto Basics": "Back to Basics",
        "Lightem Up": "Light em Up",
        "Symphonyof War": "Symphony of War",
        "Masterof Duality": "Master of Duality",
        "Mindto Matter": "Mind to Matter",
        "Courageofthe Colossus": "Courage of the Colossus",
        "Orbital Laser_ Active": "Orbital Laser",
        "Circleof Death": "Circle of Death"
    }

    if name in corrections:
        return corrections[name]
    
    return name

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
                name = clean_augment_name(name)
            
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
            calculations = {}
            if root_spell_key and root_spell_key in data:
                spell_data = data[root_spell_key]
                if "mSpell" in spell_data:
                    mSpell = spell_data["mSpell"]
                    if "DataValues" in mSpell:
                        for dv in mSpell["DataValues"]:
                            var_name = dv.get("mName")
                            vals = dv.get("mValues")
                            if var_name and vals:
                                values[var_name] = vals[0]
                    if "mSpellCalculations" in mSpell:
                        calculations = mSpell["mSpellCalculations"]
            
            if "MysticPunch" in key and "CooldownRefund" in values:
                values["CooldownRefund"] = "20%" 
            
            if "ProteinShake" in key and "ConversionRate" in values:
                 values["BonusHSPower"] = values["ConversionRate"] * 100

            if description:
                description = resolve_variables(description, values, calculations)
                description = clean_description(description)
                
                if "MysticPunch" in key:
                     description = description.replace(" seconds", "")

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
