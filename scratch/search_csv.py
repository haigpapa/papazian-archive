import os
import csv

csv_files = [
    "/Users/vhnmns/Documents/projects/papazian-archive/content/haig-papazian-comprehensive-master-project-archive - Haig Papazian - Comprehensive Master Project Archive.csv",
    "/Users/vhnmns/Documents/projects/papazian-archive/content/project-master.csv"
]

images = [
    "tebr-ghost-figure-scan.png",
    "tebr-maqam-standing-wave.png",
    "tebr-resonance-rings.png",
    "tebr-violin-bridge-icon.png",
    "tebr-violin-waveform.webp",
    "tebr-diasporic-futurism-visual.png",
    "mekena-modular-block-assembly.png",
    "mekena-nyc-adaptive-reuse-exterior.png",
    "siwue-mobius-structure.png"
]

for csv_file in csv_files:
    print(f"Searching: {os.path.basename(csv_file)}")
    with open(csv_file, "r", encoding="utf-8") as f:
        content = f.read()
        for img in images:
            if img in content:
                print(f"  Found '{img}'")
                # print occurrences
                f.seek(0)
                reader = csv.reader(f)
                for row_idx, row in enumerate(reader):
                    row_str = " | ".join(row)
                    if img in row_str:
                        print(f"    Line {row_idx+1}: {row_str[:200]}...")
