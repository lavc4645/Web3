import Web3 from "web3";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

const rpc = process.env.ethereum_provider;

// const LoadWeb3 = async () => {
//   let web3 = await new Web3(window.ethereum);
//   if ((window.ethereum == "metamask") ||  typeof window.wallet == "undefined") {
//     let provider = await new ethers.providers.Web3Provider(window.ethereum);
//     let signer = await provider.getSigner();
//     await window.ethereum.request({ method: "eth_requestAccounts" });
//     console.log("Signer", await signer.getAddress());
//     return await signer.getAddress();
//   } else {
//     alert("Please install Metamask");
//   }
// };

async function LoadWeb3() {
  let signer;
  let provider;
  let tprovider;
  window.web3 = new Web3(window.ethereum);
  console.log("-----------------------");
  console.log(window.ethereum);
  console.log("-----------------------");
  if (
    (window.ethereum  == "metamask") ||
    typeof window.wallet == "undefined"
  ) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log(await signer.getAddress());
    return signer.getAddress();
  } else if (window.wallet == "walletConnect") {
    tprovider = new WalletConnectProvider({
      rpc: {
        [process.env.chainId]: rpc,
      },
    });
    const address = await tprovider.enable();
    window.provider = new ethers.providers.Web3Provider(tprovider);
    window.signer = window.provider.getSigner();
    //const address = await walletConnect.enable();
    return address[0] ?? "";
  }
  // if(window.ethereum) {
  //   window.provider = new ethers.providers.Web3Provider(window.ethereum);
  //   window.signer = provider.getSigner();
  // }
}
export default LoadWeb3;
