// Mock blockchain module - no real crypto interactions
// All blockchain/wallet interactions are mocked for demo purposes

const getBlockchain = () => new Promise((resolve, reject) => {
    console.log("Mock blockchain initialization")

    // Generate a mock address
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40).toUpperCase();

    // Create a mock token object with the required methods
    const mockToken = {
        // Mock approve method - simulates token approval
        approve: async (address, amount) => {
            console.log(`Mock approve: ${amount} tokens for ${address}`);
            return {
                wait: async () => {
                    // Simulate transaction confirmation delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return { status: 1 }; // Success
                }
            };
        },

        // Mock transferFrom method - simulates token transfer
        transferFrom: async (from, to, amount) => {
            console.log(`Mock transferFrom: ${amount} tokens from ${from} to ${to}`);
            return {
                wait: async () => {
                    // Simulate transaction confirmation delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return { status: 1 }; // Success
                }
            };
        },

        // Mock faucet method - simulates getting tokens from faucet
        transferFromDemo: async (address) => {
            console.log(`Mock faucet: sending tokens to ${address}`);
            return {
                wait: async () => {
                    // Simulate transaction confirmation delay
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return { status: 1 }; // Success
                }
            };
        }
    };

    // Simulate async initialization
    setTimeout(() => {
        resolve({
            signerAddress: mockAddress,
            ppcToken: mockToken
        });
    }, 500);
});

export default getBlockchain;