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
};

export default config;
