// import logo from "./logo.svg";

import {
  CreateUserSession,
  DestroyUserSession,
  GetAccounts,
  GetInfuraId,
  LoadAddress,
  LoadWeb3,
  UpdateCollectionSell,
  UpdateTokenId,
} from "./components/web3/index";

// import "./App.css";
// import Web3 from "web3";
// import { ethers } from "ethers";

function App() {
  return (
    <div className="App">
      <button className="button" onClick={() => LoadWeb3()}>
        Connect
      </button>
      <button className="button" onClick={() => GetAccounts()}>
        Get address
      </button>
      <button className="button" onClick={() => GetInfuraId()}>
        Infura Id
      </button>
      <button className="button" onClick={() => CreateUserSession()}>
        Create Session Api
      </button>
      <button className="button" onClick={() => DestroyUserSession()}>
        DestroyUserSession
      </button>
      <button className="button" onClick={() => LoadAddress()}>
        store Add
      </button>
      <button className="button" onClick={() => UpdateCollectionSell()}>
        UpdateCollectionSell
      </button>
      <button className="button" onClick={() => UpdateTokenId()}>
        UpdateTokenId
      </button>
    </div>
  );
}

export default App;
