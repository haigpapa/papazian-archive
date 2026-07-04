# Detailed Technical Implementation Plan: Papazian Archive Grid View (Index Mode)

## Systems Choreography Web Architecture Blueprint

This document defines the comprehensive development blueprint to implement the **Visual Index Grid (Index Mode)**, the **Dynamic Crosshair Magnifier Cursor**, the **Symmetrical Centering Zoom**, and the **Artifact Inspector Side-Panel** into the Papazian Archive digital interface.

---

## 1\. Structural Architecture & Integration Constraints

The Grid View functions as a non-linear, high-density visual database (the "specimen board") of raw artifacts. It operates in parallel with the **Vertical Spine (Works Mode)**, the **Horizontal Project Rails (Cinematic Mode)**, and the **3D Relational Atlas (Map Mode)**.

### State Transition Matrix

The archive operates as a Finite State Machine (FSM) governed by the following interface modes:

| From Mode | To Mode | Trigger Action | Required UI State Transitions |
| :---- | :---- | :---- | :---- |
| **Index Mode (Grid)** | **Inspect Mode (Lightbox)** | Click on `artifact-card` | Calculate card coordinates; center asset; trigger Symmetrical Alignment; slide in inspector side-panel; dim remaining cards to 20% opacity. |
| **Inspect Mode (Lightbox)** | **Horizontal Project Rail** | Click `enterHorizontalRail()` | Fade out Index Grid; lock Vertical Spine; initialize target project; slide horizontal rail sequence to specified `rail_slide_id`; restore cursor state. |
| **Inspect Mode (Lightbox)** | **Relational Atlas (Map)** | Click `locateInRelationalAtlas()` | Fade out Index Grid; load Three.js Canvas; trigger camera fly-to animation target node matching `parent_project` id; populate atlas relationship ledger. |
| **Inspect Mode (Lightbox)** | **Index Mode (Grid)** | Click Close `[X]` / Backdrop | Collapse side-panel; reverse zoom scale calculation; restore grid opacity to 100%; restore standard coordinates tracking cursor. |

---

## 2\. Technical Data Schema & State Management

### Complete TypeScript Schema for Index Assets

Every item in the visual grid is represented as a structured data object within the local or database state.

export interface ArchivalAssetRecord {

  record\_id: string;         // Unique forensic index (e.g., 'TEBR\_IMG\_042')

  title: string;             // Display name of raw record

  parent\_project: string;     // Foreign key matching flagship project ID (e.g., 'TEBR')

  medium: string;            // Media classification (e.g., 'Image / Spectrum Analysis')

  evidence\_role: string;     // Analytical or conceptual purpose of the asset

  dimensions: string;        // Pixel dimensions (e.g., '1080x1080')

  historical\_date: string;   // ISO-8601 or partial date representation ('2024-09')

  file\_url: string;          // Direct link to high-resolution asset source

  thumbnail\_url: string;     // Light compressed thumbnail representation

  rail\_slide\_id: string;     // Direct entry slide ID in the project's horizontal rail

  atlas\_coordinates: {       // Coordinate mappings in the 3D map mode

    x: number;               // Geography axis value (0.0 to 1.0)

    y: number;               // Time axis value (normalized year)

    z: number;               // Impact hierarchy tier (1, 2, or 3\)

  };

  tags: string\[\];            // Systems Choreography ontology tags (e.g., \['Sound', 'AI'\])

  status: string;            // Status metadata (e.g., 'Archived / Untuned')

}

### React/State Architecture

The visualizer state manager (React Context, Zustand, or Redux) must keep track of the following variables:

interface IndexViewState {

  activePanel: 'orbit' | 'works' | 'index' | 'maps' | 'essays';

  layoutMode: 'visual' | 'hybrid' | 'text';

  activeFilter: string;            // Systems tags filter (e.g., 'ALL', 'SOUND', 'SPACE')

  activeSort: 'project' | 'year' | 'world';

  inspectingRecord: string | null;  // Active inspected record\_id

  cursorCoords: { x: number; y: number };

  isAnimating: boolean;            // Global transition block

}

---

## 3\. DOM, CSS, & WebGL Grayscale Filter Blueprint

The design DNA strictly enforces high-contrast, zero-bounce, forensic layouts. All typography must be monospaced and zero-padded.

### 3.1. Technical Grid Layout (HTML/CSS)

