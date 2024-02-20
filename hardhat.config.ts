import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "hardhat-abi-exporter";

import dotenv from "dotenv";
dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      accounts: {
        mnemonic:
          "burger broccoli appear involve admit own next member begin direct flee host seven game hat",
      },
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
    },
    "blast-sepolia": {
      url: "https://sepolia.blast.io",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 168587773,
    },
    manta: {
      url: "https://pacific-rpc.manta.network/http",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  abiExporter: {
    path: "abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  etherscan: {
    apiKey: {
      "blast-sepolia": "test",
      manta: process.env.ETHERSCAN_KEY || "",
    },
    customChains: [
      {
        network: "blast-sepolia",
        chainId: 168587773,
        urls: {
          apiURL:
            "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan",
          browserURL: "https://testnet.blastscan.io",
        },
      },
      {
        network: "manta",
        chainId: 169,
        urls: {
          apiURL: "https://pacific-explorer.manta.network/api",
          browserURL: "https://pacific-explorer.manta.network",
        },
      },
    ],
  },
};

export default config;
