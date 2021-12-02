import { ethers, Contract } from 'ethers';
import PPIToken from './contract/PPIToken.json';

const getBlockchain = () => new Promise((resolve, reject) => {
    console.log("A")
    const xxx = async () => {
        console.log("B")
        if(window.ethereum) {
            console.log("C")
            await window.ethereum.enable();
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();

            const ppiToken = new Contract(
                "0xcc3c3a48780F2891ED278341d8359f96Fa4f3036",
                PPIToken.output.abi,
                signer
            );

            resolve({signerAddress, ppiToken});
        }
    }
    xxx();
})

export default getBlockchain;