The main layout of the Index grid is structured in three structural display classes inside `.index-grid-container`.

\<\!-- DOM Structure for the Visual Index Panel \--\>

\<div id="index-panel" class="view-panel active-panel"\>

  \<\!-- Technical Gridlines Layer \--\>

  \<div class="grid-bg"\>\</div\>

  

  \<\!-- Index Filters & Controls Header \--\>

  \<div id="index-controls"\>

    \<div class="filter-group"\>

      \<button class="filter-chip active" onclick="setFilter('ALL')"\>ALL\</button\>

      \<button class="filter-chip" onclick="setFilter('SOUND')"\>SOUND\</button\>

      \<button class="filter-chip" onclick="setFilter('SPACE')"\>SPACE\</button\>

      \<button class="filter-chip" onclick="setFilter('CODE')"\>CODE\</button\>

      \<button class="filter-chip" onclick="setFilter('TEXT')"\>TEXT\</button\>

      \<button class="filter-chip" onclick="setFilter('IMAGE')"\>IMAGE\</button\>

    \</div\>

    \<div class="sort-view-group"\>

      \<span class="sort-view-label"\>SORT:\</span\>

      \<select id="sort-select" onchange="setSort(this.value)"\>

        \<option value="project"\>PROJECT\</option\>

        \<option value="year"\>YEAR\</option\>

        \<option value="world"\>WORLD\</option\>

      \</select\>

      \<span class="sort-view-label"\>VIEW:\</span\>

      \<button class="view-toggle active" onclick="setLayout('visual')"\>VISUAL\</button\>

      \<button class="view-toggle" onclick="setLayout('hybrid')"\>HYBRID\</button\>

      \<button class="view-toggle" onclick="setLayout('text')"\>TEXT\</button\>

    \</div\>

  \</div\>

  \<\!-- Dynamic Content Container \--\>

  \<div class="index-grid-container mode-visual" id="grid-content"\>

    \<\!-- Cards are dynamically injected here \--\>

  \</div\>

\</div\>

/\* Technical Layout Styles \*/

.index-grid-container {

  display: grid;

  width: 100%;

  height: calc(100vh \- 100px);

  overflow-y: scroll;

  padding: 24px;

  position: relative;

  z-index: 2;

  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);

}

/\* Mode 1: Dense Visual Mode \*/

.index-grid-container.mode-visual {

  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

  gap: 10px;

}

/\* Mode 2: Hybrid Mode (Visual Cards \+ Forensics Metadata) \*/

.index-grid-container.mode-hybrid {

  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));

  gap: 20px;

}

/\* Mode 3: Plain Text Mode (Spreadsheet Rows) \*/

.index-grid-container.mode-text {

  display: flex;

  flex-direction: column;

  gap: 0;

  border-top: 1px solid var(--border-color);

}

/\* Grayscale Xerox Shader Filter styling \*/

.artifact-card {

  border: 1px solid var(--border-color);

  background-color: rgba(5, 5, 5, 0.95);

  cursor: pointer;

  position: relative;

  overflow: hidden;

  will-change: transform, opacity;

  transition: border-color 0.15s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

}

/\* Grayscale Xerox visual effect using CSS/SVG matrices if WebGL is bypassed \*/

.artifact-card img {

  width: 100%;

  height: 100%;

  object-fit: cover;

  filter: grayscale(100%) contrast(150%) brightness(95%);

  transition: filter 0.2s cubic-bezier(0.16, 1, 0.3, 1);

}

.artifact-card:hover {

  border-color: var(--border-highlight);

}

.artifact-card:hover img {

  filter: grayscale(0%) contrast(100%) brightness(100%);

}

### 3.2. Grayscale Xerox WebGL Fragment Shader

To implement the forensic aesthetic dynamically, use the following WebGL shader configuration when rendering raw image blocks inside canvas texture nodes.

precision mediump float;

varying vec2 vUv;

uniform sampler2D uTexture;

uniform float uScrollVelocity; // Reacts to scrolling speed

uniform float uHoverState;     // Interpolates 0.0 \-\> 1.0 based on card focus

