import os
import json
from PIL import Image

def stitch_project_rails():
    # Setup paths
    workspace_dir = "/Users/vhnmns/Documents/projects/papazian-archive"
    artifacts_dir = "/Users/vhnmns/.gemini/antigravity/brain/41acb159-f850-40b5-bd34-181f921aaf51"
    manifest_path = os.path.join(workspace_dir, "scripts", "gallery-manifest.json")
    
    if not os.path.exists(manifest_path):
        print(f"Manifest not found: {manifest_path}")
        return
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    target_height = 400
    gap = 12
    bg_color = (0, 0, 0) # Black background
    
    os.makedirs(artifacts_dir, exist_ok=True)
    
    for slug, img_srcs in manifest.items():
        print(f"Stitching rail for project: {slug}")
        images = []
        total_width = 0
        
        for src in img_srcs:
            # Clean up the src path to point to the local file
            if src.startswith("/"):
                src = src[1:]
            
            # Paths are in public/
            local_path = os.path.join(workspace_dir, "public", src)
            
            if not os.path.exists(local_path):
                # Fallback to direct check
                local_path = os.path.join(workspace_dir, src)
                
            if os.path.exists(local_path):
                try:
                    img = Image.open(local_path)
                    # Convert to RGB to ensure compatibility
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # Calculate new size keeping aspect ratio
                    w, h = img.size
                    new_width = int(w * (target_height / h))
                    
                    # Resize image
                    resized_img = img.resize((new_width, target_height), Image.Resampling.LANCZOS)
                    images.append(resized_img)
                    total_width += new_width
                except Exception as e:
                    print(f"Error loading {local_path}: {e}")
            else:
                print(f"File not found: {local_path}")
                
        if not images:
            print(f"No valid images found for {slug}")
            continue
            
        # Add gaps between images
        canvas_width = total_width + (len(images) - 1) * gap
        canvas_height = target_height
        
        # Create final rail canvas
        rail_img = Image.new("RGB", (canvas_width, canvas_height), bg_color)
        
        current_x = 0
        for img in images:
            rail_img.paste(img, (current_x, 0))
            current_x += img.width + gap
            
        # Save output to artifacts folder
        output_filename = f"{slug}_rail.png"
        output_path = os.path.join(artifacts_dir, output_filename)
        rail_img.save(output_path, "PNG")
        print(f"Saved stitched rail to: {output_path}")

if __name__ == "__main__":
    stitch_project_rails()
