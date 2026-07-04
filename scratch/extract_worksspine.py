import json

log_path = "/Users/vhnmns/.gemini/antigravity/brain/60ebef59-47d8-4fec-9bd8-d0ab602e4bda/.system_generated/logs/transcript.jsonl"
print(f"Reading logs from {log_path}...")

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 100: # Line index 100
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            print(f"Tool calls count: {len(tool_calls)}")
            for tc in tool_calls:
                args = tc.get("args", {})
                if isinstance(args, str):
                    args = json.loads(args)
                code = args.get("CodeContent", "")
                if code:
                    out_path = "/Users/vhnmns/Documents/projects/papazian-archive/src/components/WorksSpine.tsx"
                    with open(out_path, "w", encoding="utf-8") as out:
                        out.write(code)
                    print(f"Saved WorksSpine.tsx to {out_path}")
                    print(f"Length: {len(code)} characters.")
                    break
