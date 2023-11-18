import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const [transactionHistory, setHistory] = useState([]);
  const [transactionCount, setCount] = useState(0);
  const [count, setbalanceCount] = useState(0);


  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async() => {
    if (atm) {
      let tx = await atm.deposit(count);
      await tx.wait()
      getBalance();
      updateHistory("Deposit", count);

    }
  }

  const withdraw = async() => {
    if (atm) {
      let tx = await atm.withdraw(count);
      await tx.wait()
      getBalance();
      updateHistory("Withdrawal", count);
    }
  }

  const withdrawAll = async () => {
    if (atm && balance > 0) {
      let tx = await atm.withdraw(balance);
      await tx.wait();
      getBalance();
      updateHistory("Withdrawal", `-${balance}`);
    }
  }


  const updateHistory = (status, amount) => {

    const transaction = [amount, status];
    const transacTemp = transactionHistory;
    transacTemp.push(transaction);
    setHistory(transacTemp);

    const transacCount = transactionCount + 1;
    setCount(transacCount);
  };


  const showTransactionHistory = () => {
    if (transactionHistory.length === 0) {
      return <p>No transaction history available this session.</p>;
    } else {
      return (
        <div>
        <h2>Transaction History</h2>
        {transactionHistory.map((transaction, index) => (
          <div key={index}>
            <p>{transaction[1]}</p>
            <p>{transaction[0]} ETH</p>
            <br />
          </div>
        ))}
      </div>
      );
    }
  };


  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>Set Value for Deposit and Withdrawal:</p>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Amount for Deposit and Withdrawal:"
          value={count}
          onChange={(e) => setbalanceCount(e.target.value)}
          
        />
        <br></br>
        <br></br>
        <button onClick={deposit}>Deposit ETH</button>
        <button onClick={withdraw}>Withdraw ETH</button>
        <button onClick={withdrawAll}>Withdraw All</button>
        {showTransactionHistory()}
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Andre ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 20px;
          width: 100%;
          height: 100vh;
          border-style: dotted;
          border-color: blue;
          background-color: #34ebc6;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          display: flex;
        }
      `}
      </style>
    </main>
  )
}
