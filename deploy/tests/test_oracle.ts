import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getForkDeployer } from "../helpers.ts";
import { Provider } from "zksync-web3";
import * as ethers from "ethers";

export default async function (hre: HardhatRuntimeEnvironment) {
  const deployer = getForkDeployer(hre);
  const PriceFeed = await deployer.loadArtifact("PriceFeed");

  const collateral = {
    pythId:
      "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    address: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
    symbol: "USDC",
    decimals: 6,
  };

  const params = [
    "0xf087c864AEccFb6A2Bf1Af6A0382B0d0f6c5D834",
    collateral.pythId,
    collateral.decimals,
  ];

  const instance = await deployer.deploy(PriceFeed);
  console.log("created", instance.address);

  // @ts-ignore
  const provider = new Provider(hre.userConfig.networks?.inMemoryNode?.url);
  const signer = new ethers.Wallet(deployer.ethWallet.privateKey, provider);

  // Initialise contract instance
  const contract = new ethers.Contract(instance.address, PriceFeed.abi, signer);

  console.log("setAddress", params);
  await contract.setAddresses(...params);

  console.log("quote", await contract.quote(1e6));
}
