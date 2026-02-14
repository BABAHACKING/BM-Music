import os
import requests

# Holi/Festival vibe
url = "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=300&h=300&fit=crop"
output_path = "assets/images/desi-vibes.jpg"

try:
    response = requests.get(url)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print("Downloaded desi-vibes.jpg")
    else:
        print(f"Failed to download: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
