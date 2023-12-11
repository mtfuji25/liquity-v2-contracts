import { assert } from "chai";
import { getDeployer } from "./helpers.ts";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import params from "./params/zksync-mainnet.ts";
import ZksDeploymentHelper from "../utils/ZksDeploymentHelper.ts";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Greeter contract`);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const d = getDeployer(hre);

  const helper = new ZksDeploymentHelper(params, d, hre);
  const state = helper.loadPreviousDeployment();

  console.log(`Deployer address: ${d.ethWallet.address}`);
  assert.equal(d.ethWallet.address, params.DEPLOYER_ADDRS.DEPLOYER);

  const balBefore = await d.ethWallet.provider.getBalance(d.ethWallet.address);
  console.log(`Deployer ETH balance before: ${balBefore}`);

  // Deploy core logic contracts.
  await helper.deploy(state);

  const balAfter = await d.ethWallet.provider.getBalance(d.ethWallet.address);
  console.log(`Deployer's ETH balance after deployments: ${balAfter}`);
}
