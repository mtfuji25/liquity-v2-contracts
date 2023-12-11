import hre from "hardhat";
import params from "../deploy/params/zksync-goerli-fork";
import ZksDeploymentHelper from "../utils/ZksDeploymentHelper";
import { getForkDeployer } from "../deploy/helpers";

async function main(): Promise<void> {
  const deployer = await getForkDeployer(hre);
  const helper = new ZksDeploymentHelper(
    deployer.ethWallet.privateKey,
    params,
    hre
  );
  await helper.deploy();
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
