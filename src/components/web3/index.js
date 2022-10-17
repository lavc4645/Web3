import Web3 from "web3";
// import axios from "axios";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { isCompositeComponent } from "react-dom/test-utils";
const tokenURIPrefix = "https://gateway.pinata.cloud/ipfs/";
const transferProxyContractAddress =
  "0x1E75299b396350bf88d3750B3d4E0a894a3cEc5F";
const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const tradeContractAddress = "0x9FDedd2608Aa7C9B4B22C91cB39318AA533f0EE8";
const tradeProxyContractAddress = "0xBa38865f3380539A43d03BcB02eb541bBb913fD9";
// const sessionAddress =

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

/** API Integration */
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


/** Storing the metamask address to database in users table */
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

const UpdateBurn = (collectionId, transactionHash, burnQuantity) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    transaction_hash: transactionHash,
    transaction_quantity: burnQuantity,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/burn`, config)
    .then(async (data) => {
      console.log(data);
    })
    .catch((err) => console.log("Session Error", err));
};

/** This will use axios and params in the payload
 * discuss with senior
 */
// async function IsValidUser(address, token, wallet) {
//   const config = {
//     headers: {
//       "X-CSRF-TOKEN": token,
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//   };
//   const resp = await axios
//     .get(
//       `/sessions/valid_user`,
//       { params: { address: address, authenticity_token: token, wallet } },
//       config
//     )
//     .then((response) => {
//       console.log("validate user", response);
//       return response.data;
//     })
//     .catch((err) => {
//       console.log("User Session Validate Error", err);
//     });
//   return resp;
// }

const PlaceBid = (collectionId, sign, quantity, bidDetails) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    sign: sign,
    quantity: quantity,
    details: bidDetails,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/bid`, config)
    .then(async (data) => {
      console.log("Bidding Success" + data);
    })
    .catch((err) => console.log("Bidding Failed", err));
};

const SignMetadataHash = (collectionId, contractAddress) => {
  var sign;
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    contract_address: contractAddress,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/sign_metadata_hash`, config)
    .then(async (data) => {
      console.log(data);
      sign = {
        sign: data["signature"],
        nonce: data["nonce"],
      };
    })
    .catch((err) => console.log("Bidding Failed", err));
  return sign;
};

const UpdateSignature = (collectionId, sign) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    sign: sign,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/sign_fixed_price`, config)
    .then(async (data) => {
      console.log("Signature Updated" + data);
    })
    .catch((err) => console.log("Signature update Failed", err));
};

window.approveCollection = function approveCollection(collectionId) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var config = {
    method: "POST",
    headers: myHeaders,
  };
  fetch(`/collections/${collectionId}/approve`, config)
    .then(async (data) => {
      console.log("Collection Updated" + data);
    })
    .catch((err) => console.log("Collection update Failed", err));
};

const GetNonceValue = (collectionId) => {
  var nonce;
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({});
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/get_nonce_value`, config)
    .then(async (data) => {
      console.log(data);
      nonce = data["nonce"];
    })
    .catch((err) => console.log("Nonce Failed", err));
  return nonce;
};

const SaveNonceValue = (collectionId, sign, nonce) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    sign: sign,
    nonce: nonce,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/save_nonce_value`, config)
    .then(async (data) => {
      console.log("Nonce Updated" + data);
    })
    .catch((err) => console.log("Nonce Failed", err));
};

