import Web3 from "web3";
// import axios from "axios";
import { ethers } from "ethers";
import { isCompositeComponent } from "react-dom/test-utils";
import WalletConnectProvider from "@walletconnect/web3-provider";
const tokenURIPrefix = process.env.REACT_APP_TOKENURIPREFIX;
const transferProxyContractAddress =
  process.env.REACT_APP_TRANSFERPROXYCONTRACTADDRESS;
const wethAddress = process.env.REACT_APP_WETHADDRESS;
const tradeContractAddress = process.env.REACT_APP_TRADECONTRACTADDRESS;
const tradeProxyContractAddress =
  process.env.REACT_APP_TRADEPROXYCONTRACTADDRESS;
const sessionAddress = GetAccounts();
let walletConnect;
// const sessionWallet =         // session_controller.rb --> :10
const chainId = process.env.REACT_APP_CHAIN_ID;
const rpcUrl = process.env.REACT_APP_ETHEREUM_PROVIDER; // rpc = rpcUrl
const factoryContractAddressFor721 =
  process.env.REACT_APP_FACTORYCONTRACTADDRESSFOR721;
const factoryContractAddressFor1155 =
  process.env.REACT_APP_FACTORYCONTRACTADDRESSFOR1155;
const deprecatedTransferProxyContractAddress =
  process.env.REACT_APP_DEPRECATEDTRANSFERPROXYCONTRACTADDRESS;
const primaryAccount = process.env.REACT_APP_PRIMARY_ACCOUNT_ADDRESS;
const primaryAccountPrivateKey =
  process.env.REACT_APP_PRIMARY_ACCOUNT_PRIVATE_KEY;
let signer;
let provider;
let tprovider;

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
    provider = new ethers.providers.Web3Provider(window.ethereum); //open popup
    signer = provider.getSigner();
    await window.ethereum.request({ method: "eth_requestAccounts" }); //open popup
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
  console.log("Name", process.env.REACT_APP_APP_NAME);
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

/** Storing the metamask address to database in users table */
const LoadAddress = async () => {
  let signer_address = await LoadWeb3();
  console.log("Signer", signer_address);
  var myHeaders = new Headers();
  // myHeaders.append("following", "84561564");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    address: signer_address,
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
 * It will use during bidding
 */
// async function checkDepricatedStatus() {
//   try {
//     var contractAddress = gon.collection_data["contract_address"];
//     var type = gon.collection_data["contract_type"];
//     var sharedCollection = gon.collection_data["contract_shared"];
//     var account = gon.collection_data["owner_address"];
//     const contract = await fetchContract(
//       contractAddress,
//       type,
//       sharedCollection
//     );
//     var status = await contract.isApprovedForAll(
//       account,
//       deprecatedTransferProxyContractAddress
//     );
//     var status2 = await contract.isApprovedForAll(
//       account,
//       transferProxyContractAddress
//     );
//     depricated_status = status && !status2;
//     console.log(depricated_status);
//   } catch (err) {
//     console.error(err.message);
//   }
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
  try {
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
};

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
    if (window.wallet == "walletConnect") {
      var sign = window.provider.getSigner();
    } else {
      var sign = provider.getSigner();
    }
    if (contractType == "nft721") {
      console.log(factoryContractAddressFor721, contractType);
      contractNFT = await new ethers.Contract(
        factoryContractAddressFor721,
        abi,
        provider
      );
    } else if (contractType == "nft1155") {
      contractNFT = await new ethers.Contract(
        factoryContractAddressFor1155,
        abi,
        provider
      );
    }
    contractDeploy = contractNFT.connect(sign);
    var account = await getCurrentAccount();
    var salt = getRandom(account);
    var contract = await contractDeploy.deploy(
      salt,
      name,
      symbol,
      tokenURIPrefix,
      transferProxyContractAddress
    );
    var receipt = await contract.wait()
    console.log("Contract was deployed at the following address:");
    contractAddress = receipt.events[2].args["contractAddress"];
    console.log(contractAddress);
    // $("#nft_contract_address").val(contractAddress);       // web3.js --> :1271
    let formData = new FormData();
    formData.append("file", attachment);
    formData.append("name", name);
    formData.append("symbol", symbol);
    formData.append("contract_address", contractAddress);
    formData.append("contract_type", contractType);
    formData.append("collection_id", collectionId);
    formData.append("description", description);
    formData.append("cover", cover);
    CreateContract(formdata);
    window.contractDeploySuccess(contractAddress, contractType);
  } catch (err) {
    console.error(err);
    window.contractDeployFailed(err["message"]);
  }
};


