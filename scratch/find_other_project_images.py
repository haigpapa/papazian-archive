import os

gdrive_parent = "/Users/vhnmns/Library/CloudStorage/GoogleDrive-haig.papazian@gmail.com/My Drive/FICTIVE_ENVIRONMENTS_PARENT_DIR (FMNTECH LLC)/05_ASSETS_LIBRARY/atlas-photos"

project_keywords = [
    "cartography", "absence", "storylines", "maqam", "codeverse", "chronocumulator", "hah-was", "hah_was",
    "localization", "leila", "low-res", "low_res", "choreography", "fictive", "nodes", "derive"
]

extensions = (".png", ".webp", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG", ".WEBP")

for folder in ["atlas", "new-images"]:
    dir_path = os.path.join(gdrive_parent, folder)
    if not os.path.exists(dir_path):
        continue
    print(f"Searching: {folder}")
    matched = []
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith(extensions):
                file_lower = file.lower()
                for kw in project_keywords:
                    if kw in file_lower:
                        rel_path = os.path.relpath(os.path.join(root, file), dir_path)
                        matched.append((kw, rel_path))
                        break # Only match once
    
    # Sort and print
    for kw, rel_path in sorted(matched):
        print(f"  - [{kw}] {rel_path}")
