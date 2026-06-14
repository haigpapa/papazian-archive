import os
import re
import csv
import json
import shutil

# Paths
downloads_dir = "/Users/vhnmns/Downloads"
workspace_dir = "/Users/vhnmns/Documents/projects/papazian-archive"
gdrive_assets_dir = os.path.join(workspace_dir, "content", "papazian_archive_15_project_assets")

rail_bible_path = os.path.join(downloads_dir, "FINAL CINEMATIC RAIL BIBLE.txt")
matrix_path = os.path.join(workspace_dir, "content", "Papazian Archive — 15-Project Works Spine Copy Matrix.txt")

# Normalization mapping for project names
slug_mapping = {
    "systemschoreography": "systems-choreography",
    "fictiveenvironments": "fictive-environments",
    "themeaningstack": "meaning-stack",
    "99nodes": "99-nodes",
    "architectureinlowres": "architecture-in-low-res",
    "thecartographyofabsence": "cartography-of-absence",
    "mashrouleila": "mashrou-leila",
    "whywerelikethis": "why-were-like-this",
    "spacetimetuningmachine": "space-time-tuning-machine",
    "tebr": "tebr",
    "chronocumulator": "chronocumulator",
    "theweatherrehearsal": "the-weather-rehearsal",
    "sometimesiwakeupelsewhere": "sometimes-i-wake-up-elsewhere",
    "derive": "derive",
    "storylines": "storylines",
    "hahwas": "hah-was",
    "localizationgap": "localization-gap",
    "maqamai": "maqamai",
    "mekenanyc": "mekena-nyc",
    "codeverseexplorer": "codeverse-explorer"
}

def normalize_name(name):
    # Remove punctuation and spaces, convert to lowercase
    return re.sub(r"[^a-zA-Z0-9]", "", name).lower()

# Parse FINAL CINEMATIC RAIL BIBLE.txt
def parse_rail_bible():
    with open(rail_bible_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Split by double underscores or separators
    # Projects in Bible are:
    # 0.1 SYSTEMS CHOREOGRAPHY
    # 0.2 FICTIVE ENVIRONMENTS
    # 0.3 THE MEANING STACK
    # 0.4 99 NODES
    # 1. ARCHITECTURE IN LOW RES
    # 2. THE CARTOGRAPHY OF ABSENCE
    # 3. MASHROU’ LEILA
    # 4. WHY WE’RE LIKE THIS
    # 5. SPACE TIME TUNING MACHINE
    # 6. TEBR
    # 7. CHRONOCUMULATOR
    # 8. THE WEATHER REHEARSAL
    # 9. SOMETIMES I WAKE UP ELSEWHERE
    # 10. DERIVE
    # 11. STORYLINES
    # 12. HAH-WAS
    # 13. LOCALIZATION GAP
    # 14. MAQAMAI
    # 15. MEKENA NYC
    # 16. CODEVERSE EXPLORER

    # Let's find sections using regex:
    pattern = r"(?:(?:0\.[1-4])|(?:\d+))\b\.?\s+[A-Z0-9\s’'\u2019\u2018\u2013\-]+\r?\n"
    matches = list(re.finditer(pattern, content))
    
    projects = []
    
    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i+1].start() if i < len(matches)-1 else len(content)
        section = content[start:end]
        
        lines = [line.strip() for line in section.split("\n") if line.strip()]
        header = lines[0]
        
        # Match project name
        header_match = re.match(r"^(0\.[1-4]|\d+\.?)\s+([A-Z0-9\s’'\u2019\u2018\u2013\-]+)$", header)
        if not header_match:
            print(f"Skipping header match failure: {header}")
            continue
            
        num_prefix = header_match.group(1).strip()
        proj_name = header_match.group(2).strip()
        
        norm = normalize_name(proj_name)
        slug = slug_mapping.get(norm)
        if not slug:
            print(f"No slug mapping for normalized name '{norm}' (original: '{proj_name}')")
            continue
            
        # Parse rail type and argument
        rail_type = ""
        argument = ""
        card_start_idx = 1
        
        if len(lines) > 1 and "rail" in lines[1].lower() or "dossier" in lines[1].lower():
            rail_type = lines[1]
            card_start_idx = 2
            
        if len(lines) > card_start_idx and lines[card_start_idx] == "Argument":
            argument = lines[card_start_idx+1]
            card_start_idx += 2
            
        # Parse cards
        cards = []
        card_pattern = r"^([0-9]+)\s*[-—]\s*(.+)$"
        
        j = card_start_idx
        while j < len(lines):
            line = lines[j]
            card_match = re.match(card_pattern, line)
            if card_match:
                card_num = card_match.group(1)
                card_title = card_match.group(2)
                
                details_line = lines[j+1] if j+1 < len(lines) else ""
                
                # Parse details: Chapter:, Type:, Media:, Caption:, Proof claim:
                chapter = ""
                card_role = ""
                media = ""
                caption = ""
                proof_claim = ""
                
                ch_m = re.search(r"Chapter:\s*(.*?)\s*Type:", details_line)
                ty_m = re.search(r"Type:\s*(.*?)\s*Media:", details_line)
                me_m = re.search(r"Media:\s*(.*?)\s*Caption:", details_line)
                ca_m = re.search(r"Caption:\s*(.*?)\s*Proof claim:", details_line)
                pr_m = re.search(r"Proof claim:\s*(.*?)$", details_line)
                
                if ch_m: chapter = ch_m.group(1).strip()
                if ty_m: card_role = ty_m.group(1).strip()
                if me_m: media = me_m.group(1).strip()
                if ca_m: caption = ca_m.group(1).strip()
                if pr_m: proof_claim = pr_m.group(1).strip()
                
                cards.append({
                    "number": card_num,
                    "title": card_title,
                    "chapter": chapter,
                    "role": card_role,
                    "media": media,
                    "caption": caption,
                    "proof_claim": proof_claim
                })
                j += 2
            else:
                j += 1
                
        projects.append({
            "slug": slug,
            "title": proj_name,
            "rail_type": rail_type,
            "argument": argument,
            "cards": cards
        })
        
    return projects

