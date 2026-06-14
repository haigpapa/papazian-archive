# MaqamAI
## Arabic Maqam Ear Training System

**Tier:** Concept in Latency (Activation Recommended)  
**Type:** Browser-Based Educational Application  
**Status:** Concept / Pre-Development  
**Stack:** Tone.js · Web Audio API · React · Curated recordings  
**Target:** maqamai.walawstudio.com  

---

## The Gap

The Arabic maqam system contains approximately 72 distinct modes. Western music theory, as codified in the 12-Tone Equal Temperament (12-TET) grid, offers 12. Every generative AI music platform currently in commercial operation runs on 12-TET.

The 60 modes that fall between Western semitones — the ones that make Arabic music sound like Arabic music — are architecturally invisible to the models.

This is not a feature gap. It is a structural encoding of a cultural hierarchy into the foundations of the most significant new music technology in a generation. And it is entirely remediable — but only if the people building these systems can hear what's missing.

Most of them cannot. Not because they lack interest, but because Western ear training doesn't equip you to hear quarter-tones as anything other than out-of-tune.

> *You cannot engineer what you cannot hear. Before a model can learn maqam, a human has to learn to judge it.*

**MaqamAI is a tool for building that ear.**

---

## Product Concept

MaqamAI is a browser-based interactive ear training application for Arabic maqam, designed for two overlapping audiences:

1. **Musicians and composers** with no formal Arabic music training
2. **AI engineers** working on generative audio who need to develop cultural listening competency to evaluate model outputs accurately

---

## Three Learning Modes

### 1. Interval Recognition
Progressive ear training in the specific interval structures of individual maqamat — beginning with the most common (Rast, Bayati, Hijaz) and expanding to the full system. The AI compares user responses to expected interval recognition thresholds and adapts the difficulty curve.

Unlike Western interval training, which treats the semitone as the base unit, MaqamAI trains the ear to the quarter-tone as a primary value — not an approximation error.

### 2. Generative Comparison
Side-by-side listening sessions comparing:
- A recording of a given maqam performed by a human musician
- A generative AI output prompted to produce the same maqam

The learner identifies discrepancies. This is simultaneously ear training and adversarial quality assessment — the exact cognitive operation that HAH-WAS requires human reviewers to perform. MaqamAI builds the perceptual capacity that makes HAH-WAS usable at scale.

### 3. Modulation Practice
Interactive exercises in the modulation logic between maqamat — one of the most culturally specific and algorithmically invisible aspects of the tradition. Modulation in Arabic music does not follow the predictable logic of Western functional harmony; it follows conventions of emotional gravity and regional practice that are not reducible to rules.

---

## Technical Architecture

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Audio Engine** | Tone.js + WebAudio API | Custom microtonal synthesis capable of rendering quarter-tone intervals accurately in browser. Existing Tone.js 12-TET defaults must be overridden with custom scale definitions for each maqam. |
| **Reference Library** | Curated recordings (licensed) + MIDI notation | 72 maqamat, each with canonical reference recording and MIDI approximation. The MIDI approximation explicitly documents where it fails — pedagogically modeling the limits of Western notation. |
| **AI Comparison Module** | Suno/Udio API calls + HAH-WAS evaluation layer | Live generation at session time for Generative Comparison mode. HAH-WAS failure taxonomy applied to auto-classify model errors before presenting to learner. |
| **Progress System** | Local-first storage (no account required) | Stores interval recognition accuracy scores locally, generating a personal "maqam fluency map." |
| **Interface Language** | English, Arabic (RTL), French | Typography system supports Latin, Arabic, and Armenian script with correct bidirectionality. |

---

## Why Now

The AI music industry is entering its global expansion phase. The next phase of competition will not be won on Western market share — that territory is contested and crowded. It will be won on the Global South: MENA, South Asia, West Africa, Southeast Asia.

Every AI music company currently deploying products in these markets is asking the same question: why does our product feel wrong to users here? The answer is the localization gap. MaqamAI addresses one of the most tractable, most visible, and most symbolically significant instances of this gap — not at the model level, but at the human level.

Before Arabic music can be modeled, it has to be heard.

---

## Why This Activates, Not Duplicates

MaqamAI is the missing infrastructure link between two existing systems:

- **HAH-WAS needs human reviewers who can hear the failures it detects.** MaqamAI scales that expertise.
- **The Resonance Atlas research needs a public-facing demonstration.** MaqamAI converts its core insight into an interactive experience that makes the problem viscerally audible rather than abstractly arguable.

The activation recommendation is high because this project requires the least new infrastructure to ship. The Tone.js audio engine is already in the technical stack. The adversarial prompting methodology is already operational in HAH-WAS. The cultural knowledge is already documented.

> *The first AI music company to commission a cultural fidelity audit will need exactly this tool. Build it before they ask.*

---

## Build Estimate

- **Phase 1 scope:** Rast, Bayati, Hijaz — the three highest-frequency maqamat
- **Build estimate:** 6–8 weeks for functional prototype
- **Deploy target:** maqamai.walawstudio.com
