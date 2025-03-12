export class Particle {
  public x: number;
  public y: number;
  public size: number;
  public color: string;
  public velocity: { x: number, y: number };
  public life: number;
  private initialLife: number;
  
  constructor(
    x: number,
    y: number,
    size: number,
    color: string,
    velocity: { x: number, y: number },
    life: number
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.velocity = velocity;
    this.life = life;
    this.initialLife = life;
  }
  
  public update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.life--;
    
    // Add gravity effect
    this.velocity.y += 0.05;
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    // Fade out as life decreases
    const alpha = this.life / this.initialLife;
    ctx.globalAlpha = alpha;
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}