window.approveNFT = async function approveNFT(
  contractType,
  contractAddress,
  sharedCollection,
  sendBackTo = "collection",
  existingToken = null
) {
  try {
    console.log("Enter approveNFT");
    console.log(contractAddress, contractType, sharedCollection);
    var account = getCurrentAccount();
    const contractapp = await fetchContract(
      contractAddress,
      contractType,
      sharedCollection
    );
    await checkDepricatedStatus();
    var isApproved = await contractapp.isApprovedForAll(
      account,
      transferProxyContractAddress
    );
    if (!isApproved) {
      var receipt = await contractapp.setApprovalForAll(
        transferProxyContractAddress,
        true,
        { from: account }
      );
      receipt = await receipt.wait();
    }
    console.log("--step-1");
    if (sendBackTo == "executeBid") {
      console.log("--step-2");

      return window.approveBidSuccess();
    } else {
      console.log("--step-3");
      return window.collectionApproveSuccess(contractType, existingToken);
    }
  } catch (err) {
    console.error(err);
    if (sendBackTo == "executeBid") {
      return window.approveBidFailed(err["message"]);
    } else {
      return window.collectionApproveFailed(err["message"]);
    }
  }
};

window.approveResaleNFT = async function approveResaleNFT(
  contractType,
  contractAddress,
  sharedCollection
) {
  try {
    console.log("Enter approveResaleNFT");
    console.log(contractAddress, contractType, sharedCollection);
    var account = getCurrentAccount();
    const resalenft = await fetchContract(
      contractAddress,
      contractType,
      sharedCollection
    );
    var isApproved = await resalenft.isApprovedForAll(
      account,
      transferProxyContractAddress
    );
    if (!isApproved) {
      var receipt = await resalenft.setApprovalForAll(
        transferProxyContractAddress,
        true,
        { from: account }
      );
      receipt = await receipt.wait();
    }
    return window.approveResaleSuccess(contractType);
  } catch (err) {
    console.error(err);
    return window.approveResaleFailed(err["message"]);
  }
};

window.fetchContract = async function fetchContract(
  contractAddress,
  type,
  shared = true
) {
  console.log(contractAddress, type, shared);
  var compiledContractDetails = getContractABIAndBytecode(
    contractAddress,
    type,
    shared
  );
  var abi = compiledContractDetails["compiled_contract_details"]["abi"];
  if (window.wallet == "walletConnect") {
    var obj = new ethers.Contract(contractAddress, abi, window.provider);
    var connection = obj.connect(window.signer);
  } else {
    var obj = new ethers.Contract(contractAddress, abi, provider);
    var connection = obj.connect(signer);
  }
  return connection;
};

//TODO: OPTIMIZE
window.isApprovedNFT = async function isApprovedNFT(
  contractType,
  contractAddress
) {
  try {
    console.log("enter isApprovedNFT");
    const approvednft = await fetchContract(
      contractAddress,
      contractType,
      sharedCollection
    );
    var account = await getaccounts();
    var isApproved = await approvednft.isApprovedForAll(
      account,
      transferProxyContractAddress
    );
    return isApproved;
  } catch (err) {
    console.error(err);
  }
};

window.burnNFT = async function burnNFT(
  contractType,
  contractAddress,
  tokenId,
  supply = 1,
  collectionId,
  sharedCollection
) {
  try {
    const burnnft = await fetchContract(
      contractAddress,
      contractType,
      sharedCollection
    );
    var account = await getaccounts();
    var receipt;
    if (contractType == "nft721") {
      receipt = await burnnft.burn(tokenId, { from: account });
    } else if (contractType == "nft1155") {
      receipt = await burnnft.burn(tokenId, supply, { from: account });
    }
    receipt = await receipt.wait();
    await updateBurn(collectionId, receipt.transactionHash, supply);
    return window.burnSuccess(receipt.transactionHash);
  } catch (err) {
    console.error(err);
    return window.burnFailed(err["message"]);
  }
};

window.directTransferNFT = async function directTransferNFT(
  contractType,
  contractAddress,
  recipientAddress,
  tokenId,
  supply = 1,
  shared,
  collectionId
) {
  try {
    console.log(
      "Enter directTransferNFT =>" + contractType,
      contractAddress,
      recipientAddress,
      tokenId,
      supply,
      shared,
      collectionId
    );
    const transfernft = await fetchContract(
      contractAddress,
      contractType,
      "true"
    );
    var account = getCurrentAccount();
    var receipt;
    if (contractType == "nft721") {
      receipt = await transfernft["safeTransferFrom(address,address,uint256)"](
        account,
        recipientAddress,
        tokenId
      );
    } else if (contractType == "nft1155") {
      // TODO: Analyse and use proper one in future
      var tempData =
        "0x6d6168616d000000000000000000000000000000000000000000000000000000";
      receipt = await transfernft[
        "safeTransferFrom(address,address,uint256,uint256,bytes)"
      ](account, recipientAddress, tokenId, supply, tempData);
    } else if (contractType == "nft1155") {
    }
    receipt = await receipt.wait();
    await updateOwnerTransfer(
      collectionId,
      recipientAddress,
      receipt.transactionHash,
      supply
    );
    return window.directTransferSuccess(receipt.transactionHash, collectionId);
  } catch (err) {
    console.error(err);
    return window.directTransferFailed(err["message"]);
  }
};

