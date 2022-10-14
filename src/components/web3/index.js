import Web3 from "web3";
// import axios from "axios";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { isCompositeComponent } from "react-dom/test-utils";

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
    const signer_address = await signer.getAddress();

    // axios
    //   .post("http://192.168.20:4000/usersdetails", {
    //     address: signer_address,
    //   })
    //   .then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
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
    // LoadAddress();
    // console.log("Address Stored to DataBase");
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
      // "X-CSRF-TOKEN": 'meta[name="csrf-token"]'.attr("content"), // showing error
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
  const resp = await fetch(
    `http://192.168.20:4000/usersdetails/session`,
    config
  )
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
      // "X-CSRF-TOKEN": '[name="csrf-token"]'[0].content,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const resp = fetch(`/sessions/${address}`, config)
    .then((response) => response)
    .catch((e) => console.log("Session Error", e));
  return resp;
};

// function UpdateCollectionSell(
//   collectionId,
//   buyerAddress,
//   bidId,
//   transactionHash,
//   tokenId = 0
// ) {
//   var request = fetch(` /collections/${collectionId}/sell`, {
//     method: "POST",
//     body: {
//       address: buyerAddress,
//       bid_id: bidId,
//       transaction_hash: transactionHash,
//       tokenId,
//     },
//   })
//     .then((response) => {
//       console.log(response);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }

const LoadAddress = async () => {
  let signer_address = await LoadWeb3();
  console.log("Signer", signer_address);
  var myHeaders = new Headers();
  // myHeaders.append("following", "84561564");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    address: signer_address,
    // name: "Ankit",
    // bio: "none",
    // twitter_link: "@ankit",
    // personal_url: "ankit",
    // youtube_link: "www.youtube.com",
    // facebook_link: "www.facebook.com",
    // telegram_link: "www.telegram.com",
    // following: "456121",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  fetch(`http://192.168.20.148:4000/usersdetails`, requestOptions)
    .then(async (data) => {
      console.log("data", data);
    })
    .catch((err) => console.log("Session Error", err));
};

function UpdateTokenId(tokenId, collectionId, txId) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    tokenId: tokenId,
    collectionId: collectionId,
    tx_id: txId,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/update_token_id`, config)
    .then(async (data) => {
      console.log("data", data);
    })
    .catch((err) => console.log("Session Error", err));
}

const SaveContractNonceValue = (collectionId, sign) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    signature: sign,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/save_contract_nonce_value`, config)
    .then(async (data) => {
      console.log("data", data);
    })
    .catch((err) => console.log("Session Error", err));
};

const CreateContract = (formData) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    formData,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch("/users/create_contract", config)
    .then(async (data) => {
      console.log("data", data);
    })
    .catch((err) => console.log("Session Error", err));
};

const UpdateCollectionBuy = (
  collectionId,
  quantity,
  transactionHash,
  tokenId = 0
) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    quantity: quantity,
    transaction_hash: transactionHash,
    tokenId,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/buy`, config)
    .then(async (data) => {
      console.trace("updateCollectionBuy" + data);
      return data;
    })
    .catch((err) => console.log("Session Error", err));
};

const UpdateCollectionSell = (
  collectionId,
  buyerAddress,
  bidId,
  transactionHash,
  tokenId = 0
) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    address: buyerAddress,
    bid_id: bidId,
    transaction_hash: transactionHash,
    tokenId,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/sell`, config)
    .then(async (data) => {
      console.trace("updateCollectionSell" + data);
      return data;
    })
    .catch((err) => console.log("Session Error", err));
};

const Sign_metadata_with_creator = (
  creator_address,
  tokenURI,
  collectionId
) => {
  var sign;
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    address: creator_address,
    tokenURI: tokenURI,
    collectionId: collectionId,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/sign_metadata_with_creator`, config)
    .then(async (data) => {
      console.log("sign_metadata_with_creator" + data);
      sign = data;
    })
    .catch((err) => console.log("Session Error", err));
  return sign;
};

const UpdateOwnerTransfer = (
  collectionId,
  recipientAddress,
  transactionHash,
  transferQuantity
) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    recipient_address: recipientAddress,
    transaction_hash: transactionHash,
    transaction_quantity: transferQuantity,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/owner_transfer`, config)
    .then(async (data) => {
      console.log("owner_transfer" + data);
    })
    .catch((err) => console.log("Session Error", err));
};

export {
  LoadWeb3,
  GetAccounts,
  GetInfuraId,
  CreateUserSession,
  DestroyUserSession,
  LoadAddress,
  UpdateCollectionSell,
  UpdateTokenId,
};
