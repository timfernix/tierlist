import json
import urllib.request

VERSION_URL = "https://ddragon.leagueoflegends.com/api/versions.json"

def get_latest_version():
    """Fetch the latest version from Data Dragon."""
    print("Fetching latest version...")
    try:
        with urllib.request.urlopen(VERSION_URL) as response:
            versions = json.loads(response.read().decode('utf-8'))
            return versions[0]
    except Exception as e:
        print(f"Error fetching version: {e}")
        raise e
