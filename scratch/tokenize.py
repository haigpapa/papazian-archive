import os
import re

directory = "src"
replacements = {
    r"border-white/10": "border-ui-border",
    r"border-white/8": "border-ui-border",
    r"border-white/12": "border-ui-border",
    r"border-white/15": "border-ui-border-hover",
    r"border-white/20": "border-ui-border-hover",
    r"border-white/25": "border-ui-border-hover",
    r"bg-white/5": "bg-ui-bg",
    r"bg-white/3": "bg-ui-bg",
    r"bg-white/10": "bg-ui-bg-hover",
    r"bg-white/20": "bg-ui-bg-active",
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
