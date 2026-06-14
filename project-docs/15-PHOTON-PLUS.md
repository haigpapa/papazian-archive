# photon+
## Optical Simulation Music Engine

**Tier:** Secondary Project  
**Type:** Browser-Based Physics Sequencer  
**Status:** Prototype / Pre-Deployment  
**Stack:** WebGL · Canvas 2D · Web Audio API · Tone.js · Custom physics engine · React  
**Target:** photon.walawstudio.com  

---

## The Question

Most sequencers ask: when should this sound play?

photon+ asks a different question: **where is the light?**

---

## The System

photon+ is a browser-based music sequencer built on optical physics simulation. Photons — particles of light — are emitted into a geometric environment populated by reflective surfaces, prisms, and absorbers.

When a photon strikes a surface, it triggers a sound event. The pitch, timbre, and duration of that event are determined by the angle of incidence, the material properties of the surface, and the photon's accumulated energy across its path.

**Music emerges as a consequence of geometry, not schedule.**

The composer's role is to design the environment — to build the room that generates the music — not to write the music directly.

---

## Physics as Composition

| Physical Parameter | Sonic Mapping | Rationale |
|-------------------|--------------|-----------|
| **Angle of Incidence** | Pitch | Shallow angles produce lower register events; steep angles produce higher ones. The relationship is continuous, not quantized to 12-TET — photon+ generates microtonal pitch naturally, as a consequence of physics. |
| **Surface Material** | Timbre | Reflective surfaces → clean, bell-like tones. Diffuse surfaces → broad, noisy textures. Absorptive surfaces → short, percussive events. |
| **Photon Energy** | Amplitude and duration | A photon that has traveled far and reflected many times carries accumulated energy that produces louder, longer events. A fresh photon is quieter. |
| **Recursive Reflection** | Loop structures | When photons are trapped in reflective cavities — two parallel mirrors, a triangular prism — they produce repeating patterns that function as rhythmic loops. The loop rate is determined by cavity geometry. |
| **Prism Refraction** | Chord generation | A prism splits a photon into spectral components, each triggering a separate sound event at a different pitch. Harmony as light physics. |

---

## Why This Is Not a Gimmick

The standard critique of physics-as-music projects is that the physics metaphor is decorative — the actual music could have been composed more efficiently without the simulation layer.

photon+ rejects this. The simulation is not a metaphor for the music; **it is the composition system.** The music that emerges from a given geometric configuration cannot be composed directly — it is discovered, not written.

The composer's expertise moves from note selection and rhythm programming to environment design and material selection. Architectural thinking applied to musical composition: you don't design the sound, you design the space the sound will inhabit. The rest is physics.

---

## The MaqamAI Connection

photon+'s continuous microtonal pitch generation — a natural consequence of physics simulation — makes it the only sequencer in the current toolset capable of producing Arabic microtonal intervals without manually overriding a 12-TET grid.

The angle-of-incidence to pitch mapping produces a continuous pitch spectrum. Quarter-tones are not special cases requiring override; they are the default output of shallow-angle reflections.

**Combining photon+ with the maqam parameter library is the Maqam Tuning Lab** — the hybrid project concept that connects the physics engine to the cultural research program.

---

## Technical Stack

- **WebGL / Canvas 2D** — photon particle rendering
- **Web Audio API** — event synthesis
- **Tone.js** — audio routing and parameter control
- **Custom physics engine** — reflection / refraction / energy propagation
- **React** — UI layer and environment editor

---

## Status

- Prototype complete; not yet deployed
- **Next step:** Deploy beta at photon.walawstudio.com with user feedback collection
- **Hybrid target:** photon+ + HAH-WAS = Maqam Tuning Lab
