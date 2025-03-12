export class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;
  private controlCallback: (() => void) | null = null;
  
  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }
  
  public setControlCallback(callback: () => void) {
    this.controlCallback = callback;
  }
  
  public moveLeft(speed: number) {
    this.x = Math.max(0, this.x - speed);
  }
  
  public moveRight(speed: number, canvasWidth: number) {
    this.x = Math.min(canvasWidth - this.width, this.x + speed);
  }
  
  public update() {
    if (this.controlCallback) {
      this.controlCallback();
    }
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    // Draw player ship
    ctx.fillStyle = this.color;
    
    // Ship body
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Ship cockpit
    ctx.fillStyle = '#007700';
    ctx.fillRect(
      this.x + this.width / 2 - 5,
      this.y + 10,
      10,
      10
    );
  }
}
