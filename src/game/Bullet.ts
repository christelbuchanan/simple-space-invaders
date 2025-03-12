export class Bullet {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;
  private speed: number;
  
  constructor(x: number, y: number, width: number, height: number, color: string, speed: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.speed = speed;
  }
  
  public update() {
    this.y += this.speed;
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}
