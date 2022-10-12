import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
import { ethers } from "ethers";
import {
  CreateUserSession,
  DestroyUserSession,
  GetAccounts,
  GetInfuraId,
  LoadWeb3,
} from "./web3";

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
        Destroy Session Api
      </button>
    </div>
  );
}

export default App;