/** Fetch shared? */
const Shared_condition = (address_) => {
  var shared_or_not;
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    address : address_
  });
  var config = {
    method: "GET",
    headers: myHeaders,
    body: raw,
  };
  return fetch(`http://192.168.20.212:4000/contract`, config)
    .then(async (data) => {
      console.log(data);
      shared_or_not = data["symbol"];
      return shared_or_not == "Shared";
    })
    .catch((err) => console.log(" Failed", err));
}

window.approveERC20 = async function approveERC20(
  contractAddress,
  contractType,
  amount,
  decimals = 18,
  sendBackTo = "Bid"
) {
  try {
    console.log(
      "Enter approveERC20:" + contractAddress,
      contractType

      /** table=>collections */
      // gon.collection_data["contract_shared"]
    );
    amount = roundNumber(mulBy(amount, 10 ** decimals), 0);

    /** function still not created */
    // await checkDepricatedStatus();        
    const approveERC2 = await fetchContract(
      contractAddress,
      contractType

      /** table=>collections */
      // gon.collection_data["contract_shared"]
    );
    //var contract = await new window.web3.eth.Contract(abi, contractAddress);

    /** checkDepricatedStatus returns the below status */
    // var approveAddress = depricated_status
      // ? deprecatedTransferProxyContractAddress
      // : transferProxyContractAddress;
    var account = getCurrentAccount();
    const balance = await approveERC2.allowance(account, approveAddress);
    amount = BigInt(parseInt(balance) + parseInt(amount)).toString();
    var receipt = await approveERC2.approve(approveAddress, amount, {
      from: account,
    });
    receipt = await receipt.wait();
    if (sendBackTo == "Buy") {
      return window.buyApproveSuccess(receipt.transactionHash, contractAddress);
    } else {
      return window.bidApproveSuccess(receipt.transactionHash, contractAddress);
    }
  } catch (err) {
    console.error(err);
    if (sendBackTo == "Buy") {
      return window.buyApproveFailed(err["message"]);
    } else {
      return window.bidApproveFailed(err["message"]);
    }
  }
};

window.approvedTokenBalance = async function approvedTokenBalance(
  contractAddress
) {
  console.log("enter approvedTokenBalance");
  var contract = await fetchContract(contractAddress, "erc20", false);
  var account = await getaccounts();
  var balance = await contract.allowance(account, transferProxyContractAddress);
  return balance;
};

window.convertWETH = async function convertWETH(
  amount,
  sendBackTo = "Bid",
  decimals = 18
) {
  console.log("Enter convertWETH");
  try {
    amount = roundNumber(mulBy(amount, 10 ** decimals), 0);
    var contract = await fetchContract(wethAddress, "erc20");
    var account = getCurrentAccount();
    var receipt = await contract.deposit({ from: account, value: amount });
    receipt = await receipt.wait();
    if (sendBackTo == "Buy") {
      return window.buyConvertSuccess(receipt.transactionHash);
    } else {
      return window.bidConvertSuccess(receipt.transactionHash);
    }
  } catch (err) {
    console.error(err);
    if (sendBackTo == "Buy") {
      return window.bidConvertFailed(err["message"]);
    } else {
      return window.bidConvertFailed(err["message"]);
    }
  }
};

window.updateBuyerServiceFee = async function updateBuyerServiceFee(
  buyerFeePermille
) {
  try {
    console.log("enter updateBuyerServiceFee");
    const contract = await fetchContract(tradeContractAddress, "trade");
    var account = getCurrentAccount();
    var receipt = await contract.setBuyerServiceFee(buyerFeePermille, {
      from: account,
    });
    receipt = await receipt.wait();
    return window.bidConvertSuccess(receipt.transactionHash);
  } catch (err) {
    console.error(err);
    return window.bidConvertFailed(err["message"]);
  }
};

window.updateSellerServiceFee = async function updateSellerServiceFee(
  sellerFeePermille
) {
  try {
    console.log("enter updateSellerServiceFee");
    const contract = await fetchContract(tradeContractAddress, "trade");
    var account = getCurrentAccount();
    var receipt = await contract.setSellerServiceFee(sellerFeePermille, {
      from: account,
    });
    receipt = await receipt.wait();
    return window.bidConvertSuccess(receipt.transactionHash);
  } catch (err) {
    console.error(err);
    return window.bidConvertFailed(err["message"]);
  }
};

