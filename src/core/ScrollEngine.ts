import { Observer } from 'gsap/Observer';
import { normalizeRailInputDelta } from './scrollInput';

export interface ScrollSnapshot {
  scrollX: number;
  scrollY: number;
  targetScrollX: number;
  targetScrollY: number;
  zoom: number;
  targetZoom: number;
}

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
  private inputTarget: HTMLElement;
  private onUpdate: (scrollX: number, scrollY: number, zoom: number) => void;
  private lastInputAt = performance.now();
  private initialTouchDist = 0;
  private initialZoom = 1.0;
  private lastUpdateTime = performance.now() / 1000;

  constructor(inputTarget: HTMLElement, onUpdate: (scrollX: number, scrollY: number, zoom: number) => void) {
    this.inputTarget = inputTarget;
    this.onUpdate = onUpdate;

    // Touch pinch-to-zoom event listeners
    this.inputTarget.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.inputTarget.addEventListener('touchmove', this.onTouchMove, { passive: true });
    this.inputTarget.addEventListener('touchend', this.onTouchEnd, { passive: true });

    // Observer to bridge all input types
    this.observer = Observer.create({
      target: this.inputTarget,
      type: 'wheel,touch,pointer',
      wheelSpeed: -1,
      onDown: () => { /* Handle discrete jumps if needed */ },
      onUp: () => {},
      onChange: (self) => {
        const isWheel = self.event && (self.event.type === 'wheel' || self.event.type === 'mousewheel' || self.event.type === 'DOMMouseScroll');
        const railDeltaY = this.mode === 'horizontal'
          ? normalizeRailInputDelta(
              self.deltaY,
              isWheel ? self.event as WheelEvent : null,
              window.innerHeight,
            )
          : self.deltaY;

        if (this.mode === 'map') {
          if (isWheel) {
            const ev = self.event as WheelEvent;
            const isPinch = ev.ctrlKey;
            const isMouseWheel = !isPinch && ev.deltaX === 0;

            if (isPinch || isMouseWheel) {
              const zoomDelta = -self.deltaY * 0.0015;
              this.targetZoom = Math.max(0.4, Math.min(3.2, this.targetZoom + zoomDelta));
            } else {
              this.targetScrollX += self.deltaX * 0.012;
              this.targetScrollY += self.deltaY * 0.012;
            }
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
          this.targetScrollY += railDeltaY * 0.01;
        }
        this.lastInputAt = performance.now();
      },
      tolerance: 5
    });
  }

  private onTouchStart = (event: TouchEvent) => {
    if (event.targetTouches.length === 2) {
      const touch1 = event.targetTouches[0];
      const touch2 = event.targetTouches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      this.initialTouchDist = Math.sqrt(dx * dx + dy * dy);
      this.initialZoom = this.targetZoom;
    }
  };

  private onTouchMove = (event: TouchEvent) => {
    if (event.targetTouches.length === 2 && this.initialTouchDist > 0) {
      const touch1 = event.targetTouches[0];
      const touch2 = event.targetTouches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / this.initialTouchDist;
      this.targetZoom = Math.max(0.4, Math.min(3.2, this.initialZoom * factor));
      this.lastInputAt = performance.now();
    }
  };

  private onTouchEnd = () => {
    this.initialTouchDist = 0;
  };

  public update(time: number) {
    const dt = Math.min(0.1, time - this.lastUpdateTime);
    this.lastUpdateTime = time;

    // Smoothen values (lerp) using frame-rate independent factors
    // 1 - Math.exp(-k * dt); where k = 2.44 matches 0.04 at 60Hz
    const lerpFactor = 1 - Math.exp(-2.44 * (dt || 0.0167));
    const prevScrollX = this.scrollX;
    const prevScrollY = this.scrollY;
    
    this.scrollX += (this.targetScrollX - this.scrollX) * lerpFactor;
    this.scrollY += (this.targetScrollY - this.scrollY) * lerpFactor;
    this.zoom += (this.targetZoom - this.zoom) * lerpFactor;
    
    // Calculate velocity for shaders (magnitude of 2D velocity per second, scaled to reference frame duration of 0.0167s)
    const dx = this.scrollX - prevScrollX;
    const dy = this.scrollY - prevScrollY;
    const dtSeconds = dt || 0.0167;
    this.velocity = (Math.sqrt(dx * dx + dy * dy) / dtSeconds) * 0.0167;

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

  public snapshot(): ScrollSnapshot {
    return {
      scrollX: this.scrollX,
      scrollY: this.scrollY,
      targetScrollX: this.targetScrollX,
      targetScrollY: this.targetScrollY,
      zoom: this.zoom,
      targetZoom: this.targetZoom,
    };
  }

  public restore(snapshot: ScrollSnapshot) {
    this.scrollX = snapshot.scrollX;
    this.scrollY = snapshot.scrollY;
    this.targetScrollX = snapshot.targetScrollX;
    this.targetScrollY = snapshot.targetScrollY;
    this.zoom = snapshot.zoom;
    this.targetZoom = snapshot.targetZoom;
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
    this.inputTarget.removeEventListener('touchstart', this.onTouchStart);
    this.inputTarget.removeEventListener('touchmove', this.onTouchMove);
    this.inputTarget.removeEventListener('touchend', this.onTouchEnd);
    this.observer.kill();
  }
}