const GetContractSignNonce = (collectionId, sign) => {
  var nonce;
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    sign: sign,
  });
  var config = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/collections/${collectionId}/get_contract_sign_nonce`, config)
    .then(async (data) => {
      console.log(data);
      nonce = data["nonce"];
    })
    .catch((err) => console.log("Nonce Failed", err));
  return nonce;
};

const GetRandom = (address) => {
  let value = Date.now() + Math.floor(Math.random() * 10 ** 10 + 1);
  var hex = value.toString(16);
  hex = hex + address.slice(2);
  return `0x${"0".repeat(64 - hex.length)}${hex}`;
};

window.getContractABIandBytecode = function getContractABIandBytecode(
  contractAddress,
  type,
  shared = true
) {
  var res;
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    contract_address: contractAddress,
    type: type,
    shared: shared,
  });
  var config = {
    method: "GET",
    headers: myHeaders,
    body: raw,
  };
  fetch(`/contract_abi`, config)
    .then(async (data) => {
      console.log(data);
      res = data;
    })
    .catch((err) => console.log("Nonce Failed", err));
  return res;
};

function splitSign(sign, nonce) {
  // sign = sign.slice(2)
  // var r = `0x${sign.slice(0, 64)}`
  // var s = `0x${sign.slice(64, 128)}`
  // var v = web3.utils.toDecimal(`0x${sign.slice(128, 130)}`)
  // return [v, r, s, nonce]
  let sig = ethers.utils.splitSignature(sign);
  return [sig.v, sig.r, sig.s, nonce];
}

/** Load Contracts */
const Load721Contract = async (contractAddress) => {
  return await new window.web3.eth.Contract(
    [
      {
        inputs: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "approved",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "approved",
            type: "bool",
          },
        ],
        name: "ApprovalForAll",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "baseURI",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "string", name: "tokenURI", type: "string" },
          { internalType: "uint256", name: "fee", type: "uint256" },
        ],
        name: "createCollectible",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "getApproved",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "getFee",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "getOwner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "operator", type: "address" },
        ],
        name: "isApprovedForAll",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "ownerOf",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "bytes", name: "_data", type: "bytes" },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "operator", type: "address" },
          { internalType: "bool", name: "approved", type: "bool" },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "string", name: "baseURI_", type: "string" }],
        name: "setBaseURI",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes4", name: "interfaceId", type: "bytes4" },
        ],
        name: "supportsInterface",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
        name: "tokenByIndex",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "tokenCounter",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "uint256", name: "index", type: "uint256" },
        ],
        name: "tokenOfOwnerByIndex",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "tokenURI",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    contractAddress
  );
};

const Load1155Contract = async (contractAddress) => {
  return await new window.web3.eth.Contract(
    [
      {
        inputs: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "string", name: "uri", type: "string" },
        ],
        name: "_setTokenURI",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "string", name: "_tokenURIPrefix", type: "string" },
        ],
        name: "_setTokenURIPrefix",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "approved",
            type: "bool",
          },
        ],
        name: "ApprovalForAll",
        type: "event",
      },
      {
        inputs: [
          { internalType: "string", name: "uri", type: "string" },
          { internalType: "uint256", name: "supply", type: "uint256" },
          { internalType: "uint256", name: "fee", type: "uint256" },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256[]", name: "ids", type: "uint256[]" },
          { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        name: "safeBatchTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "operator", type: "address" },
          { internalType: "bool", name: "approved", type: "bool" },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256[]",
            name: "ids",
            type: "uint256[]",
          },
          {
            indexed: false,
            internalType: "uint256[]",
            name: "values",
            type: "uint256[]",
          },
        ],
        name: "TransferBatch",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "TransferSingle",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "string",
            name: "value",
            type: "string",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
        ],
        name: "URI",
        type: "event",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address[]", name: "accounts", type: "address[]" },
          { internalType: "uint256[]", name: "ids", type: "uint256[]" },
        ],
        name: "balanceOfBatch",
        outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "creators",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "getFee",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "getOwner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "address", name: "operator", type: "address" },
        ],
        name: "isApprovedForAll",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "royalties",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes4", name: "interfaceId", type: "bytes4" },
        ],
        name: "supportsInterface",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "tokenURI",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "tokenURIPrefix",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    contractAddress
  );
};

const LoadTransferProxyContract = async () => {
  return await new window.web3.eth.Contract(
    [
      {
        inputs: [
          { internalType: "contract IERC1155", name: "token", type: "address" },
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        name: "erc1155safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IERC20", name: "token", type: "address" },
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "erc20safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IERC721", name: "token", type: "address" },
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "erc721safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    "0xa08a50477D051a9f380b9E7F62a62707750B61c0"
  );
};

/** Checking the contract address of current nft is old deprecated tradeproxycontract
 * line: 1082  //web3.js
 */
// const CheckDepricatedStatus = async () => {
//   var contractAddress =
// }

window.getContract = async function getContract(
  contractAddress,
  type,
  shared = true
) {
  console.log(contractAddress, type, shared);
  var res = getContractABIAndBytecode(contractAddress, type, shared);
  var proname = window.wallet == "walletConnect" ? window.provider : provider;
  var contractObj = new ethers.Contract(
    contractAddress,
    res["compiled_contract_details"]["abi"],
    proname
  );
  console.log(contractObj);
  return contractObj;
};

window.createCollectible721 = async function createCollectible721(
  contractAddress,
  tokenURI,
  royalityFee,
  collectionId,
  sharedCollection
) {
  try {
    console.log("enter createCollectible721");
    var account = getCurrentAccount();
    console.log(account, contractAddress, "nft721", sharedCollection);
    const contract721 = await fetchContract(
      contractAddress,
      "nft721",
      sharedCollection
    );
    var gasPrices = await gasPrice();
    var txn;
    console.log(sharedCollection);
    if (sharedCollection) {
      console.log("HI");
      var sign = await SignMetadataHash(collectionId, contractAddress);
      await SaveContractNonceValue(collectionId, sign);
      var signStruct = splitSign(sign["sign"], sign["nonce"]);
      txn = await contract721.createCollectible(
        tokenURI,
        royalityFee,
        signStruct,
        {
          gasLimit: 516883,
          gasPrice: String(gasPrices),
        }
      );
    } else {
      txn = await contract721.createCollectible(tokenURI, royaltyFee, {
        gasLimit: 516883,
        gasPrice: String(gasPrices),
      });
    }
    var tx = await txn.wait();
    //var tokenId = parseInt(txn.logs[1].topics[1]);
    var tokenId = parseInt(tx.events[0].topics[tx.events[0].topics.length - 1]);
    console.log(tokenId);
    await UpdateTokenId(tokenId, collectionId, tx.transactionHash);
    return window.collectionMintSuccess(collectionId);
  } catch (err) {
    console.log(err);
    return window.collectionMintFailed(err["message"]);
  }
};


window.createCollectible1155 = async function createCollectible1155(
  contractAddress,
  supply,
  tokenURI,
  royalityFee,
  collectionId,
  sharedCollection
) {
  try{
    console.log("enter createCollectible1155");
    var account = getCurrentAccount();
    console.log(account, contractAddress, "nft1155", sharedCollection);
    const contract1155 = await fetchContract(
      contractAddress,
      "nft1155",
      sharedCollection
    );
    var gasPrices = await gasPrice();
    var txn;
    if (sharedCollection) {
      var sign = await signMetadataHash(collectionId, contractAddress);
      await saveContractNonceValue(collectionId, sign);
      var signStruct = splitSign(sign["sign"], sign["nonce"]);
      txn = await contract1155.mint(tokenURI, supply, royaltyFee, signStruct, {
        gasLimit: 516883,
        gasPrice: String(gasPrices),
      });
    } else {
      txn = await contract1155.mint(tokenURI, royaltyFee, supply, {
        gasLimit: 516883,
        gasPrice: String(gasPrices),
      });
    }
    console.log(txn);
    var tx = await txn.wait();
    var tokenId = parseInt(tx.events[0].data.slice(0, 66));
    await updateTokenId(tokenId, collectionId, tx.transactionHash);
    return window.collectionMintSuccess(collectionId);
  } catch (err) {
    console.error(err);
    return window.collectionMintFailed(err["message"]);
  }
}


window.deployContract = async function deployContract(
   abi,
  bytecode,
  name,
  symbol,
  contractType,
  collectionId,
  attachment,
  description,
  cover
) {
  let contractDeploy;
  var contractNFT;
  let contractAddress;
  try {
    console.log("enter deployContract");
    if(window.wallet == "walletConnect") {
      var sign = window.provider.getSigner();
    } else {
      var sign = provider.getSigner()
    }
    if (contractType == "nft721") {
      console.log(factoryContractAddressFor721, contractType)
    }
  }catch (err) {
    console.error(err);
    window.contractDeployFailed(err["message"]);
  }
}
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
