import { ethers, Contract } from 'ethers';
import PPIToken from './contract/PPIToken.json';

const networks = {
    polygon: {
      chainId: `0x${Number(137).toString(16)}`,
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
      },
      rpcUrls: ["https://polygon-rpc.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"]
    },
    bsc: {
      chainId: `0x${Number(56).toString(16)}`,
      chainName: "Binance Smart Chain Mainnet",
      nativeCurrency: {
        name: "Binance Chain Native Token",
        symbol: "BNB",
        decimals: 18
      },
      rpcUrls: [
        "https://bsc-dataseed1.binance.org",
        "https://bsc-dataseed2.binance.org",
        "https://bsc-dataseed3.binance.org",
        "https://bsc-dataseed4.binance.org",
        "https://bsc-dataseed1.defibit.io",
        "https://bsc-dataseed2.defibit.io",
        "https://bsc-dataseed3.defibit.io",
        "https://bsc-dataseed4.defibit.io",
        "https://bsc-dataseed1.ninicoin.io",
        "https://bsc-dataseed2.ninicoin.io",
        "https://bsc-dataseed3.ninicoin.io",
        "https://bsc-dataseed4.ninicoin.io",
        "wss://bsc-ws-node.nariox.org"
      ],
      blockExplorerUrls: ["https://bscscan.com"]
    },
    bsc_testnet: {
      chainId: `0x${Number(97).toString(16)}`,
      chainName: "Binance Smart Chain Testnet",
      nativeCurrency: {
        name: "Binance Chain Native Token",
        symbol: "BNB",
        decimals: 18
      },
      rpcUrls: [
        "https://data-seed-prebsc-1-s1.binance.org:8545/",
      ],
      blockExplorerUrls: ["https://testnet.bscscan.com"]
    }  
  };


const getBlockchain = (toast = (x)=> console.log("No Toast Passed") ) => new Promise((resolve, reject) => {
    console.log("A")

    const set_network = async (network) => {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found");
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  ...networks[network]
                }
              ]
            });
            toast("network connected")
        } catch (err) {
            toast(err.message);
            reject(err.msg);
         
        }       
    }   
    const set_token = async () => {
        console.log("B")
        if(window.ethereum) {
            console.log("C")
            await window.ethereum.enable();
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();

            const ppcToken = new Contract(
                "0xcc3c3a48780F2891ED278341d8359f96Fa4f3036",
                PPIToken.output.abi,
                signer
            );

            resolve({signerAddress, ppcToken});
        }else{
            resolve({signerAddress: 0 , ppcToken : 0 })
        }
    }

    const run = async () => {
        const done = await set_network("bsc_testnet");
        set_token()
    }

    run();
})

export default getBlockchain;