window.bidAsset = async function bidAsset(
  assetAddress,
  tokenId,
  qty = 1,
  amount,
  payingTokenAddress,
  decimals = 18,
  collectionId,
  bidPayAmt
) {
  try {
    console.log("enter bidAsset");
    var amountInDec = roundNumber(mulBy(amount, 10 ** decimals), 0);
    console.log(amountInDec);
    var nonce_value = await getNonceValue(collectionId);
    if (payingTokenAddress === null || payingTokenAddress === undefined) {
      payingTokenAddress = wethAddress;
    }
    if (decimals === null || decimals === undefined) {
      decimals = 18;
    }
    //var messageHash = window.web3.utils.soliditySha3(assetAddress, tokenId, payingTokenAddress, amountInDec, qty, nonce_value);
    var messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "address", "uint256", "uint256", "uint256"],
      [assetAddress, tokenId, payingTokenAddress, amountInDec, qty, nonce_value]
    );
    var account = getCurrentAccount();
    messageHash = ethers.utils.arrayify(messageHash);
    if (window.wallet == "walletConnect") {
      const signer = window.provider.getSigner();
      var signature = await signer.signMessage(messageHash);
    } else {
      var signature = await signer.signMessage(messageHash);
    }
    //const signature = await window.web3.eth.personal.sign(messageHash, account);
    await placeBid(collectionId, signature, qty, {
      asset_address: assetAddress,
      token_id: tokenId,
      quantity: qty,
      amount: bidPayAmt,
      amount_with_fee: amount,
      payment_token_address: payingTokenAddress,
      payment_token_decimals: decimals,
    });
    await save_NonceValue(collectionId, signature, nonce_value);
    return window.bidSignSuccess(collectionId);
  } catch (err) {
    console.error(err);
    return window.bidSignFailed(err["message"]);
  }
};

window.signMessage = async function signMessage(msg) {
  try {
    console.log("enter signMessage");
    var account = getCurrentAccount();
    if (window.wallet == "walletConnect") {
      const signer = window.provider.getSigner();
      var sign = signer.signMessage(msg);
    } else {
      var sign = signer.signMessage(msg);
    }
    return sign;
  } catch (err) {
    console.log(err);
    return "";
  }
};

window.signSellOrder = async function signSellOrder(
  amount,
  decimals,
  paymentAssetAddress,
  tokenId,
  assetAddress,
  collectionId,
  sendBackTo = ""
) {
  try {
    amount = roundNumber(mulBy(amount, 10 ** decimals), 0);
    var nonce_value = await getNonceValue(collectionId);
    var messageHash;
    messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "address", "uint256", "uint256"],
      [assetAddress, tokenId, paymentAssetAddress, amount, nonce_value]
    );
    messageHash = ethers.utils.arrayify(messageHash);
    var account = getCurrentAccount();
    if (window.wallet == "walletConnect") {
      const signer = window.provider.getSigner();
      var fixedPriceSignature = await signer.signMessage(messageHash, account);
    } else {
      var fixedPriceSignature = await signer.signMessage(messageHash, account);
    }
    await updateSignature(collectionId, fixedPriceSignature);
    await save_NonceValue(collectionId, fixedPriceSignature, nonce_value);
    if (sendBackTo == "update") {
      return window.updateSignFixedSuccess(collectionId);
    } else {
      return window.bidSignFixedSuccess(collectionId);
    }
  } catch (err) {
    console.error(err);
    if (sendBackTo == "update") {
      return window.updateSignFixedFailed(err["message"]);
    } else {
      return window.bidSignFixedFailed(err["message"], collectionId);
    }
  }
};

// buyingAssetType = 1 # 721
// buyingAssetType = 0 # 1155
window.buyAsset = async function buyAsset(
  assetOwner,
  buyingAssetType,
  buyingAssetAddress,
  tokenId,
  unitPrice,
  buyingAssetQty,
  paymentAmt,
  paymentAssetAddress,
  decimals,
  sellerSign,
  collectionId,
  isEthPayment = false
) {
  try {
    isEthPayment = isEthPayment === true;
    var isErc20Payment = isEthPayment === false;
    if (isEthPayment) {
      paymentAssetAddress = "0x0000000000000000000000000000000000000000";
      paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** 18), 0);
      unitPrice = roundNumber(mulBy(unitPrice, 10 ** 18), 0);
    } else {
      paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
      unitPrice = roundNumber(mulBy(unitPrice, 10 ** decimals), 0);
    }
    var contract = await fetchContract(tradeContractAddress, "trade");
    var nonce_value = await getContractSignNonce(collectionId, sellerSign);
    var account = getCurrentAccount();
    var supply = 0;
    var tokenURI = "abcde";
    var royaltyFee = 0;
    var orderStruct = [
      assetOwner,
      account,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty,
      depricated_status,
      isErc20Payment,
    ];
    var gasPrices = await gasPrice();
    if (!isEthPayment) {
      var receipt = await contract.buyAsset(
        orderStruct,
        gon.collection_data["imported"],
        splitSign(sellerSign, nonce_value),
        { from: account, gasLimit: 516883, gasPrice: String(gasPrices) }
      );
    } else {
      var receipt = await contract.buyAssetWithEth(
        orderStruct,
        gon.collection_data["imported"],
        splitSign(sellerSign, nonce_value),
        {
          from: account,
          gasLimit: 516883,
          gasPrice: String(gasPrices),
          value: paymentAmt,
        }
      );
    }
    receipt = await receipt.wait();
    await updateCollectionBuy(
      collectionId,
      buyingAssetQty,
      receipt.transactionHash
    );
    return window.buyPurchaseSuccess(collectionId);
  } catch (err) {
    console.log(err);
    if (!isEthPayment) {
      return window.buyPurchaseFailed(err["message"]);
    } else {
      return window.buyWithEthPurchaseFailed(err["message"]);
    }
  }
};

