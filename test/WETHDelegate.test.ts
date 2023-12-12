import { expect } from "chai";
import {
  ICoreContracts,
  IExternalContracts,
  ITokenContracts,
} from "../utils/base/interfaces";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import HardhatDeploymentHelper from "../utils/HardhatDeploymentHelper";
import hre from "hardhat";
import params from "../deploy/params/hardhat-test";
import { ZERO_ADDRESS } from "../utils/base/BaseHelper";
import { e18 } from "./helpers";
import { BorrowerOperations, StabilityPool } from "../typechain";
import { getDelegateHash } from "./hashHelpers";

describe("WETHDelegate", function () {
  let core: ICoreContracts;
  let external: IExternalContracts;
  let restWallets: SignerWithAddress[];
  let collaterals: ITokenContracts[];
  let deployer: SignerWithAddress;
  let ant: SignerWithAddress;
  let bo: BorrowerOperations;
  let sp: StabilityPool;

  beforeEach(async () => {
    [deployer, ant, ...restWallets] = await ethers.getSigners();

    const helper = new HardhatDeploymentHelper(deployer, params, hre);
    helper.log = () => {
      /* nothing */
    };

    const result = await helper.deploy();
    core = result.core;
    external = result.external;
    collaterals = result.collaterals;

    bo = core.borrowerOperations;
    sp = core.stabilityPool;
  });

  it("Should open a trove with ETH collateral as ETH", async function () {
    const deadline = Math.floor(Date.now() / 1000 + 86400);
    const collateral = collaterals[0];

    const hashOpen = await getDelegateHash(
      core.borrowerOperations,
      deployer,
      collateral.delegate.address,
      deadline
    );

    await collateral.delegate.connect(deployer).openTrove(
      e18, // uint256 _maxFeePercentage,
      e18.mul(200), // uint256 _debtAmount,
      e18, // uint256 _collAmount,
      ZERO_ADDRESS, // address _upperHint,
      ZERO_ADDRESS, // address _lowerHint,
      deadline, // uint256 _deadline,
      hashOpen.signature, // bytes memory signature
      { value: e18 }
    );

    expect(await core.onez.balanceOf(deployer.address)).to.equal(e18.mul(200));
  });

  it("Should close a trove with ETH collateral as WETH inside of wrapped collateral", async function () {
    const collateral = collaterals[0];
    const deadline = Math.floor(Date.now() / 1000 + 86400);

    const hashOpen = await getDelegateHash(
      core.borrowerOperations,
      deployer,
      collateral.delegate.address,
      deadline
    );

    // open trove
    await collateral.delegate.connect(deployer).openTrove(
      e18, // uint256 _maxFeePercentage,
      e18.mul(200), // uint256 _debtAmount,
      e18, // uint256 _collAmount,
      ZERO_ADDRESS, // address _upperHint,
      ZERO_ADDRESS, // address _lowerHint,
      deadline, // uint256 _deadline,
      hashOpen.signature, // bytes memory signature
      { value: e18 }
    );

    expect(await core.onez.balanceOf(deployer.address)).to.equal(e18.mul(200));

    // claim trove open fees
    await core.feeReceiver
      .connect(deployer)
      .transferToken(
        core.onez.address,
        deployer.address,
        await core.onez.balanceOf(core.feeReceiver.address)
      );

    await core.onez
      .connect(deployer)
      .approve(collateral.delegate.address, e18.mul(300));

    const hashClose = await getDelegateHash(
      core.borrowerOperations,
      deployer,
      collateral.delegate.address,
      deadline
    );

    await collateral.delegate.connect(deployer).closeTrove(
      deadline, // uint256 _deadline,
      hashClose.signature // bytes memory signature
    );
  });
});
