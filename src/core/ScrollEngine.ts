import { Observer } from 'gsap/Observer';
import gsap from 'gsap';

gsap.registerPlugin(Observer);

export default class ScrollEngine {
  public scrollX: number = 0;
  public scrollY: number = 0;
  public targetScrollX: number = 0;
  public targetScrollY: number = 0;
  public velocity: number = 0;
  private observer: any;
  private onUpdate: (scrollX: number, scrollY: number) => void;
  private lastInputAt = performance.now();

  constructor(onUpdate: (scrollX: number, scrollY: number) => void) {
    this.onUpdate = onUpdate;

    // Observer to bridge all input types
    this.observer = Observer.create({
      target: window,
      type: 'wheel,touch,pointer',
      wheelSpeed: -1,
      onDown: () => { /* Handle discrete jumps if needed */ },
      onUp: () => {},
      onChange: (self) => {
        // Map delta to virtual scroll
        this.targetScrollX += self.deltaX * 0.01;
        this.targetScrollY += self.deltaY * 0.01;
        this.lastInputAt = performance.now();
      },
      tolerance: 5
    });
  }

  public update(time: number) {
    // Smoothen the scroll value (lerp)
    const lerpFactor = 0.06;
    const prevScrollX = this.scrollX;
    const prevScrollY = this.scrollY;
    
    this.scrollX += (this.targetScrollX - this.scrollX) * lerpFactor;
    this.scrollY += (this.targetScrollY - this.scrollY) * lerpFactor;
    
    // Calculate velocity for shaders (magnitude of 2D velocity)
    const dx = this.scrollX - prevScrollX;
    const dy = this.scrollY - prevScrollY;
    this.velocity = Math.sqrt(dx * dx + dy * dy);

    // Trigger update callback
    this.onUpdate(this.scrollX, this.scrollY);
  }

  public reset() {
    this.scrollX = 0;
    this.scrollY = 0;
    this.targetScrollX = 0;
    this.targetScrollY = 0;
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
