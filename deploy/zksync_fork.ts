import { assert } from "chai";
import { getForkDeployer } from "./helpers.ts";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import params from "./params/zksync-fork.ts";
import ZksDeploymentHelper from "../utils/ZksDeploymentHelper.ts";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for zksync fork network`);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const d = getForkDeployer(hre);

  const helper = new ZksDeploymentHelper(params, d, hre);
  helper.loadPreviousDeployment();

  console.log(`Deployer address: ${d.ethWallet.address}`);
  assert.equal(d.ethWallet.address, params.DEPLOYER_ADDRESS);

  // Deploy core logic contracts.
  await helper.deploy();
}
