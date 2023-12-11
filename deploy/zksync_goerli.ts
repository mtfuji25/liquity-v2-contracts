import { assert } from "chai";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import params from "./params/zksync-goerli";
import ZksDeploymentHelper from "../utils/ZksDeploymentHelper";
import { getZkDeployer } from "./zkUtils";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for zksync goerli network`);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const d = getZkDeployer(hre);

  const helper = new ZksDeploymentHelper(d.wallet.privateKey, params, hre);
  helper.loadPreviousDeployment();

  console.log(`Deployer address: ${d.wallet.address}`);
  assert.equal(d.wallet.address, params.DEPLOYER_ADDRESS);

  // Deploy core logic contracts.
  await helper.deploy();
}
