import zipfile

zip_path = "/Users/vhnmns/Downloads/Portfolio-Display.zip"

try:
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        names = zip_ref.namelist()
        csv_files = [n for n in names if n.endswith(".csv")]
        print(f"Total CSV files in zip: {len(csv_files)}")
        for csv in csv_files:
            print(f"  - {csv}")
except Exception as e:
    print(f"Error reading zip: {e}")
