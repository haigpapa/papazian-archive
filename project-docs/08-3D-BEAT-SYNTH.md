# 3D-Beat-Synth
## Somatic Input Spatial Audio UI

**Tier:** Secondary Project  
**Type:** Gesture-to-Sound Reactive Instrument  
**Status:** Deployed  
**Stack:** Three.js · MediaPipe · Tone.js · WebRTC · React  
**Access:** Browser-based, no installation required  

---

## The Premise

The body knows things the keyboard doesn't. When you wave your hand to conduct an orchestra, you are not pressing buttons in sequence — you are shaping a continuous flow of energy through space.

3D-Beat-Synth is built on this premise: that gesture is a richer musical input than any interface requiring discrete button presses, and that the correct tool for capturing gesture in a browser is already built into every laptop that ships with a camera.

3D-Beat-Synth uses MediaPipe's hand-tracking model to capture the position, velocity, and orientation of the performer's hands in real time via webcam. These signals are mapped to synthesis parameters in a 3D audio environment rendered by Three.js and Tone.js. Moving your hand through space sculpts sound — not metaphorically, but mechanically.

---

## Gesture Mapping

| Gesture Dimension | Sonic Parameter | Range |
|------------------|-----------------|-------|
| **Hand Height (Y)** | Pitch register / octave selection | Floor = bass register; ceiling = high register; continuous across full range |
| **Hand Separation (X)** | Chord voicing / harmonic spread | Hands together = unison; hands apart = wide voicing; maximum separation = octave spread |
| **Lateral Velocity** | Rhythmic density / tempo feel | Slow sweep = sparse, rubato; fast sweep = dense, driving |
| **Depth (Z)** | Reverb / spatial depth | Hands close to camera = dry, immediate; hands far = deep reverb, spatial distance |
| **Finger Spread** | Timbre / harmonic content | Closed fist = pure sine; spread fingers = rich overtone series |
| **Rotation** | Filter sweep / EQ shape | Palm up = bright, open filter; palm down = dark, closed filter |

---

## The Embodiment Argument

The dominant paradigm for creative software is the screen-bound interface: click, drag, type. This paradigm has produced extraordinary results for tasks where precision is the primary value. It is inadequate for tasks where the primary value is expression — where the continuous, multidimensional quality of human movement is the input, not a quantized click position.

3D-Beat-Synth is a prototype for an alternative paradigm: **the body as interface.** Not VR — no headset, no controllers, no proprietary hardware. Just a webcam and a browser.

The point is not immersion; it is continuity. The gesture is continuous; the sound is continuous; the relationship between them is direct and immediate. This is closer to playing an instrument than operating software.

> *The mouse is a nineteenth-century metaphor — a pen pushing a cursor. 3D-Beat-Synth is a twenty-first-century instrument. The interface is your body. The display is optional.*

---

## Connection to STTM

3D-Beat-Synth is the browser-deployable version of STTM's gesture-control layer. Where STTM uses custom hardware and Max/MSP, 3D-Beat-Synth uses a webcam and WebRTC. They solve the same problem — how do you put a human body in direct contact with a sound synthesis system? — at different points on the hardware/software spectrum.

---

## Hybrid Concept: Sonic Constellation

Combining 3D-Beat-Synth with STORYLINES creates a navigation system for music influence networks: navigate music constellations through 3D gestures. Hovering over artist nodes plays audio snippets; Z-axis represents chronological era. Gesture becomes the mechanism for exploring intellectual proximity.

---

## Strategic Value

3D-Beat-Synth is deployed, requires no installation, runs in any modern browser, and produces a visible reaction within 5 seconds of opening.

For portfolio review contexts — a hiring manager opening a link, a conference attendee scanning a QR code — this is the most immediately compelling live demonstration in the entire portfolio. It shows:

- **Technical fluency:** Three.js, MediaPipe, Tone.js, real-time gesture processing
- **Conceptual clarity:** Embodiment over abstraction
- **Aesthetic judgment:** The 3D environment is designed to make the gesture mapping legible, not just functional

All in a single browser session.

---

## Documentation Gap

- 30-second screen-capture GIF needed for GitHub README
- **Best live demo asset in the portfolio**