window.buyAndTransferAsset = async function buyAndTransferAsset(
  assetOwner,
  buyingAssetType,
  buyingAssetAddress,
  tokenId,
  unitPrice,
  buyingAssetQty,
  paymentAmt,
  paymentAssetAddress,
  decimals,
  sellerSign,
  collectionId,
  isEthPayment = false
) {
  try {
    isEthPayment = isEthPayment === true;
    var isErc20Payment = isEthPayment === false;
    if (isEthPayment) {
      paymentAssetAddress = "0x0000000000000000000000000000000000000000";
      paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** 18), 0);
      unitPrice = roundNumber(mulBy(unitPrice, 10 ** 18), 0);
    } else {
      paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
      unitPrice = roundNumber(mulBy(unitPrice, 10 ** decimals), 0);
    }
    const signer = new ethers.Wallet(primaryAccountPrivateKey, provider);
    const _trade_proxy = await fetchContract(
      tradeProxyContractAddress,
      "trade_proxy"
    );
    const buyer = await getCurrentAccount();
    var nonce_value = await getContractSignNonce(collectionId, sellerSign);
    var supply = 0;
    var tokenURI = "abcde";
    var royaltyFee = 0;
    var orderStruct = [
      assetOwner,
      buyer,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty,
      depricated_status,
      isErc20Payment,
    ];
    var signStruct = splitSign(sellerSign, nonce_value);
    var imported = gon.collection_data["imported"];
    const nonce = await web3.eth.getTransactionCount(primaryAccount, "latest");
    var gasPrices = await gasPrice();
    var ownerSign = await sign_metadata_with_creator(
      assetOwner,
      tokenURI,
      collectionId
    );
    const ownerSignStruct = splitSign(
      ownerSign["signature"],
      ownerSign["nonce"]
    );
    const tx = {
      from: primaryAccount,
      nonce: nonce,
      gasLimit: 516883,
      gasPrice: String(gasPrices),
    };
    var transaction = await _trade_proxy
      .connect(signer)
      ._buyAndTransferAsset(
        orderStruct,
        ownerSignStruct,
        imported,
        signStruct,
        tx
      );
    await transaction.wait();
    var receipt = await provider.getTransactionReceipt(transaction["hash"]);
    if (receipt["status"] == 1) {
      console.log("The hash of your transaction is: ", transaction["hash"]);
      console.log("Updating the collection");
      updateCollectionBuy(collectionId, buyingAssetQty, transaction["hash"]);
      return window.buyPurchaseSuccess(collectionId);
    } else {
      console.log(
        "Something went wrong when submitting your transaction:",
        err
      );
      $.magnificPopup.close();
      $(".loading-gif").hide();
      return window.buyPurchaseFailed("Transaction failed!");
    }
  } catch (err) {
    console.log(err);
    $.magnificPopup.close();
    $(".loading-gif").hide();
    return window.buyPurchaseFailed(err["message"]);
  }
};

window.MintAndTransferAsset = async function MintAndTransferAsset(
  assetOwner,
  buyingAssetType,
  buyingAssetAddress,
  tokenId,
  unitPrice,
  buyingAssetQty,
  paymentAmt,
  paymentAssetAddress,
  decimals,
  sellerSign,
  collectionId,
  tokenURI,
  royaltyFee,
  sharedCollection,
  supply,
  isEthPayment = false
) {
  try {
    isEthPayment = isEthPayment === true;
    var isErc20Payment = isEthPayment === false;
    if (isEthPayment) {
      paymentAssetAddress = "0x0000000000000000000000000000000000000000";
      paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** 18), 0);
      unitPrice = roundNumber(mulBy(unitPrice, 10 ** 18), 0);
    } else {
      paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
      unitPrice = roundNumber(mulBy(unitPrice, 10 ** decimals), 0);
    }
    const signer = new ethers.Wallet(primaryAccountPrivateKey, provider);
    const _trade_proxy = await fetchContract(
      tradeProxyContractAddress,
      "trade_proxy"
    );
    const nonce = await web3.eth.getTransactionCount(primaryAccount, "latest");
    var buyingAssetType = buyingAssetType + 2; // BuyAssetType -> 3: Lazy721 , 2: Lazy1155, 1:721, 0: 1155
    var nonce_value = await getContractSignNonce(collectionId, sellerSign);
    var buyer = getCurrentAccount();
    var orderStruct = [
      assetOwner,
      buyer,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty,
      depricated_status,
      isErc20Payment,
    ];
    var gasPrices = await gasPrice();
    var ownerSign = await sign_metadata_with_creator(
      assetOwner,
      tokenURI,
      collectionId
    );
    const ownerSignStruct = splitSign(
      ownerSign["signature"],
      ownerSign["nonce"]
    );
    const sellerSignStruct = splitSign(sellerSign, nonce_value);
    const tx = {
      from: primaryAccount,
      nonce: nonce,
      gasLimit: 616883,
      gasPrice: String(gasPrices),
    };
    var transaction = await _trade_proxy
      .connect(signer)
      ._mintAndTransferAsset(
        orderStruct,
        ownerSignStruct,
        sellerSignStruct,
        sharedCollection,
        tx
      );
    await transaction.wait();
    var receipt = await provider.getTransactionReceipt(transaction["hash"]);
    if (receipt["status"] == 1) {
      console.log("The hash of your transaction is: ", transaction["hash"]);
      var responseToken;
      if (buyingAssetType == 3) {
        responseToken = receipt.logs[3].topics[3];
        var tokenId = parseInt(responseToken);
      } else if (buyingAssetType === 2) {
        var tokenId = parseInt(receipt.logs[2].topics[1]);
      } else {
        if (receipt.events) {
          responseToken = receipt.events[0].data.slice(0, 66);
          var tokenId = parseInt(responseToken);
        }
      }
      await updateCollectionBuy(
        collectionId,
        buyingAssetQty,
        receipt.transactionHash,
        tokenId
      );
      return window.buyPurchaseSuccess(collectionId);
    } else {
      console.log(
        "Something went wrong when submitting your transaction:",
        err
      );
      $.magnificPopup.close();
      $(".loading-gif").hide();
      return window.buyPurchaseFailed(
        "Something went wrong when submitting your transaction!"
      );
    }
  } catch (err) {
    console.error(err);
    $.magnificPopup.close();
    $(".loading-gif").hide();
    return window.buyMintAndPurchaseFailed(err["message"]);
  }
};

