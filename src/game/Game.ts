import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { Particle } from './Particle';
import { createEnemyGrid } from './EnemyGrid';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private enemies: Enemy[] = [];
  private playerBullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private particles: Particle[] = [];
  private score: number = 0;
  private lives: number = 3;
  private isGameOver: boolean = false;
  private lastTime: number = 0;
  private enemyDirection: number = 1;
  private enemyMoveDownTimer: number = 0;
  private enemyShootTimer: number = 0;
  private scoreElement: HTMLElement;
  private livesElement: HTMLElement;
  private animationFrameId: number = 0;
  
  public onGameOver: () => void = () => {};

  constructor(canvas: HTMLCanvasElement, scoreElement: HTMLElement, livesElement: HTMLElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.scoreElement = scoreElement;
    this.livesElement = livesElement;
    
    // Create player
    this.player = new Player(
      this.canvas.width / 2 - 25,
      this.canvas.height - 60,
      50,
      30,
      '#0f0'
    );
    
    // Create enemies
    this.resetEnemies();
    
    // Set up keyboard controls
    this.setupControls();
  }

  private resetEnemies() {
    this.enemies = createEnemyGrid(this.canvas.width);
  }

  private setupControls() {
    const keys: { [key: string]: boolean } = {};
    
    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      
      // Space bar to shoot
      if (e.key === ' ' && !this.isGameOver) {
        this.playerShoot();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });
    
    // Update player movement based on keys
    this.player.setControlCallback(() => {
      const moveSpeed = 5;
      
      if (keys['ArrowLeft'] || keys['a']) {
        this.player.moveLeft(moveSpeed);
      }
      if (keys['ArrowRight'] || keys['d']) {
        this.player.moveRight(moveSpeed, this.canvas.width);
      }
    });
  }

  private playerShoot() {
    // Limit shooting rate
    if (this.playerBullets.length < 3) {
      const bullet = new Bullet(
        this.player.x + this.player.width / 2 - 2,
        this.player.y,
        4,
        15,
        '#0f0',
        -10
      );
      this.playerBullets.push(bullet);
      
      // Play sound effect
      this.playSound('shoot');
    }
  }

  private enemyShoot() {
    // Randomly select an enemy to shoot
    if (this.enemies.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.enemies.length);
      const enemy = this.enemies[randomIndex];
      
      const bullet = new Bullet(
        enemy.x + enemy.width / 2 - 2,
        enemy.y + enemy.height,
        4,
        15,
        '#f00',
        5
      );
      this.enemyBullets.push(bullet);
      
      // Play sound effect
      this.playSound('enemyShoot');
    }
  }

  private checkCollisions() {
    // Check player bullets hitting enemies
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        
        if (this.isColliding(bullet, enemy)) {
          // Remove bullet
          this.playerBullets.splice(i, 1);
          
          // Remove enemy
          this.enemies.splice(j, 1);
          
          // Add score
          this.score += 100;
          this.updateScore();
          
          // Create explosion particles
          this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
          
          // Play explosion sound
          this.playSound('explosion');
          
          break;
        }
      }
    }
    
    // Check enemy bullets hitting player
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      
      if (this.isColliding(bullet, this.player)) {
        // Remove bullet
        this.enemyBullets.splice(i, 1);
        
        // Reduce lives
        this.lives--;
        this.updateLives();
        
        // Create explosion particles
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, this.player.color);
        
        // Play hit sound
        this.playSound('playerHit');
        
        // Check game over
        if (this.lives <= 0) {
          this.gameOver();
        }
      }
    }
    
    // Check enemies colliding with player
    for (const enemy of this.enemies) {
      if (this.isColliding(enemy, this.player)) {
        this.gameOver();
        break;
      }
      
      // Check if enemies reached the bottom
      if (enemy.y + enemy.height >= this.canvas.height - 50) {
        this.gameOver();
        break;
      }
    }
  }

  private isColliding(a: { x: number, y: number, width: number, height: number }, 
                      b: { x: number, y: number, width: number, height: number }): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private createExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 15; i++) {
      const particle = new Particle(
        x,
        y,
        Math.random() * 3 + 1,
        color,
        {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        },
        30 + Math.random() * 30
      );
      this.particles.push(particle);
    }
  }

  private updateEnemies(deltaTime: number) {
    // Move enemies
    let moveDown = false;
    let changeDirection = false;
    
    // Check if any enemy hits the edge
    for (const enemy of this.enemies) {
      if (
        (enemy.x <= 0 && this.enemyDirection < 0) ||
        (enemy.x + enemy.width >= this.canvas.width && this.enemyDirection > 0)
      ) {
        changeDirection = true;
        moveDown = true;
        break;
      }
    }
    
    if (changeDirection) {
      this.enemyDirection *= -1;
    }
    
    // Move all enemies
    for (const enemy of this.enemies) {
      enemy.x += this.enemyDirection * (1 + (1 - this.enemies.length / 50));
      
      if (moveDown) {
        enemy.y += 20;
      }
      
      // Animate enemy
      enemy.update();
    }
    
    // Enemy shooting
    this.enemyShootTimer += deltaTime;
    if (this.enemyShootTimer > 1000 + Math.random() * 2000) {
      this.enemyShootTimer = 0;
      this.enemyShoot();
    }
    
    // If all enemies are destroyed, create a new wave
    if (this.enemies.length === 0) {
      this.resetEnemies();
      
      // Increase score for completing a wave
      this.score += 500;
      this.updateScore();
    }
  }

  private updateBullets() {
    // Update player bullets
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      bullet.update();
      
      // Remove bullets that go off screen
      if (bullet.y < 0) {
        this.playerBullets.splice(i, 1);
      }
    }
    
    // Update enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.update();
      
      // Remove bullets that go off screen
      if (bullet.y > this.canvas.height) {
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update();
      
      // Remove particles that have expired
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateScore() {
    this.scoreElement.textContent = `Score: ${this.score}`;
  }

  private updateLives() {
    this.livesElement.textContent = `Lives: ${this.lives}`;
  }

  private gameOver() {
    this.isGameOver = true;
    this.playSound('gameOver');
    
    // Call the game over callback
    this.onGameOver();
  }

  private playSound(type: string) {
    // Simple sound effect implementation
    // In a real game, you would load and play actual sound files
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'shoot':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'enemyShoot':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'explosion':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'playerHit':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'gameOver':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
        break;
    }
  }

  private draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw stars (background)
    this.drawStars();
    
    // Draw player
    this.player.draw(this.ctx);
    
    // Draw enemies
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }
    
    // Draw player bullets
    for (const bullet of this.playerBullets) {
      bullet.draw(this.ctx);
    }
    
    // Draw enemy bullets
    for (const bullet of this.enemyBullets) {
      bullet.draw(this.ctx);
    }
    
    // Draw particles
    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }
    
    // Draw game over text
    if (this.isGameOver) {
      this.ctx.fillStyle = '#f00';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }

  private drawStars() {
    // Draw random stars in the background
    this.ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 2 + 1;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private gameLoop(timestamp: number) {
    if (this.lastTime === 0) {
      this.lastTime = timestamp;
    }
    
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Update game state
    if (!this.isGameOver) {
      this.player.update();
      this.updateEnemies(deltaTime);
      this.updateBullets();
      this.checkCollisions();
    }
    
    this.updateParticles();
    
    // Draw everything
    this.draw();
    
    // Continue the game loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public start() {
    // Reset game state
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.lastTime = 0;
    this.playerBullets = [];
    this.enemyBullets = [];
    this.particles = [];
    
    // Reset player position
    this.player.x = this.canvas.width / 2 - 25;
    this.player.y = this.canvas.height - 60;
    
    // Reset enemies
    this.resetEnemies();
    
    // Update UI
    this.updateScore();
    this.updateLives();
    
    // Start game loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public stop() {
    cancelAnimationFrame(this.animationFrameId);
  }
}
