import hre, { ethers } from "hardhat";
import params from "../deploy/params/base-goerli";
import HardhatDeploymentHelper from "../utils/EvmDeploymentHelper";

async function main(): Promise<void> {
  const [signer] = await ethers.getSigners();
  const helper = new HardhatDeploymentHelper(signer, params, hre);
  await helper.deploy();
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
