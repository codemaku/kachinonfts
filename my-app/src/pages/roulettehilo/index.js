import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  ROULETTE_ABI,
  ROULETTE_ADDRESS,
  KCH_ABI,
  KCH_ADDRESS,
} from "../../../constants/roulettehilo";
import styles from "../../styles/Home.module.css";

export default function Home() {
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
            <div className={styles.description}>Wallet Connected!</div>
          </div>
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
