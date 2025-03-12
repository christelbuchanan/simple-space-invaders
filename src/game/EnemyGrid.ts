import { Enemy } from './Enemy';

export function createEnemyGrid(canvasWidth: number): Enemy[] {
  const enemies: Enemy[] = [];
  const rows = 5;
  const cols = 10;
  const enemyWidth = 30;
  const enemyHeight = 30;
  const padding = 20;
  
  // Calculate total width of the grid
  const gridWidth = cols * (enemyWidth + padding) - padding;
  
  // Calculate starting x position to center the grid
  const startX = (canvasWidth - gridWidth) / 2;
  
  // Create rows of enemies
  for (let row = 0; row < rows; row++) {
    // Different colors for different rows
    let color: string;
    switch (row) {
      case 0:
        color = '#f00'; // Red for top row
        break;
      case 1:
      case 2:
        color = '#ff0'; // Yellow for middle rows
        break;
      default:
        color = '#0ff'; // Cyan for bottom rows
        break;
    }
    
    for (let col = 0; col < cols; col++) {
      const x = startX + col * (enemyWidth + padding);
      const y = 50 + row * (enemyHeight + padding);
      
      const enemy = new Enemy(x, y, enemyWidth, enemyHeight, color);
      enemies.push(enemy);
    }
  }
  
  return enemies;
}
