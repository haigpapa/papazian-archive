import { Observer } from 'gsap/Observer';

// Observer is registered once in Scene.ts, which constructs this engine.
export default class ScrollEngine {
  public scrollX: number = 0;
  public scrollY: number = 0;
  public targetScrollX: number = 0;
  public targetScrollY: number = 0;
  public zoom: number = 1.0;
  public targetZoom: number = 1.0;
  public mode: string = 'vertical';
  public velocity: number = 0;
  private observer: any;
  private onUpdate: (scrollX: number, scrollY: number, zoom: number) => void;
  private lastInputAt = performance.now();

  constructor(onUpdate: (scrollX: number, scrollY: number, zoom: number) => void) {
    this.onUpdate = onUpdate;

    // Observer to bridge all input types
    this.observer = Observer.create({
      target: window,
      type: 'wheel,touch,pointer',
      wheelSpeed: -1,
      onDown: () => { /* Handle discrete jumps if needed */ },
      onUp: () => {},
      onChange: (self) => {
        const isWheel = self.event && (self.event.type === 'wheel' || self.event.type === 'mousewheel' || self.event.type === 'DOMMouseScroll');

        if (this.mode === 'map') {
          if (isWheel) {
            // Scroll wheel zooms in/out
            const zoomDelta = -self.deltaY * 0.0015;
            this.targetZoom = Math.max(0.4, Math.min(3.2, this.targetZoom + zoomDelta));
          } else {
            // Dragging orbits (map)
            this.targetScrollX += self.deltaX * 0.012;
            this.targetScrollY += self.deltaY * 0.012;
          }
        } else if (this.mode === 'grid') {
          if (isWheel) {
            // Scroll wheel pans vertically in grid view
            this.targetScrollY += -self.deltaY * 0.018;
          } else {
            // Dragging pans in both X and Y
            this.targetScrollX += self.deltaX * 0.012;
            this.targetScrollY += self.deltaY * 0.012;
          }
        } else {
          // Standard scroll mapping for list-based modes
          this.targetScrollX += self.deltaX * 0.01;
          this.targetScrollY += self.deltaY * 0.01;
        }
        this.lastInputAt = performance.now();
      },
      tolerance: 5
    });
  }

  public update(time: number) {
    // Smoothen values (lerp)
    const lerpFactor = 0.04;
    const prevScrollX = this.scrollX;
    const prevScrollY = this.scrollY;
    
    this.scrollX += (this.targetScrollX - this.scrollX) * lerpFactor;
    this.scrollY += (this.targetScrollY - this.scrollY) * lerpFactor;
    this.zoom += (this.targetZoom - this.zoom) * lerpFactor;
    
    // Calculate velocity for shaders (magnitude of 2D velocity)
    const dx = this.scrollX - prevScrollX;
    const dy = this.scrollY - prevScrollY;
    this.velocity = Math.sqrt(dx * dx + dy * dy);

    // Trigger update callback
    this.onUpdate(this.scrollX, this.scrollY, this.zoom);
  }

  public reset() {
    this.scrollX = 0;
    this.scrollY = 0;
    this.targetScrollX = 0;
    this.targetScrollY = 0;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.velocity = 0;
    this.lastInputAt = performance.now();
  }

  public idleFor(ms: number) {
    return performance.now() - this.lastInputAt > ms;
  }

  public clampY(min: number, max: number) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    this.targetScrollY = Math.max(low, Math.min(high, this.targetScrollY));
    this.scrollY = Math.max(low, Math.min(high, this.scrollY));
  }

  public dispose() {
    this.observer.kill();
  }
}