window.MintAndBuyAsset = async function MintAndBuyAsset(
  assetOwner,
  buyingAssetType,
  buyingAssetAddress,
  tokenId,
  unitPrice,
  buyingAssetQty,
  paymentAmt,
  paymentAssetAddress,
  decimals,
  sellerSign,
  collectionId,
  tokenURI,
  royaltyFee,
  sharedCollection,
  supply,
  isEthPayment = false
) {
  try {
    console.log("Enter MintAndBuyAsset");
    isEthPayment = isEthPayment === true;
    var isErc20Payment = isEthPayment === false;
    if (isEthPayment) {
      paymentAssetAddress = "0x0000000000000000000000000000000000000000";
      paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** 18), 0);
      unitPrice = roundNumber(mulBy(unitPrice, 10 ** 18), 0);
    } else {
      paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
      unitPrice = roundNumber(mulBy(unitPrice, 10 ** decimals), 0);
    }
    var buyingAssetType = buyingAssetType + 2; // BuyAssetType -> 3: Lazy721 , 2: Lazy1155, 1:721, 0: 1155
    var contract = await fetchContract(tradeContractAddress, "trade");
    var nonce_value = await getContractSignNonce(collectionId, sellerSign);
    var account = getCurrentAccount();
    var orderStruct = [
      assetOwner,
      account,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty,
      depricated_status,
      isErc20Payment,
    ];
    // ownerSign -> selleraddress & URI
    var gasPrices = await gasPrice();
    var ownerSign = await sign_metadata_with_creator(
      assetOwner,
      tokenURI,
      collectionId
    );
    console.log("ownerSign" + ownerSign);
    console.log("orderStruct" + orderStruct);
    if (!isEthPayment) {
      var receipt = await contract.mintAndBuyAsset(
        orderStruct,
        splitSign(ownerSign["signature"], ownerSign["nonce"]),
        splitSign(sellerSign, nonce_value),
        sharedCollection,
        { gasLimit: 616883, gasPrice: String(gasPrices) }
      );
    } else {
      var receipt = await contract.mintAndBuyAssetWithEth(
        orderStruct,
        splitSign(ownerSign["signature"], ownerSign["nonce"]),
        splitSign(sellerSign, nonce_value),
        sharedCollection,
        { gasLimit: 616883, gasPrice: String(gasPrices), value: paymentAmt }
      );
    }
    receipt = await receipt.wait();
    console.log("--------step -1-----");
    var responseToken;
    if (buyingAssetType == 3) {
      responseToken = receipt.logs[3].topics[3];
    } else {
      responseToken = receipt.events[0].data.slice(0, 66);
    }
    var tokenId = parseInt(responseToken);
    console.log("--------step -2-----tokenId " + tokenId);
    await updateCollectionBuy(
      collectionId,
      buyingAssetQty,
      receipt.transactionHash,
      tokenId
    );
    console.log("--------step -3-----");
    return window.buyPurchaseSuccess(collectionId);
  } catch (err) {
    console.log(err);
    if (!isEthPayment) {
      return window.buyPurchaseFailed(err["message"]);
    } else {
      return window.buyWithEthPurchaseFailed(err["message"]);
    }
  }
};

