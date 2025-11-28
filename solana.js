import { Connection, PublicKey, Transaction, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const NETWORK = 'devnet';
const TOKEN_MINT_ADDRESS = '5PR9CxxqRzjdVqx3hz1d2gwjprQUfxfLQstzt5XWti2D';

// Mock Wallet for Autonomous Testing
const mockWallet = {
    isConnected: true,
    publicKey: new PublicKey('11111111111111111111111111111111'),
    signTransaction: async (tx) => {
        console.log("Mock Wallet: Signing transaction", tx);
        return tx;
    },
    connect: async () => {
        console.log("Mock Wallet: Connected");
        return { publicKey: new PublicKey('11111111111111111111111111111111') };
    }
};

const getBlockchain = () => new Promise(async (resolve, reject) => {
    console.log("Initializing Solana Blockchain Service");

    try {
        let provider = null;
        let signerAddress = null;

        // Check for Solana Wallet (Phantom, etc.)
        if (window.solana && window.solana.isPhantom) {
            provider = window.solana;
            try {
                const resp = await provider.connect();
                signerAddress = resp.publicKey.toString();
            } catch (err) {
                // User rejected request
                console.error(err);
                reject("User rejected wallet connection");
                return;
            }
        } else {
            // Fallback to Mock Wallet for Autonomous Testing
            console.log("No Solana wallet found, using Mock Wallet for testing.");
            provider = mockWallet;
            signerAddress = provider.publicKey.toString();
        }

        const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

        // Mock Token Object that simulates Ethereum ERC20 interface
        const ppcToken = {
            // Mock approve method (simulates ERC20 approve)
            approve: async (spenderAddress, amount) => {
                console.log(`Mock Token: Approving ${amount} tokens for ${spenderAddress}`);

                // Return a mock transaction object that simulates Ethereum tx
                return {
                    hash: "0xmock" + Math.random().toString(36).substring(7),
                    wait: async () => {
                        console.log("Mock Token: Waiting for approval confirmation...");
                        // Simulate network delay
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        console.log("Mock Token: Approval confirmed");
                        return {
                            status: 1, // Success
                            transactionHash: "0xmock" + Math.random().toString(36).substring(7)
                        };
                    }
                };
            },

            // Mock transferFrom method (simulates ERC20 transferFrom)
            transferFrom: async (fromAddress, toAddress, amount) => {
                console.log(`Mock Token: Transferring ${amount} tokens from ${fromAddress} to ${toAddress}`);

                // Return a mock transaction object
                return {
                    hash: "0xmock" + Math.random().toString(36).substring(7),
                    wait: async () => {
                        console.log("Mock Token: Waiting for transfer confirmation...");
                        // Simulate network delay
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        console.log("Mock Token: Transfer confirmed");
                        return {
                            status: 1, // Success
                            transactionHash: "0xmock" + Math.random().toString(36).substring(7)
                        };
                    }
                };
            },

            // Legacy transfer method
            transfer: async (toAddress, amount) => {
                console.log(`Mock Token: Transferring ${amount} tokens to ${toAddress}`);

                return {
                    hash: "0xmock" + Math.random().toString(36).substring(7),
                    wait: async () => {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return {
                            status: 1,
                            transactionHash: "0xmock" + Math.random().toString(36).substring(7)
                        };
                    }
                };
            }
        };

        resolve({ signerAddress, ppcToken });

    } catch (err) {
        console.error("Blockchain init error", err);
        reject(err);
    }
});

export default getBlockchain;
