import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../../constants/nft";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Kachino</title>
        <meta name="description" content="kachino-home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Kachino!</h1>
          <div className={styles.description}>Its a decentralised casino!</div>
          <Link className={styles.link} href="whitelist">
            Whitelist
          </Link>
          <Link className={styles.link} href="nft">
            Mint NFT
          </Link>
          <Link className={styles.link} href="ico">
            ICO
          </Link>
          <Link className={styles.link} href="cashier">
            Cashier
          </Link>
          <Link className={styles.link} href="lotto">
            Lotto
          </Link>
          <Link className={styles.link} href="roulettehigh">
            Roulette High
          </Link>
          <Link className={styles.link} href="roulettehigh2step">
            Roulette H 2 Step
          </Link>
          <Link className={styles.link} href="bacarat">
            Bacarat
          </Link>
        </div>
        <div>
          <img className={styles.image} src="./cards.svg" />
        </div>
      </div>
      <footer className={styles.footer}>Made with &#10084; by Kachino</footer>
    </div>
  );
}
