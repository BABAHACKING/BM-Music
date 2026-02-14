import os
import requests

url = "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=300&h=300&fit=crop" # Alternative Lo-Fi
output_path = "assets/images/lofi-chill.jpg"

try:
    response = requests.get(url)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print("Downloaded lofi-chill.jpg")
    else:
        print(f"Failed to download: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
