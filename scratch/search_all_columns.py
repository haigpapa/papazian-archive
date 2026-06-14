import csv

csv_path = "/Users/vhnmns/Documents/projects/papazian-archive/content/haig-papazian-comprehensive-master-project-archive - Haig Papazian - Comprehensive Master Project Archive.csv"

extensions = (".png", ".webp", ".jpg", ".jpeg")

with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)
    print("Columns:", header)
    for row_idx, row in enumerate(reader):
        row_dict = dict(zip(header, row))
        project_name = row_dict.get("project_name", row_dict.get("project_id", f"Row {row_idx}"))
        found = []
        for col_name, value in row_dict.items():
            if any(ext in value.lower() for ext in extensions):
                found.append(f"{col_name}: {value}")
        if found:
            print(f"Project: {project_name}")
            for f in found:
                print(f"  {f}")
