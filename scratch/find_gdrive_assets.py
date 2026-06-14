import os

gdrive_parent = "/Users/vhnmns/Library/CloudStorage/GoogleDrive-haig.papazian@gmail.com/My Drive/FICTIVE_ENVIRONMENTS_PARENT_DIR (FMNTECH LLC)/10_ACTIVE_PROJECTS"

extensions = (".png", ".webp", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG", ".WEBP")

for root, dirs, files in os.walk(gdrive_parent):
    images = [f for f in files if f.endswith(extensions)]
    if images:
        rel_path = os.path.relpath(root, gdrive_parent)
        print(f"Folder: {rel_path}")
        for img in sorted(images):
            print(f"  - {img}")
