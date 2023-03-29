import { BigNumber, Contract, providers, utils, constants } from "ethers";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  ROULETTE_ABI,
  ROULETTE_ADDRESS,
} from "../../../constants/roulettehilo";
import styles from "../../styles/Home.module.css";

export default function Home() {
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * bet High
   */
  const betHigh = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const rouletteContract = new Contract(
        ROULETTE_ADDRESS,
        ROULETTE_ABI,
        signer
      );
      // call the mint from the contract to mint the Crypto Dev
      const tx = await rouletteContract.rollHigh(utils.parseEther("0.01"), {
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);

      rouletteContract.on("NewRoll", (roll, result) => {
        console.log(roll, result);
      });
      window.alert("You successfully placed a bet!");
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
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

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffects are used to react to changes in state of the website
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
  };

  return (
    <div>
      <Head>
        <title>Kachino Roulette Hi Lo</title>
        <meta name="description" content="roulette-hilo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Roulette Hi Lo</h1>
          <div className={styles.description}>
            Guess if the ball will land low (1-18) or high (19-36)!
          </div>
          <div>
            <button className={styles.button} onClick={betHigh}>
              Bet on High
            </button>
            <button className={styles.button} onClick={betHigh}>
              Bet on Low
            </button>
          </div>
          {renderButton()}
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