void main() {

  vec4 color \= texture2D(uTexture, vUv);

  

  // Calculate grayscale luminance using standard NTSC weights

  float gray \= dot(color.rgb, vec3(0.299, 0.587, 0.114));

  

  // High contrast thresholding (Xerox-style transfer curve)

  float threshColor \= smoothstep(0.2, 0.8, gray);

  

  // Add programmatic chromatic aberration based on velocity

  vec2 offset \= vec2(uScrollVelocity \* 0.02, 0.0);

  float r \= texture2D(uTexture, vUv \+ offset).r;

  float g \= texture2D(uTexture, vUv).g;

  float b \= texture2D(uTexture, vUv \- offset).b;

  vec3 glitchedColor \= vec3(r, g, b);

  

  // Linearly interpolate color restoration based on hover/focus state

  vec3 grayscaleResult \= vec3(threshColor);

  vec3 finalColor \= mix(grayscaleResult, glitchedColor, uHoverState);

  

  gl\_FragColor \= vec4(finalColor, 1.0);

}

---

## 4\. Behavioral Logic & Interactive Engineering

Implementing interactive behaviors requires highly optimized scripts that minimize frame drop and leverage browser painting schedules.

### 4.1. Dynamic Coordinate tracking & Crosshair Magnifier (JS)

The pointer replacement tracks position with a structural crosshair grid overlay. This requires throttling through `requestAnimationFrame` to maintain a steady 60 FPS.

class CrosshairCursor {

