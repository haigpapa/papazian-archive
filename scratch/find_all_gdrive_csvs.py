import os

gdrive_parent = "/Users/vhnmns/Library/CloudStorage/GoogleDrive-haig.papazian@gmail.com/My Drive/FICTIVE_ENVIRONMENTS_PARENT_DIR (FMNTECH LLC)"

for root, dirs, files in os.walk(gdrive_parent):
    csvs = [f for f in files if f.endswith(".csv")]
    if csvs:
        rel_path = os.path.relpath(root, gdrive_parent)
        print(f"Folder: {rel_path}")
        for csv_file in csvs:
            print(f"  - {csv_file}")
            print(f"    Full path: {os.path.join(root, csv_file)}")
