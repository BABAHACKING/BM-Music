import os
import requests

images = {
    # Alternative URLs
    "sad-boy.jpg": "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&h=300&fit=crop",
    "vintage-radio.jpg": "https://images.unsplash.com/photo-1595183353597-8d0113f0e018?w=300&h=300&fit=crop"
}

output_dir = "assets/images"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for filename, url in images.items():
    try:
        response = requests.get(url)
        if response.status_code == 200:
            with open(os.path.join(output_dir, filename), 'wb') as f:
                f.write(response.content)
            print(f"Downloaded {filename}")
        else:
            print(f"Failed to download {filename}: {response.status_code}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
