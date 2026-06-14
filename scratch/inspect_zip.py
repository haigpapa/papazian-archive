import zipfile
import os

zip_paths = [
    "/Users/vhnmns/Downloads/Photos.zip",
    "/Users/vhnmns/Downloads/Portfolio-Display.zip",
    "/Users/vhnmns/Downloads/Tactile Topography — Haig Papazian.zip"
]

for zip_path in zip_paths:
    if os.path.exists(zip_path):
        print(f"Zip: {os.path.basename(zip_path)}")
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                names = zip_ref.namelist()
                print(f"  Total files: {len(names)}")
                # Print first 20 names
                for name in names[:30]:
                    print(f"    - {name}")
                if len(names) > 30:
                    print("    ...")
        except Exception as e:
            print(f"  Error reading zip: {e}")
    else:
        print(f"Zip path does not exist: {zip_path}")
