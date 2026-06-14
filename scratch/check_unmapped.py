import os
import re

bible_path = "/Users/vhnmns/Downloads/FINAL CINEMATIC RAIL BIBLE.txt"
with open(bible_path, "r", encoding="utf-8") as f:
    content = f.read()

# Re-parse projects
pattern = r"(?:(?:0\.[1-4])|(?:\d+))\b\.?\s+[A-Z0-9\s’'\u2019\u2018\u2013\-]+\r?\n"
matches = list(re.finditer(pattern, content))

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
    return re.sub(r"[^a-zA-Z0-9]", "", name).lower()

rail_card_images = {
    "systems-choreography": {1: "systems-choreography-diagram.webp", 3: "systems-choreography-01.png", 4: "systems-choreography-flow-diagram.png", 5: "systems-choreography-triangle-diagram.png", 6: "systems-choreography-core-diagram.png", 7: "systems-choreography-governing-emergence.png", 8: "systems-choreography-orbital-diagram.png"},
    "fictive-environments": {1: "fictive-environments-studio-identity.webp", 3: "fictive-environments-generated-v1.webp", 5: "fictive-geographies.JPG"},
    "meaning-stack": {1: "meaning-stack-github-constellation.webp", 3: "meaning-stack-diagram-01.png", 4: "meaning-stack-diagram-02.png", 5: "meaning-stack-network-nodes.png", 8: "meaning-stack-processing-cultural-friction.png", 9: "meaning_stack.png"},
    "99-nodes": {1: "99-nodes-project-grid-overview-all.webp", 3: "99-nodes-constellation-globe.png", 5: "99-nodes-maximalist-website-concept.png"},
    "architecture-in-low-res": {1: "01_architecture_in_low_res.png", 3: "architecture-low-res-acetate-layers.png", 4: "architecture-low-res-city-grid.png", 5: "architecture-low-res-wireframe-object.png", 6: "architecture-low-res-thesis-render.jpg", 7: "architecture-low-res-thesis-visualization.jpg"},
    "cartography-of-absence": {1: "02_cartography_of_absence.png", 4: "cartography-absence-document-schematic.png", 5: "cartography-of-absence-manuscript-swirl.png", 6: "cartography-of-absence-title-card.png", 7: "cartography-of-absence-bureaucratic-form.webp", 8: "cartography-of-absence-data-void-absence-index.jpeg", 9: "cartography-of-absence-data-void-trace.jpeg"},
    "mashrou-leila": {1: "03_mashrou_leila.png", 3: "mashrou-leila-baalbeck-roman-ruins.jpg", 4: "mashrou-leila-self-titled-ep-cover.jpeg", 5: "npr-tiny-desk-mashrou-leila.jpg", 6: "lebanon-mashrou-leila-band.jpg", 7: "mashrou-leila-debut-ep-cover.jpeg", 8: "mashrou-leila-demo-visual.jpg", 9: "mashrou-leila-exit.jpg", 10: "mashrou-leila-system-diagram.png", 11: "mashrouleila-beirut-dreams-in-color.jpg", 12: "mashrouleila-greenpeace-bahr-360video.jpg", 13: "mashrouleila-logo-ibnelleil.webp", 14: "mashrouleila-logo2.webp", 15: "mashrouleila-logo3.png"},
    "why-were-like-this": {1: "04_why_were_like_this.png", 3: "why-were-like-this.jpg"},
    "space-time-tuning-machine": {1: "05_space_time_tuning_machine.png", 4: "sttm2.JPG", 5: "sttm3.JPG", 6: "sttm4.JPG", 7: "sttm5.JPG", 8: "sttm6.JPG", 9: "sttm7.JPG", 10: "sttm8.JPG", 11: "sttm9.PNG", 12: "sttm-resonance2.PNG"},
    "tebr": {1: "06_tebr.png", 3: "tebr-ghost-figure-scan.png", 4: "tebr-maqam-standing-wave.png", 5: "tebr-diasporic-futurism-visual.png", 6: "tebr-resonance-rings.png", 7: "tebr-violin-bridge-icon.png", 8: "tebr-violin-waveform.webp", 9: "tebr-generated-v1.webp"},
    "chronocumulator": {1: "07_chronocumulator.png", 3: "02_chronocumulator_sequencer_ui.png"},
    "the-weather-rehearsal": {1: "08_weather_rehearsal.png", 3: "sunburn-weather-sonification.webp", 4: "sunburn-weather-rehearsal-climate-synthesis.jpeg", 5: "sunburn-wave-terrain.png", 6: "sunburn-green-particle-wave.png", 7: "sunburn.jpg"},
    "sometimes-i-wake-up-elsewhere": {1: "09_sometimes_i_wake_up_elsewhere.png", 4: "siwue-manuscript-fragment.webp", 6: "siwue-mobius-structure.png", 7: "siwue-observed-reality-mobius.png", 8: "sometimes-i-wake-up-elsewhere-generated-v1.webp", 9: "siwue-algorithmic-displacement-audit.jpeg", 10: "siwue-observed-reality-visualization.jpg"},
    "derive": {1: "10_derive.png", 3: "derive-boids-vector-flow-field.jpeg", 4: "derive-entropy-reducing-structure-emerging.jpeg", 5: "derive-field-flow-arrows.png", 6: "derive-semantic-cluster-graph.png", 7: "derive-maqam-navigation.png", 8: "derive-memory-navigation-system.jpeg", 9: "derive-memory-system.png", 10: "derive-negentropic-machine-noise-order.jpeg", 11: "derive-negentropic-sorted-blocks-grid.jpeg", 12: "derive-botanical-particle.png", 13: "derive-constellation-navigation.png"},
    "storylines": {1: "11_storylines.png", 3: "storylines-graph-interface.jpeg", 4: "storylines-knowledge-graph-network-dense.jpeg", 5: "storylines-constellation-graph.png", 6: "storylines-graph-visual.png", 7: "storylines-sparrow-logo.png"},
    "hah-was": {1: "12_hah_was_localization_gap.png", 3: "hah-was-hallucination-detection-ui.jpeg", 4: "hah-was-server-stack-schematic.png", 5: "hah-was-binary-channel-barcode-waveform.jpeg"},
    "localization-gap": {1: "12_hah_was_localization_gap.png", 3: "localization-gap-maqam-spectrogram.webp", 4: "localization-gap-427-tracks-archive-metadata.jpeg", 5: "localization-gap-ai-track-rejection-log.jpeg", 6: "localization-gap-batch-processing-yield-terminal.jpeg", 7: "localization-gap-code-to-culture.png", 8: "localization-gap-frequency-spectrum.png", 9: "localization-gap-glitch-waveform.png", 10: "localization-gap-research-diagram.png", 11: "localization-gap-research-visualization.jpg", 12: "localization-gap-soundwave-suno.png", 13: "localization-gap-maqam-multi-spectrum.png", 14: "localization-gap-maqam-vector-diagram.png", 15: "localization-gap-generated-v1.webp"},
    "maqamai": {1: "13_maqamai.png", 3: "maqamai-arabic-music-theory-synthesizer.jpeg", 4: "maqamai-maqam-ai-interface.png", 5: "maqamai-radial-tuning-sequences.png", 6: "maqamai-sound-visualization.png"},
    "mekena-nyc": {1: "14_mekena_nyc.png", 4: "mekena-modular-block-assembly.png", 5: "mekena-nyc-adaptive-reuse-exterior.png", 6: "mekena-nyc-building-schematic-queens.jpeg", 7: "mekena-nyc-exterior-new.png", 8: "mekena-nyc-garden-overview-enhanced-v1.webp", 9: "mekena-nyc-queens-exterior.webp", 10: "mekena-nyc-visual.png"},
    "codeverse-explorer": {1: "15_codeverse_explorer.png", 3: "codeverse-explorer-3d-codebase.png", 4: "codeverse-explorer-avatar-bounding-box.png", 5: "codeverse-explorer-wireframe-city.png"}
}

