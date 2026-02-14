import os
import requests

# Dictionary of images to download
# Using reliable Unsplash IDs for aesthetic/anime vibes
images = {
    # Updates for existing cards (More Anime/Aesthetic)
    "lofi-chill.jpg": "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=300&h=300&fit=crop", # Laptop/Cozy Art
    "desi-vibes.jpg": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=300&fit=crop", # Vintage Friends/Aesthetic
    "road-trip.jpg": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&h=300&fit=crop", # Sunset Road Trip
    "romantic-hits.jpg": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=300&fit=crop", # Anime-ish sparkles/heart vibe
    
    # New Cards
    "phonk-drift.jpg": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=300&fit=crop", # JDM Car/Neon
    "morning-coffee.jpg": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=300&fit=crop", # Coffee Aesthetic
    "sleep-stories.jpg": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=300&fit=crop" # Starry Night
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