  constructor() {

    this.cursor \= document.createElement('div');

    this.cursor.className \= 'custom-crosshair-cursor';

    this.cursor.innerHTML \= \`

      \<div class="crosshair-line-h"\>\</div\>

      \<div class="crosshair-line-v"\>\</div\>

      \<div class="crosshair-center"\>\</div\>

      \<div class="crosshair-coords" id="cursor-coord-display"\>X:0000 Y:0000\</div\>

    \`;

    document.body.appendChild(this.cursor);

    this.display \= document.getElementById('cursor-coord-display');

    this.x \= 0;

    this.y \= 0;

    this.currentX \= 0;

    this.currentY \= 0;

    this.lerpFactor \= 0.15; // Smooth mechanical lag

    this.bindEvents();

    this.animate();

  }

  bindEvents() {

    document.addEventListener('mousemove', (e) \=\> {

      this.x \= e.clientX;

      this.y \= e.clientY;

    });

  }

  animate() {

    // Mechanical lerp interpolation

    this.currentX \+= (this.x \- this.currentX) \* this.lerpFactor;

    this.currentY \+= (this.y \- this.currentY) \* this.lerpFactor;

    this.cursor.style.transform \= \`translate3d(${this.currentX}px, ${this.currentY}px, 0)\`;

    if (this.display) {

      const paddedX \= String(Math.round(this.currentX)).padStart(4, '0');

      const paddedY \= String(Math.round(this.currentY)).padStart(4, '0');

      this.display.textContent \= \`X:${paddedX} Y:${paddedY}\`;

    }

    requestAnimationFrame(() \=\> this.animate());

  }

}

// Initialize on page load

document.addEventListener('DOMContentLoaded', () \=\> {

  new CrosshairCursor();

});

### 4.2. Symmetrical Centering Zoom Calculation

When a card is clicked, the system centers the specific image in the viewport using exact bounding dimensions, dynamically dimming non-focused items.

function inspectRecord(recordId, element) {

  if (state.isAnimating) return;

  state.isAnimating \= true;

  state.inspectingRecord \= recordId;

  // Get current layout dimensions of the clicked grid item

  const rect \= element.getBoundingClientRect();

  const viewportWidth \= window.innerWidth;

  const viewportHeight \= window.innerHeight;

  // Compute scale and offsets to center item symmetrically

  const targetWidth \= viewportWidth \* 0.45; // Centers at 45% of width, leaving rest for sidebar

  const targetHeight \= viewportHeight \* 0.60;

  

  const scaleX \= targetWidth / rect.width;

  const scaleY \= targetHeight / rect.height;

  const scale \= Math.min(scaleX, scaleY);

  const elementCenterX \= rect.left \+ rect.width / 2;

  const elementCenterY \= rect.top \+ rect.height / 2;

  // Shift to 30% width of screen to accommodate 35vw sidebar on right

  const targetCenterX \= viewportWidth \* 0.30;

  const targetCenterY \= viewportHeight \* 0.50;

  const translateX \= targetCenterX \- elementCenterX;

  const translateY \= targetCenterY \- elementCenterY;

  // Create absolute spatial clone to perform the animation overlay

  const clone \= element.cloneNode(true);

  clone.id \= 'active-inspection-clone';

  clone.style.position \= 'fixed';

  clone.style.top \= \`${rect.top}px\`;

  clone.style.left \= \`${rect.left}px\`;

  clone.style.width \= \`${rect.width}px\`;

  clone.style.height \= \`${rect.height}px\`;

  clone.style.zIndex \= '1000';

  clone.style.margin \= '0';

  clone.style.transition \= 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'; // Heavy spring

  

  document.body.appendChild(clone);

  // Trigger surrounding dim layer

  const gridContainer \= document.getElementById('grid-content');

  const cards \= gridContainer.querySelectorAll('.artifact-card');

  cards.forEach(card \=\> {

    if (card \!== element) {

      card.style.opacity \= '0.2';

      card.style.pointerEvents \= 'none';

    }

  });

  // Apply CSS transition scale and translation matrix on next repaint

  requestAnimationFrame(() \=\> {

    clone.style.transform \= \`translate3d(${translateX}px, ${translateY}px, 0\) scale(${scale})\`;

    clone.style.borderColor \= '\#ffffff';

    renderInspectorSidePanel(recordId);

  });

  setTimeout(() \=\> {

    state.isAnimating \= false;

  }, 500);

}

### 4.3. Side-Panel Context Container Rendering

The context panel displays forensic metadata, systems telemetry, and action mappings.

function renderInspectorSidePanel(recordId) {

  // Find record from local data array

  const record \= archivalDatabase.find(r \=\> r.record\_id \=== recordId);

  if (\!record) return;

  const sidePanel \= document.createElement('div');

  sidePanel.id \= 'inspector-side-panel';

  sidePanel.className \= 'inspector-side-panel';

  sidePanel.innerHTML \= \`

    \<div class="inspector-panel-inner"\>

      \<div class="panel-header-group"\>

        \<div class="project-header"\>

          \<span class="meta-label"\>PARENT PROJECT // FORENSICS ID\</span\>

          \<h2 class="project-title"\>${record.parent\_project}\</h2\>

          \<span class="record-indicator"\>\[ ${record.record\_id} \]\</span\>

        \</div\>

        \<button class="close-panel-btn" onclick="closeInspection()"\>\[ CLOSE \]\</button\>

      \</div\>

      

      \<div class="artifact-metadata"\>

        \<div class="meta-row"\>

          \<span class="label"\>RECORD TITLE:\</span\>

          \<span class="value"\>${record.title}\</span\>

        \</div\>

        \<div class="meta-row"\>

          \<span class="label"\>CLASSIFICATION:\</span\>

          \<span class="value"\>${record.medium}\</span\>

        \</div\>

        \<div class="meta-row"\>

          \<span class="label"\>YEAR / HISTORICAL DATE:\</span\>

          \<span class="value"\>${record.historical\_date}\</span\>

        \</div\>

        \<div class="meta-row"\>

          \<span class="label"\>EVIDENCE ROLE:\</span\>

          \<span class="value"\>${record.evidence\_role}\</span\>

        \</div\>

        \<div class="meta-row"\>

          \<span class="label"\>DIMENSIONS:\</span\>

          \<span class="value"\>${record.dimensions} px\</span\>

        \</div\>

        \<div class="meta-row"\>

          \<span class="label"\>STATUS REGISTER:\</span\>

          \<span class="value state-alert"\>${record.status}\</span\>

        \</div\>

      \</div\>

      \<div class="panel-actions"\>

        \<\!-- Enter cinematic slide node \--\>

        \<button class="action-btn primary-action" onclick="enterHorizontalRail('${record.parent\_project}', '${record.rail\_slide\_id}')"\>

          \[ ENTER HORIZONTAL RAIL AT NODE \]

        \</button\>

        \<\!-- Map focus target project node \--\>

        \<button class="action-btn secondary-action" onclick="locateInRelationalAtlas('${record.parent\_project}')"\>

          \[ SHOW RELATIONAL CONNECTIONS IN ATLAS \]

        \</button\>

      \</div\>

    \</div\>

  \`;

  document.body.appendChild(sidePanel);

  // Enforce rigid, zero-bounce sliding

  requestAnimationFrame(() \=\> {

    sidePanel.style.transform \= 'translate3d(0, 0, 0)';

    sidePanel.style.opacity \= '1';

  });

}

/\* Inspector Sidebar Styles \*/

.inspector-side-panel {

  position: fixed;

  top: 0;

  right: 0;

  width: 35vw;

  height: 100vh;

  background-color: rgba(0, 0, 0, 0.95);

  border-left: 1px solid var(--border-color);

  z-index: 1001;

  transform: translate3d(100%, 0, 0); /\* Locked initially \*/

  opacity: 0;

  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  padding: 40px 24px;

}

.inspector-panel-inner {

  display: flex;

  flex-direction: column;

  height: 100%;

  justify-content: space-between;

}

.meta-label {

  font-size: 8px;

  color: var(--text-secondary);

  letter-spacing: 0.25em;

  display: block;

  margin-bottom: 5px;

}

.project-title {

  font-size: 24px;

  font-weight: bold;

  letter-spacing: 0.1em;

  line-height: 1.1;

  text-transform: uppercase;

}

.artifact-metadata {

  margin: 40px 0;

  display: flex;

  flex-direction: column;

  gap: 15px;

  border-top: 1px dashed var(--border-color);

  border-bottom: 1px dashed var(--border-color);

  padding: 24px 0;

}

.meta-row {

  display: flex;

  justify-content: space-between;

  font-size: 11px;

  line-height: 1.4;

}

.meta-row .label {

  color: var(--text-secondary);

  font-family: var(--font-mono);

}

.meta-row .value {

  color: var(--text-color);

  font-family: var(--font-mono);

  font-weight: bold;

}

.state-alert {

  color: \#ffad47 \!important; /\* Orange diagnostic text color \*/

}

.panel-actions {

  display: flex;

  flex-direction: column;

  gap: 12px;

}

.action-btn {

  width: 100%;

  padding: 12px;

  text-align: center;

  border: 1px solid var(--border-color);

  background: transparent;

  text-transform: uppercase;

  font-size: 10px;

  letter-spacing: 0.15em;

  transition: all 0.15s ease;

}

.action-btn.primary-action {

  border-color: var(--border-highlight);

  background-color: var(--text-color);

  color: var(--bg-color);

}

.action-btn.primary-action:hover {

  background-color: var(--bg-color);

  color: var(--text-color);

}

.action-btn.secondary-action:hover {

  border-color: var(--border-highlight);

}

---

## 5\. Animation & Performance Optimization Matrix

To maintain absolute system smoothness and prevent browser lag during layout operations:

### 5.1. Hardware Acceleration Rules

* **CSS Compositing layers:** Grid items and sidebars must utilize `translate3d` to force GPU rendering, avoiding browser reflow cascades.  
* **Property Hinting:** Add `will-change: transform, opacity;` strictly to animated elements. Clean up this hint when the view is torn down or inactive.

### 5.2. Animation Curves Constraint

The project styling mandates a rigorous "no-bounce" mechanical feel. All GSAP or Framer Motion timelines must follow these strict settings:

// Strict spring mechanics for layout transition

export const heavyForensicSpring \= {

  type: "spring",

  stiffness: 180,  // Firm resistance

  damping: 26,     // Critical damping (removes bounce)

  mass: 1.2        // Weight representation

};

### 5.3. Scroll Optimization (Virtual Lists)

When rendering 100+ raw records in the Index grid:

* Implement **IntersectionObserver** to load thumbnails only when the element enters a 200px viewport buffer.  
* Use standard CSS `content-visibility: auto;` on grid children to defer calculation of elements currently offscreen.

---

## 6\. Implementation Task Checklist

### Phase 1: Interactive Pointer Replacement

- [ ] Register tracking listeners on window loading, checking screen capability to disable on touch screen configurations.  
- [ ] Inject cursor DOM fragment into body, binding absolute transform vectors to clientX and clientY.  
- [ ] Implement LERP interpolative mechanics to represent weight and delay.

### Phase 2: Schema Alignments & Data Sourcing

- [ ] Restructure core static database models to support the coordinate logic defined in the Portfolio Atlas (`X`, `Y`, `Z`).  
- [ ] Formulate parent matching keys dynamically linking every asset card back to its flagship `parent_project` sequence.

### Phase 3: Centering calculations & Panel Transitions

- [ ] Implement visual selection centering zoom code using exact `getBoundingClientRect` parameters.  
- [ ] Code CSS and JS class triggers to slide context panel with absolute horizontal spring alignment.  
- [ ] Bind click event hooks to `enterHorizontalRail` and `locateInRelationalAtlas` state managers.

