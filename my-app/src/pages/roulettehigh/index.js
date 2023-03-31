import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Web3Modal from "web3modal";
import {
  abi,
  RANDOM_GAME_NFT_CONTRACT_ADDRESS,
} from "../../../constants/roulettehigh";
import { FETCH_CREATED_GAME } from "../../../queries/roulettehigh";
import styles from "../../styles/Home.module.css";
import { subgraphQuery } from "../../../utils/roulettehigh";

export default function Home() {
  const zero = BigNumber.from("0");
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // entryFee is the ether required to enter a game
  const [entryFee, setEntryFee] = useState(zero);
  // maxPlayers is the max number of players that can play the game
  const [isHigh, setIsHigh] = useState(0);
  // Keep a track of all the logs for a given game
  const [logs, setLogs] = useState([]);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // Keeps track of the ether balance in the contract
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);

  // This is used to force react to re render the page when we want to
  // in our case we will use force update to show new logs
  const forceUpdate = React.useReducer(() => ({}), {})[1];

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      // get the amount of eth in the user's account
      const provider = await getProviderOrSigner(false);
      const _ethBalanceContract = await getEtherBalance(provider, null, true);
      setEtherBalanceContract(_ethBalanceContract);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Mumbai network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * startGame: Is called by the owner to start the game
   */
  const startGame = async () => {
    try {
      // Get the signer from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const signer = await getProviderOrSigner(true);
      // We connect to the Contract using a signer because we want the owner to
      // sign the transaction
      const randomGameNFTContract = new Contract(
        RANDOM_GAME_NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      setLoading(true);
      // call the startGame function from the contract
      const tx = await randomGameNFTContract.startGame(entryFee, {
        value: entryFee,
      });
      await tx.wait();
      setLoading(false);
      getLogsFromGraph();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getLogsFromGraph = async () => {
    try {
      const _gameArray = await subgraphQuery(FETCH_CREATED_GAME());
      // console.log(_gameArray.gameStarteds[0]);
      // let _logs = [];
      setLogs(_gameArray);
      forceUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * getEtherBalance: Retrieves the ether balance of the user or the contract
   */
  const getEtherBalance = async (provider, address, contract = false) => {
    try {
      // If the caller has set the `contract` boolean to true, retrieve the balance of
      // ether in the `exchange contract`, if it is set to false, retrieve the balance
      // of the user's address
      if (contract) {
        const balance = await provider.getBalance(
          RANDOM_GAME_NFT_CONTRACT_ADDRESS
        );
        return balance;
      } else {
        const balance = await provider.getBalance(address);
        return balance;
      }
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getLogsFromGraph();
    }
  }, [walletConnected]);

  /*
    renderButton: Returns a button based on the state of the dapp
  */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Rolling...</button>;
    }
    return (
      <div>
        <input
          type="number"
          className={styles.input}
          onChange={(e) => {
            // The user will enter the value in ether, we will need to convert
            // it to WEI using parseEther
            setEntryFee(
              e.target.value >= 0
                ? utils.parseEther(e.target.value.toString())
                : zero
            );
          }}
          placeholder="Bet amount (ETH)"
        />
        <button className={styles.button} onClick={startGame}>
          Roll da ball 🚀
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Kachino Roulette High</title>
        <meta name="description" content="kachino-roulette" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Kachino Roulette High</h1>
          <div className={styles.description}>
            Its a simplified roulette game where you can bet on high ie 19-36.
            ProTip: dont bet more than Dealer's ETH.
            <br />
            <br />
            {utils.formatEther(etherBalanceContract)} Dealer ETH Balance
          </div>

          {renderButton()}
          {logs.gameStarteds?.map((log, index) => (
            <div className={styles.log} key={index}>
              Id{")"} {log.gameId} Roll{")"} {log.roll} Bet{")"}
              {utils.formatEther(log.entryFee)} ETH
            </div>
          ))}
        </div>
        <div>
          <img className={styles.image} src="./cards.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        <Link href=".">Back to Home</Link>
      </footer>
    </div>
  );
}