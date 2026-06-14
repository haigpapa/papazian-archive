# Sometimes I Wake Up Elsewhere
## Möbius-Twist Hypertext Fiction Engine

**Tier:** Lead Project  
**Type:** Autonomous Narrative System / Interactive Fiction  
**Status:** Active Development  
**Stack:** React 19 · TypeScript · Three.js · Web Audio API · Canvas API · IndexedDB  
**Short form:** SIWUE  

---

## The Architecture

Every navigation system assumes you know where you are. SIWUE begins from the opposite premise: you are in Dream 1, you do not know where you are, and the system will not tell you.

What it will do is let you move — through temporal debt, decaying documents, bilingual reveals, and a surveillance apparatus run by birds — until you reach Dream 100, where you pick up a piece of paper and wake. Into Dream 1.

This is not a narrative with a loop structure. It is a narrative that *is* a loop — a Möbius strip where the surface you think you escaped is the same surface you return to on the other side. The displacement has no ending because the form embodies that claim structurally.

> *"Dream 47: I am interviewed about events I don't recall. The interview will determine whether my existence becomes a sanctioned narrative. I answer in three languages. Only one is accepted."*

---

## Core Mechanics

| Mechanic | Description | Thematic Function |
|----------|-------------|------------------|
| **Temporal Debt** | Each choice costs time. Revisiting nodes accumulates debt that eventually expires access to certain paths. The reader cannot read everything. | Mirrors the diasporic experience of time as a resource that runs out — visas expire, windows close, the chance to go back closes. |
| **Document Decay** | Text degrades on repeated visits. Words become illegible, sentences fragment, images corrupt. The narrative literally deteriorates under the reader's attention. | Memory does not improve with revisitation. It degrades. The act of trying to remember destroys what you're trying to retrieve. |
| **Bilingual Reveals** | Certain passages exist in English until a threshold is crossed, then surface in Arabic or Armenian — untranslated, without glossary. | Language is not neutral. Some things can only be said in the language they happened in. The reader's fluency determines what they access. |
| **SparrowOS** | A background surveillance layer — an avian monitoring system that tracks movement through the narrative and generates periodic reports. The birds are not metaphors; they are a technical layer. | The displaced person is always being watched, always being processed. The indifference of the surveillance system — it doesn't hate you, it just logs you — is more frightening than hostility. |
| **Möbius Exit** | Dream 100 returns to Dream 1. The system has no resolution state. The only true exit is closing the browser. | Displacement doesn't resolve. The chord never lands. The formal refusal of closure is the content. |

---

## The Decay System

The decay rendering is the most technically demanding component: each text node must track its visit history and degrade consistently across sessions — the same words must be missing every time, not randomly regenerated.

The system maintains a corruption map per node that persists between visits (via IndexedDB), so the reader's return to a degraded passage finds exactly what they left. The degradation is deterministic, not random — it is the specific erosion of this specific reader's specific engagement with this specific memory.

---

## Technical Stack

- **React 19 / TypeScript** — application framework
- **Three.js** — spatial navigation layer
- **Web Audio API** — ambient sound layer responding to narrative state
- **Canvas API** — document decay rendering
- **Tailwind CSS** — visual system
- **IndexedDB** — persistent debt and corruption tracking across sessions

---

## Relationship to the Literary System

SIWUE, the Cartography of Absence, and DERIVE form a triad, each approaching the same material through a different formal logic:

- **The Cartography of Absence** uses bureaucratic administrative forms to contain experience that forms cannot hold
- **DERIVE** uses vector embedding and generative AI to model associative diasporic memory
- **SIWUE** uses hypertext topology — the branching, decaying, looping structure of a navigable text — to make the reader inhabit the experience of displaced time rather than read about it

The distinction matters: DERIVE generates artifacts from a personal archive; SIWUE generates a navigation experience for a reader who is not the author. The DERIVE user is the archivist moving through their own material. The SIWUE reader is a stranger in someone else's dream sequence, subject to the same loss of orientation, the same expired access, the same surveillance. The empathy is structural, not rhetorical.

---

## Precedent Context

SIWUE sits at the intersection of:
- Literary hypertext (Michael Joyce's *afternoon, a story*; Deena Larsen's *Marble Springs*)
- Political game design (Her Story's fragmented testimony structure; 80 Days' branching colonial geography)
- AI-augmented narrative (MIT Media Lab interactive cinema)

None of these precedents address displacement as their structural subject. SIWUE does.

---

## The Recursive Exit

```
dream 100: recursive exit
I wake in a room I don't know.
A window opens onto Dream 16.
The fridge hums the melody from Dream 3.
...
On the floor: a page.
dream 1: the map says I live in an ocean
I pick it up.
And wake.
```

---

## Target Venues

Electronic Literature Organization · A-MAZE Berlin · IndieCade · Tribeca Games

---

## Documentation Gaps

- Playable demo needed
- 90-second walkthrough video needed
- 10-phase build plan active; core engine in progress