for i in range(len(matches)):
    start = matches[i].start()
    end = matches[i+1].start() if i < len(matches)-1 else len(content)
    section = content[start:end]
    lines = [line.strip() for line in section.split("\n") if line.strip()]
    if not lines:
        continue
    header = lines[0]
    header_match = re.match(r"^(0\.[1-4]|\d+\.?)\s+([A-Z0-9\s’'\u2019\u2018\u2013\-]+)$", header)
    if not header_match:
        continue
    proj_name = header_match.group(2).strip()
    norm = normalize_name(proj_name)
    slug = slug_mapping.get(norm)
    if not slug:
        continue
        
    card_start_idx = 1
    if len(lines) > 1 and ("rail" in lines[1].lower() or "dossier" in lines[1].lower()):
        card_start_idx = 2
    if len(lines) > card_start_idx and lines[card_start_idx] == "Argument":
        card_start_idx += 2
        
    j = card_start_idx
    while j < len(lines):
        line = lines[j]
        card_match = re.match(r"^([0-9]+)\s*[-—]\s*(.+)$", line)
        if card_match:
            card_num = int(card_match.group(1))
            details_line = lines[j+1] if j+1 < len(lines) else ""
            me_m = re.search(r"Media:\s*(.*?)\s*Caption:", details_line)
            media = me_m.group(1).strip() if me_m else ""
            
            mapped_images = rail_card_images.get(slug, {})
            if card_num not in mapped_images:
                is_text = any(k in media.lower() for k in ["text card", "white text", "cold typographic", "cold administrative", "high-contrast typography", "large type", "typography card"])
                if media and not is_text:
                    print(f"[{slug}] Card {card_num}: Media wants \"{media}\" but it is not mapped!")
            j += 2
        else:
            j += 1
