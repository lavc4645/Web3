import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
import { ethers } from "ethers";
import LoadWeb3 from "./web3";

function App() {
  return (
    <div className="App">
      <button className="button" onClick={() => LoadWeb3()}>
        Click me
      </button>
    </div>
  );
}

export default App;
