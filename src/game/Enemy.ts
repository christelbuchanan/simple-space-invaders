export class Enemy {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  
  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }
  
  public update() {
    // Animate the enemy
    this.animationTimer++;
    if (this.animationTimer > 30) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 2;
    }
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    
    if (this.animationFrame === 0) {
      // First animation frame
      // Draw alien body
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Draw alien eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + 5, this.y + 5, 5, 5);
      ctx.fillRect(this.x + this.width - 10, this.y + 5, 5, 5);
      
      // Draw tentacles
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - 5, this.y + this.height - 5, 5, 10);
      ctx.fillRect(this.x + this.width, this.y + this.height - 5, 5, 10);
    } else {
      // Second animation frame
      // Draw alien body
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Draw alien eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + 5, this.y + 5, 5, 5);
      ctx.fillRect(this.x + this.width - 10, this.y + 5, 5, 5);
      
      // Draw tentacles (different position)
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - 5, this.y + this.height, 5, 10);
      ctx.fillRect(this.x + this.width, this.y + this.height, 5, 10);
    }
  }
}