window.MintAndAcceptBid = async function MintAndAcceptBid(
  buyer,
  buyingAssetType,
  buyingAssetAddress,
  tokenId,
  paymentAmt,
  buyingAssetQty,
  paymentAssetAddress,
  decimals,
  buyerSign,
  collectionId,
  bidId,
  tokenURI,
  royaltyFee,
  sharedCollection,
  supply
) {
  try {
    console.log("Enter MintAndAcceptBid");
    console.log(tokenURI, royaltyFee, sharedCollection);
    if (paymentAssetAddress === undefined || paymentAssetAddress === null) {
      paymentAssetAddress = wethAddress;
      decimals = 18;
    }
    paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
    var unitPrice = 1;
    var buyingAssetType = buyingAssetType + 2; // BuyAssetType -> 3: Lazy721 , 2: Lazy1155, 1:721, 0: 1155
    const contract = await fetchContract(tradeContractAddress, "trade");
    var nonce_value = await getContractSignNonce(collectionId, buyerSign);
    var account = getCurrentAccount();
    //token ID calculating
    window.contract721 = await getContract(
      buyingAssetAddress,
      "nft721",
      sharedCollection
    );
    var orderStruct = [
      account,
      buyer,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty,
      depricated_status,
      true,
    ];
    var gasPrices = await gasPrice();
    // ownerSign -> selleraddress & URI
    var ownerSign = await sign_metadata_with_creator(
      account,
      tokenURI,
      collectionId
    );
    await saveContractNonceValue(collectionId, ownerSign);
    console.log(ownerSign);
    var receipt = await contract.mintAndExecuteBid(
      orderStruct,
      splitSign(ownerSign["signature"], ownerSign["nonce"]),
      splitSign(buyerSign, nonce_value),
      sharedCollection,
      { from: account, gasLimit: 616883, gasPrice: String(gasPrices) }
    );
    var tx = await receipt.wait();
    var tokenId = parseInt(tx.logs[0].topics[3]);
    await updateCollectionSell(
      collectionId,
      buyer,
      bidId,
      receipt.transactionHash,
      tokenId
    );
    return window.acceptBidSuccess(collectionId);
  } catch (err) {
    console.error(err);
    return window.acceptBidFailed(err["message"]);
  }
};

// // common method for fetching trade contract
// window.fetchTradeContract = async fetchContract(tradeContractAddress,'trade'){
//     var compiledContractDetails = getContractABIAndBytecode(tradeContractAddress, 'trade');
//     var abi = compiledContractDetails['compiled_contract_details']['abi'];
//     var contractNFT = await new ethers.Contract( tradeContractAddress, abi, provider);
//     var contract = contractNFT.connect(signer);
//     return contract

// }

window.executeBid = async function executeBid(
  buyer,
  buyingAssetType,
  buyingAssetAddress,
  tokenId,
  paymentAmt,
  buyingAssetQty,
  paymentAssetAddress,
  decimals,
  buyerSign,
  collectionId,
  bidId
) {
  try {
    var unitPrice = 1;
    if (paymentAssetAddress === undefined || paymentAssetAddress === null) {
      paymentAssetAddress = wethAddress;
      decimals = 18;
    }
    paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
    const contract = await fetchContract(tradeContractAddress, "trade");
    var nonce_value = await getContractSignNonce(collectionId, buyerSign);
    var account = getCurrentAccount();
    var gasPrices = await gasPrice();
    // supply, tokenURI, royalty needs to be passed but WILL NOT be used by the Contract
    var supply = 0;
    var tokenURI = "abcde";
    var royaltyFee = 0;
    var orderStruct = [
      account,
      buyer,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty,
      depricated_status,
      true,
    ];
    console.log(orderStruct, nonce_value);
    var receipt = await contract.executeBid(
      orderStruct,
      gon.collection_data["imported"],
      splitSign(buyerSign, nonce_value),
      { from: account, gasLimit: 516883, gasPrice: String(gasPrices) }
    );
    receipt = await receipt.wait();
    await updateCollectionSell(
      collectionId,
      buyer,
      bidId,
      receipt.transactionHash
    );
    return window.acceptBidSuccess(collectionId);
  } catch (err) {
    console.error(err);
    return window.acceptBidFailed(err["message"]);
  }
};

function getCurrentAccount() {
  if (window.wallet == "metamask" && window.ethereum.selectedAddress) {
    return window.ethereum.selectedAddress;
  }
  return window.currentAddress ?? sessionAddress;
}

window.ethBalance = async function ethBalance(account = "") {
  var account = await getaccounts();
  if (window.wallet == "metamask") {
    var bal = await signer.getBalance();
  } else {
    const signer = window.provider.getSigner();
    var bal = await signer.getBalance();
  }
  var ethBal = roundNumber(ethers.utils.formatEther(bal), 4);
  return ethBal;
};

window.updateEthBalance = async function updateEthBalance() {
  var ethBal = await window.ethBalance();
  $(".curBalance").html(ethBal + "ETH");
  $(".curEthBalance").text(ethBal);
};

window.tokenBalance = async function tokenBalance(contractAddress, decimals) {
  var abi = [
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];
  var contract;
  if (window.wallet == "walletConnect") {
    contract = new ethers.Contract(contractAddress, abi, window.provider);
  } else if (window.wallet == "metamask") {
    contract = new ethers.Contract(contractAddress, abi, provider);
  }
  var account = await getaccounts();
  var balance = await contract.balanceOf(account);
  var bal = parseInt(balance);
  balance = roundNumber(divBy(bal, 10 ** decimals), 4);
  return balance;
};

