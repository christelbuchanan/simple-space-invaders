import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export function initWallet() {
  let provider: any = null;
  let signer: ethers.providers.JsonRpcSigner | null = null;
  let walletAddress: string = '';
  
  async function connectWallet() {
    try {
      // Detect the Ethereum provider (MetaMask)
      provider = await detectEthereumProvider();
      
      if (!provider) {
        throw new Error('Please install MetaMask!');
      }
      
      // Request account access
      await provider.request({ method: 'eth_requestAccounts' });
      
      // Create ethers provider and signer
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      signer = ethersProvider.getSigner();
      walletAddress = await signer.getAddress();
      
      // Listen for account changes
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          signer = null;
          walletAddress = '';
          window.location.reload();
        } else {
          // User switched accounts
          walletAddress = accounts[0];
          const walletAddressElement = document.getElementById('wallet-address');
          if (walletAddressElement) {
            walletAddressElement.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
          }
        }
      });
      
      return { provider, signer, walletAddress };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }
  
  function isConnected(): boolean {
    return !!signer && !!walletAddress;
  }
  
  function getWalletAddress(): string {
    return walletAddress;
  }
  
  return {
    connectWallet,
    isConnected,
    getWalletAddress
  };
}
