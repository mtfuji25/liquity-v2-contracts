import hre, { ethers } from "hardhat";
import params from "../deploy/params/manta-mainnet";
import EvmDeploymentHelper from "../utils/EvmDeploymentHelper";

async function main(): Promise<void> {
  const [signer] = await ethers.getSigners();
  const helper = new EvmDeploymentHelper(signer, params, hre);
  await helper.deploy();
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
