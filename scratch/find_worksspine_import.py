import os
import json

brain_dir = "/Users/vhnmns/.gemini/antigravity/brain/"
print("Searching for WorksSpine imports...")

for conv_id in os.listdir(brain_dir):
    conv_path = os.path.join(brain_dir, conv_id)
    if not os.path.isdir(conv_path) or conv_id.startswith('.'):
        continue
    log_path = os.path.join(conv_path, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(log_path):
        continue
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            for idx, line in enumerate(f):
                if "WorksSpine" in line and "import" in line:
                    print(f"Conv: {conv_id} | Line: {idx} | content: {line[:200]}")
    except Exception:
        pass