# Parse metadata from matrix file
def parse_matrix_metadata():
    with open(matrix_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    metadata_by_slug = {}
    current_slug = None
    current_meta = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        norm = normalize_name(line)
        slug = slug_mapping.get(norm)
        if slug:
            if current_slug:
                metadata_by_slug[current_slug] = current_meta
            current_slug = slug
            current_meta = {}
            continue
            
        if current_slug:
            if line.startswith("Year / World:"):
                current_meta["year_world"] = line.replace("Year / World:", "").strip()
            elif line.startswith("System Tags:"):
                current_meta["tags"] = line.replace("System Tags:", "").strip()
            elif line.startswith("One-Line Thesis:"):
                current_meta["thesis"] = line.replace("One-Line Thesis:", "").strip().strip('"')
            elif line.startswith("Hero Image Direction:"):
                current_meta["image_direction"] = line.replace("Hero Image Direction:", "").strip()
            elif line.startswith("Evidence / Rail Status:"):
                current_meta["status"] = line.replace("Evidence / Rail Status:", "").strip()
            elif line.startswith("Type:"):
                current_meta["type"] = line.replace("Type:", "").strip()
            elif line.startswith("Argument:"):
                current_meta["thesis"] = line.replace("Argument:", "").strip().strip('"')
                
    if current_slug:
        metadata_by_slug[current_slug] = current_meta
        
    return metadata_by_slug

def get_role_mapping(card_type):
    ct = card_type.lower()
    if "hero" in ct or "establishing" in ct:
        return "hero"
    if "thesis" in ct:
        return "thesis"
    if "system" in ct or "mechanism" in ct or "structure" in ct or "technical proof" in ct or "technical diagram" in ct or "taxonomy" in ct or "relation" in ct:
        if "relation" in ct:
            return "context"
        return "system"
    if "dossier" in ct or "conflict" in ct or "evidence" in ct or "metrics" in ct or "form" in ct or "text" in ct or "literary" in ct or "proof" in ct or "context" in ct:
        return "evidence"
    if "process" in ct or "action" in ct or "rule" in ct or "method" in ct or "analysis" in ct or "role" in ct or "authorship" in ct:
        return "process"
    if "coda" in ct:
        return "coda"
    return "evidence"

# Mapping of file names for all cinematic rail cards
rail_card_images = {
    "systems-choreography": {
        1: "systems-choreography-diagram.webp",
        3: "systems-choreography-01.png",
        4: "systems-choreography-flow-diagram.png",
        5: "systems-choreography-triangle-diagram.png",
        6: "systems-choreography-core-diagram.png",
        7: "systems-choreography-governing-emergence.png",
        8: "systems-choreography-orbital-diagram.png"
    },
    "fictive-environments": {
        1: "fictive-environments-studio-identity.webp",
        3: "fictive-environments-generated-v1.webp",
        5: "fictive-geographies.JPG"
    },
    "meaning-stack": {
        1: "meaning-stack-github-constellation.webp",
        3: "meaning-stack-diagram-01.png",
        4: "meaning-stack-diagram-02.png",
        5: "meaning-stack-network-nodes.png",
        8: "meaning-stack-processing-cultural-friction.png",
        9: "meaning_stack.png"
    },
    "99-nodes": {
        1: "99-nodes-project-grid-overview-all.webp",
        3: "99-nodes-constellation-globe.png",
        5: "99-nodes-maximalist-website-concept.png"
    },
    "architecture-in-low-res": {
        1: "01_architecture_in_low_res.png",
        3: "architecture-low-res-acetate-layers.png",
        4: "architecture-low-res-city-grid.png",
        5: "architecture-low-res-wireframe-object.png",
        6: "architecture-low-res-thesis-render.jpg",
        7: "architecture-low-res-thesis-visualization.jpg"
    },
    "cartography-of-absence": {
        1: "02_cartography_of_absence.png",
        4: "cartography-absence-document-schematic.png",
        5: "cartography-of-absence-manuscript-swirl.png",
        6: "cartography-of-absence-title-card.png",
        7: "cartography-of-absence-bureaucratic-form.webp",
        8: "cartography-of-absence-data-void-absence-index.jpeg",
        9: "cartography-of-absence-data-void-trace.jpeg"
    },
    "mashrou-leila": {
        1: "03_mashrou_leila.png",
        3: "mashrou-leila-baalbeck-roman-ruins.jpg",
        4: "mashrou-leila-self-titled-ep-cover.jpeg",
        5: "npr-tiny-desk-mashrou-leila.jpg",
        6: "lebanon-mashrou-leila-band.jpg",
        7: "mashrou-leila-debut-ep-cover.jpeg",
        8: "mashrou-leila-demo-visual.jpg",
        9: "mashrou-leila-exit.jpg",
        10: "mashrou-leila-system-diagram.png",
        11: "mashrouleila-beirut-dreams-in-color.jpg",
        12: "mashrouleila-greenpeace-bahr-360video.jpg",
        13: "mashrouleila-logo-ibnelleil.webp",
        14: "mashrouleila-logo2.webp",
        15: "mashrouleila-logo3.png"
    },
    "why-were-like-this": {
        1: "04_why_were_like_this.png",
        3: "why-were-like-this.jpg"
    },
    "space-time-tuning-machine": {
        1: "05_space_time_tuning_machine.png",
        4: "sttm2.JPG",
        5: "sttm3.JPG",
        6: "sttm4.JPG",
        7: "sttm5.JPG",
        8: "sttm6.JPG",
        9: "sttm7.JPG",
        10: "sttm8.JPG",
        11: "sttm9.PNG",
        12: "sttm-resonance2.PNG"
    },
    "tebr": {
        1: "06_tebr.png",
        3: "tebr-ghost-figure-scan.png",
        4: "tebr-maqam-standing-wave.png",
        5: "tebr-diasporic-futurism-visual.png",
        6: "tebr-resonance-rings.png",
        7: "tebr-violin-bridge-icon.png",
        8: "tebr-violin-waveform.webp",
        9: "tebr-generated-v1.webp"
    },
    "chronocumulator": {
        1: "07_chronocumulator.png",
        3: "02_chronocumulator_sequencer_ui.png",
        4: "chronocumulator-feedback-loop.png",
        7: "chronocumulator-circular-vs-linear.png"
    },
    "the-weather-rehearsal": {
        1: "08_weather_rehearsal.png",
        3: "sunburn-weather-sonification.webp",
        4: "sunburn-weather-rehearsal-climate-synthesis.jpeg",
        5: "sunburn-wave-terrain.png",
        6: "sunburn-green-particle-wave.png",
        7: "sunburn.jpg"
    },
    "sometimes-i-wake-up-elsewhere": {
        1: "09_sometimes_i_wake_up_elsewhere.png",
        4: "siwue-manuscript-fragment.webp",
        6: "siwue-mobius-structure.png",
        7: "siwue-observed-reality-mobius.png",
        8: "sometimes-i-wake-up-elsewhere-generated-v1.webp",
        9: "siwue-algorithmic-displacement-audit.jpeg",
        10: "siwue-observed-reality-visualization.jpg",
        13: "siwue-hallway-cat.png",
        16: "siwue-still-room.png"
    },
    "derive": {
        1: "10_derive.png",
        3: "derive-boids-vector-flow-field.jpeg",
        4: "derive-entropy-reducing-structure-emerging.jpeg",
        5: "derive-field-flow-arrows.png",
        6: "derive-semantic-cluster-graph.png",
        7: "derive-maqam-navigation.png",
        8: "derive-memory-navigation-system.jpeg",
        9: "derive-memory-system.png",
        10: "derive-negentropic-machine-noise-order.jpeg",
        11: "derive-negentropic-sorted-blocks-grid.jpeg",
        12: "derive-botanical-particle.png",
        13: "derive-constellation-navigation.png"
    },
    "storylines": {
        1: "11_storylines.png",
        3: "storylines-graph-interface.jpeg",
        4: "storylines-knowledge-graph-network-dense.jpeg",
        5: "storylines-constellation-graph.png",
        6: "storylines-graph-visual.png",
        7: "storylines-sparrow-logo.png"
    },
    "hah-was": {
        1: "12_hah_was_localization_gap.png",
        3: "hah-was-hallucination-detection-ui.jpeg",
        4: "hah-was-server-stack-schematic.png",
        5: "hah-was-binary-channel-barcode-waveform.jpeg"
    },
    "localization-gap": {
        1: "12_hah_was_localization_gap.png",
        3: "localization-gap-maqam-spectrogram.webp",
        4: "localization-gap-427-tracks-archive-metadata.jpeg",
        5: "localization-gap-ai-track-rejection-log.jpeg",
        6: "localization-gap-batch-processing-yield-terminal.jpeg",
        7: "localization-gap-code-to-culture.png",
        8: "localization-gap-frequency-spectrum.png",
        9: "localization-gap-glitch-waveform.png",
        10: "localization-gap-research-diagram.png",
        11: "localization-gap-research-visualization.jpg",
        12: "localization-gap-soundwave-suno.png",
        13: "localization-gap-maqam-multi-spectrum.png",
        14: "localization-gap-maqam-vector-diagram.png",
        15: "localization-gap-generated-v1.webp"
    },
    "maqamai": {
        1: "13_maqamai.png",
        3: "maqamai-arabic-music-theory-synthesizer.jpeg",
        4: "maqamai-maqam-ai-interface.png",
        5: "maqamai-radial-tuning-sequences.png",
        6: "maqamai-sound-visualization.png"
    },
    "mekena-nyc": {
        1: "14_mekena_nyc.png",
        4: "mekena-modular-block-assembly.png",
        5: "mekena-nyc-adaptive-reuse-exterior.png",
        6: "mekena-nyc-building-schematic-queens.jpeg",
        7: "mekena-nyc-exterior-new.png",
        8: "mekena-nyc-garden-overview-enhanced-v1.webp",
        9: "mekena-nyc-queens-exterior.webp",
        10: "mekena-nyc-visual.png"
    },
    "codeverse-explorer": {
        1: "15_codeverse_explorer.png",
        3: "codeverse-explorer-3d-codebase.png",
        4: "codeverse-explorer-avatar-bounding-box.png",
        5: "codeverse-explorer-wireframe-city.png"
    }
}

def build_project_files(projects, metadata):
    for proj in projects:
        slug = proj["slug"]
        meta = metadata.get(slug, {})
        
        # Create folder
        proj_content_dir = os.path.join(workspace_dir, "content", "projects", slug)
        os.makedirs(proj_content_dir, exist_ok=True)
        
        # Create project.md
        md_path = os.path.join(proj_content_dir, "project.md")
        thesis = meta.get("thesis") or proj["argument"] or "A spatial systems inquiry."
        
        # Generate some highlights and related projects based on metadata
        highlights = [
            f"Cinematic Rail Type: {proj['rail_type'] or 'Project Dossier'}",
            f"Argument: {proj['argument'] or 'System architecture exploration.'}",
            f"Evidence / Rail Status: {meta.get('status') or 'Verified'}"
        ]
        
        related = []
        if slug == "systems-choreography":
            related = ["fictive-environments", "meaning-stack", "99-nodes"]
        elif slug == "fictive-environments":
            related = ["systems-choreography", "mekena-nyc", "sometimes-i-wake-up-elsewhere"]
        elif slug == "meaning-stack":
            related = ["systems-choreography", "hah-was", "derive"]
        elif slug == "99-nodes":
            related = ["storylines", "codeverse-explorer"]
        elif slug == "architecture-in-low-res":
            related = ["cartography-of-absence", "sometimes-i-wake-up-elsewhere"]
        elif slug == "cartography-of-absence":
            related = ["sometimes-i-wake-up-elsewhere", "why-were-like-this"]
        elif slug == "mashrou-leila":
            related = ["why-were-like-this", "space-time-tuning-machine", "tebr"]
        elif slug == "why-were-like-this":
            related = ["sometimes-i-wake-up-elsewhere", "cartography-of-absence", "derive"]
        elif slug == "space-time-tuning-machine":
            related = ["tebr", "chronocumulator", "the-weather-rehearsal"]
        elif slug == "tebr":
            related = ["space-time-tuning-machine", "chronocumulator", "localization-gap"]
        elif slug == "chronocumulator":
            related = ["space-time-tuning-machine", "tebr", "maqamai"]
        elif slug == "the-weather-rehearsal":
            related = ["space-time-tuning-machine", "tebr", "mekena-nyc"]
        elif slug == "sometimes-i-wake-up-elsewhere":
            related = ["cartography-of-absence", "derive", "storylines"]
        elif slug == "derive":
            related = ["sometimes-i-wake-up-elsewhere", "storylines", "meaning-stack"]
        elif slug == "storylines":
            related = ["sometimes-i-wake-up-elsewhere", "codeverse-explorer", "99-nodes"]
        elif slug == "hah-was":
            related = ["localization-gap", "maqamai", "meaning-stack"]
        elif slug == "localization-gap":
            related = ["hah-was", "tebr", "maqamai"]
        elif slug == "maqamai":
            related = ["hah-was", "localization-gap", "tebr"]
        elif slug == "mekena-nyc":
            related = ["fictive-environments", "mashrou-leila", "sometimes-i-wake-up-elsewhere"]
        elif slug == "codeverse-explorer":
            related = ["storylines", "meaning-stack", "99-nodes"]
            
        md_content = f"""# {proj['title']}
 
## Thesis
{thesis}
 
## Short Description
{thesis}
 
## Full Description
{proj['argument'] or thesis}
 
## Highlights
"""
        for hl in highlights:
            md_content += f"- {hl}\n"
            
        md_content += "\n## Related Projects\n"
        for rel in related:
            md_content += f"- {rel}\n"
            
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md_content)
            
        # Create gallery.csv
        csv_path = os.path.join(proj_content_dir, "gallery.csv")
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["order", "type", "file", "youtubeId", "chapter", "role", "title", "caption", "body", "emphasis"])
            
            for idx, card in enumerate(proj["cards"]):
                order = idx + 1
                
                card_type = "text"
                filename = ""
                if slug in rail_card_images and order in rail_card_images[slug]:
                    card_type = "image"
                    filename = rail_card_images[slug][order]
                
                chapter = card["chapter"]
                role = get_role_mapping(card["role"])
                title = card["title"]
                caption = card["caption"]
                body = card["proof_claim"]
                
                emphasis = "primary" if order == 1 else ("quiet" if order == len(proj["cards"]) else "secondary")
                
                writer.writerow([order, card_type, filename, "", chapter, role, title, caption, body, emphasis])
                
        print(f"Generated project {slug} at {proj_content_dir}")
 
