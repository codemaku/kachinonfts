import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Web3Modal from "web3modal";
import {
  abi,
  RANDOM_GAME_NFT_CONTRACT_ADDRESS,
} from "../../../constants/roulettehigh2step";
import {
  FETCH_CREATED_GAME,
  FETCH_PLAYERS_GAME,
  FETCH_RESULT_GAME,
} from "../../../queries/roulettehigh2step";
import styles from "../../styles/Home.module.css";
import { subgraphQuery } from "../../../utils/roulettehigh2step";

export default function Home() {
  const zero = BigNumber.from("0");
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // boolean to keep track of whether the current connected account is owner or not
  const [isOwner, setIsOwner] = useState(false);
  // entryFee is the ether required to enter a game
  const [entryFee, setEntryFee] = useState(zero);
  // maxPlayers is the max number of players that can play the game
  const [maxPlayers, setMaxPlayers] = useState(0);
  // Checks if a game started or not
  const [gameStarted, setGameStarted] = useState(false);
  // current block
  const [currentBlock, setCurrentBlock] = useState(false);
  // current bet block
  const [betBlock, setBetBlock] = useState(false);
  // Players that joined the game
  const [players, setPlayers] = useState([]);
  // Winner of the game
  const [winner, setWinner] = useState();
  // Keep a track of all the logs for a given game
  const [createdLogs, setCreatedLogs] = useState([]);
  const [playerLogs, setPlayersLogs] = useState([]);
  const [resultLogs, setResultLogs] = useState([]);
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

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
      const tx = await randomGameNFTContract.startGame();
      await tx.wait();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const resolveGame = async () => {
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
      const tx = await randomGameNFTContract.resolveGame();
      await tx.wait();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  /**
   * startGame: Is called by a player to join the game
   */
  const joinGame = async () => {
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
      const tx = await randomGameNFTContract.joinGame(entryFee, {
        value: entryFee,
      });
      await tx.wait();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  /**
   * checkIfGameStarted checks if the game has started or not and intializes the logs
   * for the game
   */
  const checkIfGameStarted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const randomGameNFTContract = new Contract(
        RANDOM_GAME_NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // read the gameStarted boolean from the contract
      const _gameStarted = await randomGameNFTContract.gameStarted();
      setGameStarted(_gameStarted);
      const _betBlock = await randomGameNFTContract.gameBlock();
      setBetBlock(utils.formatEther(_betBlock) * 10 ** 18);
      const _currentBlock = await provider.getBlockNumber();
      setCurrentBlock(_currentBlock);

      const _createdArray = await subgraphQuery(FETCH_CREATED_GAME());
      const _playersArray = await subgraphQuery(FETCH_PLAYERS_GAME());
      const _resultArray = await subgraphQuery(FETCH_RESULT_GAME());

      setCreatedLogs(_createdArray);
      setPlayersLogs(_playersArray);
      setResultLogs(_resultArray);

      forceUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const randomGameNFTContract = new Contract(
        RANDOM_GAME_NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call the owner function from the contract
      const _owner = await randomGameNFTContract.owner();
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
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
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getOwner();
      checkIfGameStarted();
      setInterval(() => {
        checkIfGameStarted();
      }, 2000);
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
      return <button className={styles.button}>Loading...</button>;
    }
    // Render when the game has started
    if (gameStarted) {
      if (betBlock <= currentBlock) {
        return (
          <button className={styles.button} onClick={resolveGame}>
            Resolve Game
          </button>
        );
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
            placeholder="Bet Amount (ETH)"
          />
          <button className={styles.button} onClick={joinGame}>
            Join Game 🚀
          </button>
        </div>
      );
    }
    // Start the game
    if (!gameStarted) {
      return (
        <div>
          <button className={styles.button} onClick={startGame}>
            Start Game 🚀
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Kachino Roulette High 2 Step</title>
        <meta name="description" content="kachino-roulette-2-step" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Kachino Roulette High 2 Step</h1>
          <div className={styles.description}>
            Its a simplified roulette game where you can bet on high ie 19-36.
          </div>
          <div className={styles.description}>
            2 step game commit and reveal process to prevent HAXORs
          </div>
          <div className={styles.description}>
            Protip: dont bet more than the Dealers bankroll.
          </div>
          <div>
            <br />
            <br />
            {utils.formatEther(etherBalanceContract)} Dealer ETH Balance
            <br />
            <br />
            {currentBlock} current block
            <br />
            {betBlock} bet block
            <br />
          </div>

          {renderButton()}

          <div className={styles.description}>Created Games</div>
          {createdLogs.gameStarteds?.map((log, index) => (
            <div className={styles.log} key={index}>
              Id{")"} {log.gameId} GameBlock{")"} {log.gameBlock}
            </div>
          ))}
          <div className={styles.description}>Players Joined</div>
          {playerLogs.playerJoineds?.map((log, index) => (
            <div className={styles.log} key={index}>
              Id{")"} {log.gameId} Bet Amount{")"}{" "}
              {utils.formatEther(log.betAmount)} ETH
            </div>
          ))}
          <div className={styles.description}>Game Results</div>
          {resultLogs.gameEndeds?.map((log, index) => (
            <div className={styles.log} key={index}>
              Id{")"} {log.gameId} GameBlock{")"} {log.gameBlock} Roll{")"}{" "}
              {log.roll}
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
