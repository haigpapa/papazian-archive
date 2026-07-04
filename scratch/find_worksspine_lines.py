import json

log_path = "/Users/vhnmns/.gemini/antigravity/brain/60ebef59-47d8-4fec-9bd8-d0ab602e4bda/.system_generated/logs/transcript.jsonl"
print(f"Searching {log_path}...")

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "WorksSpine.tsx" in line:
            try:
                data = json.loads(line)
                step = data.get("step_index", "")
                type_ = data.get("type", "")
                print(f"Line {idx} | Step {step} | Type {type_} | line len {len(line)}")
            except Exception:
                print(f"Line {idx} (invalid json) | line len {len(line)}")
