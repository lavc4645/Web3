import Web3 from "web3";
// import axios from "axios";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

const rpc = "https://goerli.infura.io/v3/3e19c57faceb42c5a67bd39c08258898";

let signer;
let provider;
let tprovider;
let chainId = process.env.CHAIN_ID;

async function LoadWeb3() {
  window.web3 = new Web3(window.ethereum);
  console.log("-----------------------");
  console.log(window.wallet);
  console.log("-----------------------");
  if (
    (window.ethereum && window.wallet == "metamask") ||
    typeof window.wallet == "undefined"
  ) {
    /** Defining the provider in the function and can be withdrawl outside
     * the function */
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

const GetAccounts = async () => {
  try {
    if (window.wallet == "walletConnect") {
      const signer = window.provider.getSigner();
      var accounts = await signer.getAddress();
    } else {
      const signer = provider.getSigner();
      var accounts = await signer.getAddress();
    }
    console.log("--------->", accounts);
    return accounts;
  } catch (e) {
    console.log(e);
  }
};

const GetInfuraId = async () => {
  const url = new URL(rpc);
  const path = url.pathname.split("/");
  console.log("Infura Id", path[path.length - 1] ?? "");
  return path[path.length - 1] ?? "";
};

const CreateUserSession = async (
  address,
  balance,
  destroySession,
  wallet = window.wallet
) => {
  const config = {
    method: "POST",
    headers: {
      "X-CSRF-TOKEN": 'meta[name="csrf-token"]'.attr("content"), // showing error
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: {
      address: address,
      balance: balance,
      destroy_session: destroySession,
      wallet,
    },
  };
  const resp = await fetch(`http://localhost:3001/session`, config)
    .then((response) => {
      console.log("fadsf");
      return resp;
    })
    .catch((err) => {
      console.log("User Session Create Error", err);
    });
  return resp;
};

const DestroyUserSession = async (address) => {
  const config = {
    method: "DELETE",
    data: {},
    headers: {
      "X-CSRF-TOKEN": '[name="csrf-token"]'[0].content,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const resp = fetch(`/sessions/${address}`, config)
    .then((response) => response)
    .catch((e) => console.log("Session Error", e));
  return resp;
};
export {
  LoadWeb3,
  GetAccounts,
  GetInfuraId,
  CreateUserSession,
  DestroyUserSession,
};
