import urllib.request
import json
import re

URL = "https://raw.communitydragon.org/latest/game/maps/modespecificdata/kiwi.bin.json"

def fetch_data():
    print(f"Fetching data from {URL}...")
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

data = fetch_data()
found = False
for key, value in data.items():
    if any(name in key for name in ["ProteinShake", "RabbleRousing", "MysticPunch"]):
        print(f"--- Found {key} ---")
        root_spell = value.get("RootSpell")
        if root_spell and root_spell in data:
            spell_data = data[root_spell]
            print(f"--- RootSpell: {root_spell} ---")
            if "mSpell" in spell_data:
                 mSpell = spell_data["mSpell"]
                 if "DataValues" in mSpell:
                     print("DataValues:", json.dumps(mSpell["DataValues"], indent=2))
                 if "mEffectAmount" in mSpell:
                     print("mEffectAmount:", json.dumps(mSpell["mEffectAmount"], indent=2))
                 if "mSpellCalculations" in mSpell:
                     print("mSpellCalculations:", json.dumps(mSpell["mSpellCalculations"], indent=2))
            else:
                print("No mSpell in spell_data")
        else:
            print("RootSpell not found or invalid")
            
        found = True
        # break

if not found:
    print("Augments not found")
