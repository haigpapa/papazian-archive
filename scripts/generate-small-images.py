import os
from PIL import Image

TARGET_DIRS = [
    os.path.join(os.getcwd(), 'public/images/projects'),
    os.path.join(os.getcwd(), 'public/images/atlas')
]

print("Scanning directories for image optimization...")
processed_count = 0
skipped_count = 0

for target_dir in TARGET_DIRS:
    if not os.path.exists(target_dir):
        continue
    
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in ['.webp', '.png', '.jpg', '.jpeg']:
                continue
            
            name = os.path.splitext(file)[0]
            
            # Skip already resized files or backup copies
            if (
                name.endswith('-small') or
                name.endswith('-hero') or
                name.endswith('-rail') or
                name.endswith('-thumb') or
                name == 'backup'
            ):
                skipped_count += 1
                continue
            
            file_path = os.path.join(root, file)
            output_path = os.path.join(root, f"{name}-small.webp")
            
            # If already exists, skip it
            if os.path.exists(output_path):
                skipped_count += 1
                continue
            
            try:
                with Image.open(file_path) as img:
                    width, height = img.size
                    
                    # Create thumbnail with max dimension 600px
                    img.thumbnail((600, 600), Image.Resampling.LANCZOS)
                    
                    # Ensure output folder exists (it should, but just in case)
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    
                    # Save as optimized webp
                    img.save(output_path, "WEBP", quality=75)
                    
                    new_width, new_height = img.size
                    print(f"Resized: {name}{ext} ({width}x{height}) -> {name}-small.webp ({new_width}x{new_height})")
                    processed_count += 1
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

print(f"Done! Resized {processed_count} images. Skipped/Already processed: {skipped_count}.")