def copy_images():
    # Construct cache of source files
    gdrive_dir = "/Users/vhnmns/Library/CloudStorage/GoogleDrive-haig.papazian@gmail.com/My Drive/FICTIVE_ENVIRONMENTS_PARENT_DIR (FMNTECH LLC)"
    downloads_dir = "/Users/vhnmns/Downloads"
    local_assets_dir = os.path.join(workspace_dir, "content", "papazian_archive_15_project_assets")
    local_atlas_dir = os.path.join(workspace_dir, "public", "images", "atlas")
    
    search_paths = [
        downloads_dir,
        local_assets_dir,
        local_atlas_dir
    ]
    if os.path.exists(gdrive_dir):
        # Only walk the specific GDrive subfolders of interest to prevent hanging on cloud walk
        gdrive_subs = [
            os.path.join(gdrive_dir, "00_ACTIVE_DRAFTS", "papazian_archive_15_project_assets"),
            os.path.join(gdrive_dir, "05_ASSETS_LIBRARY", "atlas-photos", "atlas"),
            os.path.join(gdrive_dir, "05_ASSETS_LIBRARY", "atlas-photos", "atlas", "generated"),
            os.path.join(gdrive_dir, "05_ASSETS_LIBRARY", "atlas-photos", "new-images"),
            os.path.join(gdrive_dir, "10_ACTIVE_PROJECTS", "18_Project_WhyWereLikeThis"),
            os.path.join(gdrive_dir, "10_ACTIVE_PROJECTS", "24_Project_MekenaNYC"),
            os.path.join(gdrive_dir, "10_ACTIVE_PROJECTS", "26_Project_SometimesIWakeUpElsewhere"),
            os.path.join(gdrive_dir, "10_ACTIVE_PROJECTS", "27_Project_TEBR"),
            os.path.join(gdrive_dir, "10_ACTIVE_PROJECTS", "28_Project_MeaningStack"),
            os.path.join(gdrive_dir, "10_ACTIVE_PROJECTS", "29_Project_DERIVE"),
            os.path.join(gdrive_dir, "10_ACTIVE_PROJECTS", "32_Project_SUNBURN"),
            os.path.join(gdrive_dir, "10_ACTIVE_PROJECTS", "34_Project_STTM")
        ]
        for sub in gdrive_subs:
            if os.path.exists(sub):
                search_paths.append(sub)
        
    file_cache = {}
    for path in search_paths:
        if not os.path.exists(path):
            continue
        for root, _, files in os.walk(path):
            for f in files:
                f_lower = f.lower()
                if f_lower not in file_cache:
                    file_cache[f_lower] = []
                file_cache[f_lower].append(os.path.join(root, f))
                
    # Now look up and copy each mapped file
    for slug, cards in rail_card_images.items():
        dest_dir = os.path.join(workspace_dir, "public", "images", "projects", slug)
        os.makedirs(dest_dir, exist_ok=True)
        
        for order, filename in cards.items():
            fn_lower = filename.lower()
            src_path = None
            if fn_lower in file_cache:
                src_path = file_cache[fn_lower][0]
            else:
                # Try fuzzy matching
                for cache_name in file_cache:
                    if cache_name.endswith(fn_lower) or fn_lower.endswith(cache_name):
                        src_path = file_cache[cache_name][0]
                        break
            
            if src_path:
                dest_path = os.path.join(dest_dir, filename)
                shutil.copy2(src_path, dest_path)
                print(f"Copied {filename} -> public/images/projects/{slug}/")
            else:
                print(f"WARNING: Could not find image file for {slug} card {order}: {filename}")


