import os
import subprocess

# Stems and Outputs directories
STEMS_DIR = "/Users/vhnmns/Documents/projects/papazian-archive/content/saltwater"
OUTPUT_DIR = "/Users/vhnmns/Documents/projects/papazian-archive/public/audio/stems"

# Define the loops configuration (SHORTER, NO VOCALS, WITH EFFECTS)
LOOPS_CONFIG = {
    "tebr": {
        "start": "00:00:30",
        "duration": "6.0",
        "stems": ["3 Synth.wav", "5 Bass.wav", "6 Drums.wav", "2 FX.wav"],
        "description": "Short instrumental loop for TEBR (Synth, Bass, Drums, FX)."
    },
    "space-time-tuning-machine": {
        "start": "00:00:20",
        "duration": "6.0",
        "stems": ["5 Bass.wav", "6 Drums.wav", "4 Percussion.wav"],
        "description": "Short bass and drum loop for Space Time Tuning Machine."
    },
    "sometimes-i-wake-up-elsewhere": {
        "start": "00:02:00",
        "duration": "6.0",
        "stems": ["3 Synth.wav", "2 FX.wav"],
        "description": "Short spacey ambient loop for Sometimes I Wake Up Elsewhere."
    },
    "fictive-environments": {
        "start": "00:01:30",
        "duration": "6.0",
        "stems": ["3 Synth.wav", "2 FX.wav"],
        "description": "Short filtered synth and FX loop for Fictive Environments."
    }
}

def generate_loop(name, config):
    print(f"\n--- Generating short loop: {name} ---")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    stems = config["stems"]
    start = config["start"]
    duration = float(config["duration"])
    
    # Check if files exist
    valid_inputs = []
    for s in stems:
        path = os.path.join(STEMS_DIR, s)
        if os.path.exists(path):
            valid_inputs.append(path)
            
    if not valid_inputs:
        print("  Error: No valid stems found.")
        return
        
    cmd_inputs = []
    for path in valid_inputs:
        cmd_inputs.extend(["-ss", start, "-t", str(duration), "-i", path])
        
    num_inputs = len(valid_inputs)
    
    # Audio effects chain:
    # 1. amix: mix N inputs
    # 2. highpass/lowpass: create a bandpass filter (250Hz - 2500Hz) to sound focused and historical
    # 3. aecho: add a spacey delay/echo effect (400ms delay, 25% feedback)
    # 4. afade: fade-in and fade-out (0.4s and 0.5s for seamless short looping)
    # 5. pan: convert to mono
    fade_in_duration = 0.4
    fade_out_duration = 0.5
    fade_out_start = duration - fade_out_duration
    
    filter_graph = (
        f"amix=inputs={num_inputs}:duration=longest:dropout_transition=0,"
        f"highpass=f=250,lowpass=f=2500,"
        f"aecho=0.8:0.4:400:0.25,"
        f"afade=t=in:ss=0:d={fade_in_duration},"
        f"afade=t=out:st={fade_out_start}:d={fade_out_duration},"
        f"pan=mono|c0=c0"
    )
    
    mp3_out = os.path.join(OUTPUT_DIR, f"{name}.mp3")
    ogg_out = os.path.join(OUTPUT_DIR, f"{name}.ogg")
    
    cmd_mp3 = ["ffmpeg", "-y"] + cmd_inputs + [
        "-filter_complex", filter_graph,
        "-b:a", "128k",
        mp3_out
    ]
    
    cmd_ogg = ["ffmpeg", "-y"] + cmd_inputs + [
        "-filter_complex", filter_graph,
        "-b:a", "128k",
        ogg_out
    ]
    
    try:
        subprocess.run(cmd_mp3, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print(f"  Created: {mp3_out}")
        subprocess.run(cmd_ogg, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print(f"  Created: {ogg_out}")
    except subprocess.CalledProcessError as e:
        print(f"  FFmpeg Error: {e.stderr.decode('utf-8', errors='ignore')}")

for loop_name, loop_config in LOOPS_CONFIG.items():
    generate_loop(loop_name, loop_config)

print("\nShort instrumental loops generated successfully!")
