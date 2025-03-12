import './style.css';
import { initWallet } from './wallet';
import { Game } from './game/Game';

let game: Game | null = null;

// Initialize the application
async function init() {
  const { connectWallet, getWalletAddress, isConnected } = initWallet();
  
  const connectButton = document.getElementById('connect-wallet') as HTMLButtonElement;
  const walletStatus = document.getElementById('wallet-status') as HTMLElement;
  const loginScreen = document.getElementById('login-screen') as HTMLElement;
  const gameScreen = document.getElementById('game-screen') as HTMLElement;
  const walletAddressElement = document.getElementById('wallet-address') as HTMLElement;
  const restartButton = document.getElementById('restart-button') as HTMLButtonElement;
  
  // Connect wallet button
  connectButton.addEventListener('click', async () => {
    try {
      await connectWallet();
      
      if (isConnected()) {
        const address = getWalletAddress();
        walletStatus.textContent = 'Connected!';
        walletStatus.style.color = '#0f0';
        
        // Show wallet address in game screen
        walletAddressElement.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        
        // Switch to game screen after a short delay
        setTimeout(() => {
          loginScreen.style.display = 'none';
          gameScreen.style.display = 'flex';
          
          // Initialize the game
          startGame();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      walletStatus.textContent = 'Failed to connect wallet. Please try again.';
      walletStatus.style.color = 'red';
    }
  });
  
  // Restart button
  restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';
    startGame();
  });
  
  // Check if wallet is already connected
  if (isConnected()) {
    const address = getWalletAddress();
    walletStatus.textContent = 'Already connected!';
    walletStatus.style.color = '#0f0';
    walletAddressElement.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    
    // Switch to game screen
    loginScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    
    // Initialize the game
    startGame();
  }
}

function startGame() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const scoreElement = document.getElementById('score') as HTMLElement;
  const livesElement = document.getElementById('lives') as HTMLElement;
  const restartButton = document.getElementById('restart-button') as HTMLButtonElement;
  
  // Resize canvas to fit container
  canvas.width = 800;
  canvas.height = 600;
  
  // Create and start the game
  game = new Game(canvas, scoreElement, livesElement);
  
  game.onGameOver = () => {
    restartButton.style.display = 'block';
  };
  
  game.start();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