def update_global_csvs(projects):
    # Update content/projects.csv
    # Fields: slug,title,year,tier,domains,stack,connections,status,showInWorks,hasProjectPage,evidenceStatus
    projects_csv_path = os.path.join(workspace_dir, "content", "projects.csv")
    
    # Read existing projects
    existing_rows = []
    if os.path.exists(projects_csv_path):
        with open(projects_csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            existing_rows = list(reader)
            
    existing_by_slug = {row["slug"]: row for row in existing_rows}
    
    # Let's map new fields for OS layer frameworks and localization-gap
    default_meta = {
        "systems-choreography": {
            "year": "2024–26", "tier": "lead", "domains": "code|systems",
            "stack": "Code · Space · Choreography", "connections": "fictive-environments|mekena-nyc|tebr",
            "status": "public", "showInWorks": "true", "hasProjectPage": "true", "evidenceStatus": "Verified Rail"
        },
        "fictive-environments": {
            "year": "2025–26", "tier": "lead", "domains": "space|code|text",
            "stack": "Studio OS · Architecture", "connections": "mekena-nyc|lede-nyc|sometimes-i-wake-up-elsewhere",
            "status": "public", "showInWorks": "true", "hasProjectPage": "true", "evidenceStatus": "Verified Rail"
        },
        "meaning-stack": {
            "year": "2025", "tier": "lead", "domains": "code|systems",
            "stack": "Technical Architecture · Federated", "connections": "systems-choreography|hah-was|derive",
            "status": "public", "showInWorks": "true", "hasProjectPage": "true", "evidenceStatus": "Verified Rail"
        },
        "99-nodes": {
            "year": "2025", "tier": "lead", "domains": "code|text",
            "stack": "Meta-Archive · Graph", "connections": "storylines|codeverse-explorer",
            "status": "public", "showInWorks": "true", "hasProjectPage": "true", "evidenceStatus": "Verified Rail"
        },
        "localization-gap": {
            "year": "2024", "tier": "lead", "domains": "code|sound|systems",
            "stack": "AI Auditing · Spectrograms", "connections": "hah-was|tebr",
            "status": "public", "showInWorks": "true", "hasProjectPage": "true", "evidenceStatus": "Audit Complete"
        }
    }
    
    new_rows = []
    for proj in projects:
        slug = proj["slug"]
        if slug in existing_by_slug:
            # Update showInWorks and hasProjectPage to true for our Works Spine
            row = existing_by_slug[slug]
            row["showInWorks"] = "true"
            row["hasProjectPage"] = "true"
            # Title capitalization cleanup
            if slug == "the-weather-rehearsal":
                row["title"] = "The Weather Rehearsal"
            new_rows.append(row)
        else:
            # Create new row
            defaults = default_meta.get(slug, {
                "year": "2026", "tier": "lead", "domains": "systems",
                "stack": "Systems", "connections": "", "status": "public",
                "showInWorks": "true", "hasProjectPage": "true", "evidenceStatus": "Draft"
            })
            new_rows.append({
                "slug": slug,
                "title": proj["title"],
                "year": defaults["year"],
                "tier": defaults["tier"],
                "domains": defaults["domains"],
                "stack": defaults["stack"],
                "connections": defaults["connections"],
                "status": defaults["status"],
                "showInWorks": defaults["showInWorks"],
                "hasProjectPage": defaults["hasProjectPage"],
                "evidenceStatus": defaults["evidenceStatus"]
            })
            
    # Include non-works existing projects so they aren't lost
    spine_slugs = {proj["slug"] for proj in projects}
    for row in existing_rows:
        if row["slug"] not in spine_slugs:
            row["showInWorks"] = "false"  # Demoted from works
            new_rows.append(row)
            
    # Write back content/projects.csv
    with open(projects_csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["slug","title","year","tier","domains","stack","connections","status","showInWorks","hasProjectPage","evidenceStatus"])
        writer.writeheader()
        writer.writerows(new_rows)
        
    print(f"Updated {projects_csv_path}")
    
    # Update content/featured-projects.csv
    featured_csv_path = os.path.join(workspace_dir, "content", "featured-projects.csv")
    with open(featured_csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["order", "slug"])
        for idx, proj in enumerate(projects):
            writer.writerow([idx + 1, proj["slug"]])
            
    print(f"Updated {featured_csv_path}")

def update_spine_curation_json(projects):
    # Update content/spine-curation.json to list all 20 featured items
    spine_json_path = os.path.join(workspace_dir, "content", "spine-curation.json")
    
    era_mapping = {
        "systems-choreography": "00-frameworks",
        "fictive-environments": "00-frameworks",
        "meaning-stack": "00-frameworks",
        "99-nodes": "00-frameworks",
        "architecture-in-low-res": "01-foundation",
        "cartography-of-absence": "01-foundation",
        "mashrou-leila": "02-public-culture",
        "why-were-like-this": "02-public-culture",
        "space-time-tuning-machine": "03-exile-machines",
        "tebr": "03-exile-machines",
        "chronocumulator": "03-exile-machines",
        "the-weather-rehearsal": "03-exile-machines",
        "sometimes-i-wake-up-elsewhere": "04-memory-interfaces",
        "derive": "04-memory-interfaces",
        "storylines": "04-memory-interfaces",
        "hah-was": "05-sonic-intelligence",
        "localization-gap": "05-sonic-intelligence",
        "maqamai": "05-sonic-intelligence",
        "mekena-nyc": "06-spatial-futures",
        "codeverse-explorer": "06-spatial-futures"
    }
    
    world_mapping = {
        "systems-choreography": "frameworks",
        "fictive-environments": "frameworks",
        "meaning-stack": "frameworks",
        "99-nodes": "frameworks",
        "architecture-in-low-res": "memory-architectures",
        "cartography-of-absence": "memory-architectures",
        "mashrou-leila": "cultural-systems",
        "why-were-like-this": "cultural-systems",
        "space-time-tuning-machine": "performance-machines",
        "tebr": "sonic-intelligence",
        "chronocumulator": "sonic-intelligence",
        "the-weather-rehearsal": "performance-machines",
        "sometimes-i-wake-up-elsewhere": "memory-architectures",
        "derive": "memory-interfaces",
        "storylines": "spatial-systems",
        "hah-was": "sonic-intelligence",
        "localization-gap": "sonic-intelligence",
        "maqamai": "sonic-intelligence",
        "mekena-nyc": "spatial-systems",
        "codeverse-explorer": "spatial-systems"
    }

    curation_items = []
    for idx, proj in enumerate(projects):
        slug = proj["slug"]
        c1_img = rail_card_images.get(slug, {}).get(1)
        img_src = f"/images/projects/{slug}/{c1_img}" if c1_img else ""
        
        curation_items.append({
            "slug": slug,
            "title": proj["title"],
            "order": idx + 1,
            "era": era_mapping.get(slug, "01-foundation"),
            "sourceStatus": "authored-folder",
            "spineWorld": world_mapping.get(slug, "cultural-systems"),
            "spineRole": "flagship" if "flagship" in proj.get("rail_type", "").lower() else "secondary-system",
            "spineHero": img_src,
            "spineCaption": proj["argument"],
            "evidenceStatus": "ready",
            "routeSafe": True,
            "notes": "Updated via FINAL CINEMATIC RAIL BIBLE script."
        })
        
    with open(spine_json_path, "w", encoding="utf-8") as f:
        json.dump(curation_items, f, indent=2)
        
    print(f"Updated {spine_json_path}")

def main():
    print("Starting parser script...")
    projects = parse_rail_bible()
    print(f"Parsed {len(projects)} projects from rail bible.")
    
    metadata = parse_matrix_metadata()
    print(f"Parsed metadata for {len(metadata)} projects from copy matrix.")
    
    print("Copying image assets...")
    copy_images()
    
    print("Building project md and csv files...")
    build_project_files(projects, metadata)
    
    print("Updating projects.csv and featured-projects.csv...")
    update_global_csvs(projects)
    
    print("Updating spine-curation.json...")
    update_spine_curation_json(projects)
    
    print("All tasks completed successfully in parser!")

if __name__ == "__main__":
    main()
