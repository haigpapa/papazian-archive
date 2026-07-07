import os
import re

directory = "src"
replacements = {
    r"text-text-muted/40": "text-text-muted-quiet",
    r"text-text-muted/60": "text-text-muted-quiet",
    r"text-text-muted/64": "text-text-muted-quiet",
    r"text-text-muted/80": "text-text-muted",
}

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
                
            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(r'\b' + old + r'\b', new, new_content)
                
            if content != new_content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
