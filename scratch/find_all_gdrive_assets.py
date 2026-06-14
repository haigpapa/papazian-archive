import os

gdrive_parent = "/Users/vhnmns/Library/CloudStorage/GoogleDrive-haig.papazian@gmail.com/My Drive/FICTIVE_ENVIRONMENTS_PARENT_DIR (FMNTECH LLC)"

extensions = (".png", ".webp", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG", ".WEBP")

# Walk the drive
for root, dirs, files in os.walk(gdrive_parent):
    # Skip hidden directories like .tmp or .git if any
    if any(part.startswith('.') for part in root.split(os.sep)):
        continue
    images = [f for f in files if f.endswith(extensions)]
    if images:
        rel_path = os.path.relpath(root, gdrive_parent)
        # Only print directories with fewer than 30 files to avoid spamming for screenshots,
        # or print a summary.
        if len(images) > 30:
            print(f"Folder: {rel_path} ({len(images)} images found)")
        else:
            print(f"Folder: {rel_path}")
            for img in sorted(images):
                print(f"  - {img}")