window.getNetworkType = async function getNetworkType() {
  if (window.wallet == "metamask") {
    var type = await provider.getNetwork();
  } else {
    var type = await window.provider.getNetwork();
  }
  return type;
};

function showTermsCondition(account, ethBal, networkType) {
  var account = account || getCurrentAccount();
  console.log("showTermsCondition: ", account);
  $.magnificPopup.open({
    closeOnBgClick: false,
    enableEscapeKey: false,
    items: {
      src: "#terms-and-condition",
    },
    type: "inline",
  });
  $("#account").val(account);
  $("#eth_balance_tc").val(ethBal);
  $("#network_type").val(networkType);
}

async function load(shouldDestroySession = false) {
  const account = await loadWeb3();
  window.currentAddress = account;
  const ethBal = await ethBalance(account);
  return createDeleteSession(
    account,
    ethBal,
    shouldDestroySession,
    window.wallet
  );
}

async function createDeleteSession(
  account,
  balance,
  shouldDestroySession,
  wallet
) {
  const networkType = await getNetworkType();
  const isValidUserResp = await isValidUser(account, "", wallet);
  if (isValidUserResp.user_exists) {
    await createUserSession(account, balance, shouldDestroySession, wallet);
    if (shouldDestroySession) {
      // window.location.href = '/'
      location.reload();
    } else {
      return true;
    }
  } else {
    if (gon.session) {
      if (account) {
        await destroySession();
      }
      // window.location.href = '/'
      location.reload();
    } else {
      showTermsCondition(account, balance, networkType);
      return false;
    }
  }
}

window.disconnect = async function disconnect(address) {
  await destroySession();
  window.location.href = "/";
};

async function destroySession() {
  if (gon.session) {
    console.log("IN DESTROY: ", gon.session);
    await destroyUserSession(getCurrentAccount());
    if (window.wallet === "walletConnect") {
      tprovider.disconnect();
    }
  }
}

window.connect = async function connect(wallet = "") {
  if (!wallet) {
    toastr.error("Wallet Required");
    return;
  }
  window.wallet = wallet;
  if (typeof web3 === "undefined" && mobileCheck() && wallet == "metamask") {
    window
      .open(`https://metamask.app.link/dapp/` + location.hostname, "_blank")
      .focus();
    return;
  } else if (typeof web3 !== "undefined") {
    const status = await load();
    if (status) {
      // window.location.href = '/'
      location.reload();
    }
  } else {
    if (typeof web3 == "undefined" && wallet == "walletConnect") {
      const status = await load();
      if (status) {
        // window.location.href = '/';
        location.reload();
      }
    } else {
      toastr.error(
        'Please install Metamask Extension to your browser. <a target="_blank" href="https://metamask.io/download.html">Download Here</a>'
      );
    }
  }
};

window.proceedWithLoad = async function proceedWithLoad() {
  var account = $("#account").val();
  const ethBal = $("#eth_balance").text();
  const networkType = $("#network_type").val();
  if ($("#condition1").is(":checked") && $("#condition2").is(":checked")) {
    await createUserSession(account, ethBal, networkType, window.wallet);
    // window.location.href = '/'
    location.reload();
  } else {
    toastr.error("Please accept the conditions to proceed");
  }
};

window.loadUser = async function loadUser() {
  let address = "";
  if (gon.session) {
    if (
      window.wallet == "walletConnect" &&
      window.web3.currentProvider.connected === false
    ) {
      address = getCurrentAccount();
    }
    if (address) {
      return disconnect();
    }
    load();
  }
};

async function loadAddress() {
  if (sessionWallet) {
    window.wallet = sessionWallet;
  }
  await loadWeb3();
}

$(function () {
  loadAddress();
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", function (acc) {
    if (gon.session) {
      load(true);
    } else {
      window.location.reload();
    }
  });
  window.ethereum.on("chainChanged", function (chainId) {
    if (window.ethereum && gon.session) {
      load(true);
    } else {
      window.location.reload();
    }
  });
}

function gasPrice() {
  var init_gasPrice = "400000000000";
  try {
    var request = $.ajax({
      url: `/gas_price`,
      async: false,
      type: "GET",
    });
    request.done(function (msg) {
      console.log(msg);
      console.log("Get Fastest Value from the API");
      if (msg["gas_price"] != "") {
        init_gasPrice = msg["gas_price"]["fastest"] * 10 ** 8;
      }
    });
    request.fail(function (jqXHR, textStatus) {
      console.log("Failed to get fastest value");
    });
  } catch (err) {
    console.error(err);
  }
  console.log(init_gasPrice);
  return init_gasPrice;
}

window.mobileCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

export {
  LoadWeb3,
  GetAccounts,
  GetInfuraId,
  CreateUserSession,
  DestroyUserSession,
  LoadAddress,
};
