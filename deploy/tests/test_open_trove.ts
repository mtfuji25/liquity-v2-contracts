import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getZkDeployer } from "../zkUtils";

import paramsGoerliFork from "../params/zksync-goerli-fork";
import paramsGoerli from "../params/zksync-goerli";
import ZksDeploymentHelper from "../../utils/ZksDeploymentHelper";
import { e18 } from "../../test/helpers";
import { BorrowerOperations, Factory } from "../../typechain";
import { ZERO_ADDRESS } from "../../utils/base/BaseHelper";

export default async function (hre: HardhatRuntimeEnvironment) {
  const deployer = getZkDeployer(hre);

  const params =
    hre.network.name === "inMemoryNode" ? paramsGoerliFork : paramsGoerli;

  const mdh = new ZksDeploymentHelper(
    deployer.wallet.privateKey,
    params,
    hre,
    true
  );
  await mdh.loadPreviousDeployment();

  const signer = await mdh.getEthersSigner();

  console.log("got signer", await signer.getAddress());

  const bo = await mdh.getSavedContract<BorrowerOperations>(
    "BorrowerOperations",
    ""
  );

  console.log("got bo");

  const factory = await mdh.getSavedContract<Factory>("Factory", "");

  await bo.connect(signer).openTrove(
    await factory.troveManagers(0),
    deployer.wallet.address,
    e18,
    e18, // collateral
    e18.mul(200),
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    { value: e18 } // collateral
  );

  // const wallet = mdh.getEthersSigner();
  // const erc20 = await mdh.getContract<ERC20>(
  //   "IERC20",
  //   result.token.address,
  //   wallet
  // );
  // await mdh.verifyContracts(result.token.symbol);

  // const approve = await erc20.approve(
  //   result.core.borrowerOperations.address,
  //   dec(10000000, 18)
  // );
  // console.log("approve", approve.hash);

  // console.log("priceFeed", await result.core.priceFeed.fetchPrice());
  // console.log("canInitialize", await result.core.troveManager.canInitialize());

  // console.log(tx.tx.hash);
}
