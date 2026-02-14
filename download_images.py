import os
import requests

images = {
    "happy-hits.jpg": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop",
    "retro-vibes.jpg": "https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?w=300&h=300&fit=crop",
    "sad-boy.jpg": "https://images.unsplash.com/photo-1515595914619-74d12ec08cc8?w=300&h=300&fit=crop",
    "party-vibes.jpg": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=300&fit=crop",
    "anime-scenery.jpg": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop",
    "gym-neon.jpg": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop",
    "cyberpunk-city.jpg": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=300&h=300&fit=crop",
    "vintage-radio.jpg": "https://images.unsplash.com/photo-1584448141569-69f343167b5e?w=300&h=300&fit=crop",
    "car-sunset.jpg": "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=300&h=300&fit=crop",
    "anime-couple.jpg": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&h=300&fit=crop",
    "lofi-chill.jpg": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300&h=300&fit=crop"
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
