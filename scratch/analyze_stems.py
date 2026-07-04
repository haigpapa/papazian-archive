import os
import subprocess
import struct
import math

STEMS_DIR = "/Users/vhnmns/Documents/projects/papazian-archive/content/saltwater"
files = [
    "3 Synth.wav",
    "5 Bass.wav",
    "6 Drums.wav",
    "8 Vocals.wav"
]

def analyze_wav_via_ffmpeg(filepath):
    print(f"Analyzing {os.path.basename(filepath)} via ffmpeg...")
    try:
        # Run ffmpeg to get duration and check format
        cmd_info = ["ffmpeg", "-i", filepath]
        res_info = subprocess.run(cmd_info, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
        info_err = res_info.stderr.decode('utf-8', errors='ignore')
        
        # Parse duration
        duration = 0.0
        for line in info_err.split('\n'):
            if "Duration:" in line:
                parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
                duration = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
                break
        
        print(f"  Duration parsed: {duration:.2f}s")
        if duration == 0:
            duration = 580.0 # fallback
            
        # Segment duration: 10 seconds
        sample_rate = 8000
        bytes_per_sample = 2 # 16-bit
        segment_frames = 10 * sample_rate
        segment_bytes = segment_frames * bytes_per_sample
        
        # Convert file to mono s16le raw PCM at 8000Hz via ffmpeg stdout pipe
        cmd_pcm = [
            "ffmpeg", "-y", "-i", filepath,
            "-f", "s16le", "-ac", "1", "-ar", str(sample_rate), "-"
        ]
        
        process = subprocess.Popen(cmd_pcm, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        
        rms_values = []
        while True:
            data = process.stdout.read(segment_bytes)
            if not data:
                break
            
            num_samples = len(data) // bytes_per_sample
            if num_samples == 0:
                break
                
            fmt = f"<{num_samples}h"
            samples = struct.unpack(fmt, data[:num_samples * bytes_per_sample])
            
            # Compute RMS
            square_sum = sum(s ** 2 for s in samples)
            mean_square = square_sum / num_samples
            rms = math.sqrt(mean_square)
            # Normalize for 16-bit (max signed 16-bit is 32768)
            normalized_rms = rms / 32768.0
            rms_values.append(normalized_rms)
            
        process.stdout.close()
        process.wait()
        return duration, rms_values
    except Exception as e:
        print(f"  Error: {e}")
        return None

results = {}
for filename in files:
    filepath = os.path.join(STEMS_DIR, filename)
    if os.path.exists(filepath):
        res = analyze_wav_via_ffmpeg(filepath)
        if res:
            results[filename] = res

# Print a nice markdown-style report of activity
if results:
    first_file = list(results.keys())[0]
    duration, _ = results[first_file]
    
    # Pad all lists to same length
    max_len = max(len(results[f][1]) for f in results)
    for f in results:
        results[f] = (results[f][0], results[f][1] + [0.0] * (max_len - len(results[f][1])))
        
    print("\n### Activity Matrix (RMS amplitude per 10-second window)\n")
    header = "| Time | " + " | ".join(results.keys()) + " |"
    divider = "| --- | " + " | ".join("---" for _ in results.keys()) + " |"
    print(header)
    print(divider)
    
    for seg_idx in range(max_len):
        time_str = f"{seg_idx * 10 // 60:02d}:{seg_idx * 10 % 60:02d}"
        row_vals = []
        for filename in results:
            rms_val = results[filename][1][seg_idx]
            # Use visual blocks to represent volume: [      ], [░░░   ], [██████]
            percentage = min(1.0, rms_val * 6) # amplify for visibility
            blocks = int(percentage * 6)
            visual = "█" * blocks + "░" * (6 - blocks)
            row_vals.append(f"{rms_val:.4f} ({visual})")
        print(f"| {time_str} | " + " | ".join(row_vals) + " |")
