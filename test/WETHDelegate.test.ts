import { e18 } from "./helpers";
import { expect } from "chai";
import { getDelegateHash } from "./hashHelpers";
import { ICoreContracts, ITokenContracts } from "../utils/base/interfaces";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ZERO_ADDRESS } from "../utils/base/BaseHelper";
import HardhatDeploymentHelper from "../utils/HardhatDeploymentHelper";
import hre from "hardhat";
import params from "../deploy/params/hardhat-test";

describe("WETHDelegate", function () {
  let core: ICoreContracts;
  let collaterals: ITokenContracts[];
  let deployer: SignerWithAddress;

  const deadline = Math.floor(Date.now() / 1000 + 86400 * 100);

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();

    const helper = new HardhatDeploymentHelper(deployer, params, hre);
    helper.log = () => {
      /* nothing */
    };

    const result = await helper.deploy();
    core = result.core;
    collaterals = result.collaterals;
  });

  it("Should open a trove with ETH collateral as ETH", async function () {
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

  it("Should close a trove with ETH collateral as WETH", async function () {
    const collateral = collaterals[0];

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

  it("Should increase collateral a trove with ETH collateral as WETH", async function () {
    const collateral = collaterals[0];

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
    expect(
      (await collateral.troveManager.getEntireDebtAndColl(deployer.address))
        .coll
    ).to.equal(e18);

    const hashClose = await getDelegateHash(
      core.borrowerOperations,
      deployer,
      collateral.delegate.address,
      deadline
    );

    await collateral.delegate.connect(deployer).adjustTrove(
      e18, // uint256 _maxFeePercentage,
      e18, // uint256 _collDeposit,
      0, // uint256 _collWithdrawal,
      0, // uint256 _debtChange,
      false, // bool _isDebtIncrease,
      ZERO_ADDRESS, // address _upperHint,
      ZERO_ADDRESS, // address _lowerHint,
      deadline, // uint256 _deadline,
      hashClose.signature, // bytes memory signature
      { value: e18 }
    );

    expect(
      (await collateral.troveManager.getEntireDebtAndColl(deployer.address))
        .coll
    ).to.equal(e18.mul(2));
  });

  it("Should decrease collateral a trove with ETH collateral as WETH", async function () {
    const collateral = collaterals[0];

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
    expect(
      (await collateral.troveManager.getEntireDebtAndColl(deployer.address))
        .coll
    ).to.equal(e18);

    const hashClose = await getDelegateHash(
      core.borrowerOperations,
      deployer,
      collateral.delegate.address,
      deadline
    );

    await collateral.delegate.connect(deployer).adjustTrove(
      e18, // uint256 _maxFeePercentage,
      0, // uint256 _collDeposit,
      e18.div(10), // uint256 _collWithdrawal,
      0, // uint256 _debtChange,
      false, // bool _isDebtIncrease,
      ZERO_ADDRESS, // address _upperHint,
      ZERO_ADDRESS, // address _lowerHint,
      deadline, // uint256 _deadline,
      hashClose.signature // bytes memory signature
    );

    expect(
      (await collateral.troveManager.getEntireDebtAndColl(deployer.address))
        .coll
    ).to.equal(e18.mul(9).div(10));
  });

  it("Should increase debt a trove with ETH collateral as WETH", async function () {
    const collateral = collaterals[0];

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
    expect(
      (await collateral.troveManager.getEntireDebtAndColl(deployer.address))
        .debt
    ).to.equal(e18.mul(211));

    const hashClose = await getDelegateHash(
      core.borrowerOperations,
      deployer,
      collateral.delegate.address,
      deadline
    );

    await collateral.delegate.connect(deployer).adjustTrove(
      e18, // uint256 _maxFeePercentage,
      0, // uint256 _collDeposit,
      0, // uint256 _collWithdrawal,
      e18.mul(10), // uint256 _debtChange,
      true, // bool _isDebtIncrease,
      ZERO_ADDRESS, // address _upperHint,
      ZERO_ADDRESS, // address _lowerHint,
      deadline, // uint256 _deadline,
      hashClose.signature // bytes memory signature
    );

    expect(
      (await collateral.troveManager.getEntireDebtAndColl(deployer.address))
        .debt
    ).to.equal(e18.mul(22105).div(100));
  });

  it("Should decrease debt a trove with ETH collateral as WETH", async function () {
    const collateral = collaterals[0];

    const hashOpen = await getDelegateHash(
      core.borrowerOperations,
      deployer,
      collateral.delegate.address,
      deadline
    );

    // open trove
    await collateral.delegate.connect(deployer).openTrove(
      e18, // uint256 _maxFeePercentage,
      e18.mul(300), // uint256 _debtAmount,
      e18, // uint256 _collAmount,
      ZERO_ADDRESS, // address _upperHint,
      ZERO_ADDRESS, // address _lowerHint,
      deadline, // uint256 _deadline,
      hashOpen.signature, // bytes memory signature
      { value: e18 }
    );

    expect(await core.onez.balanceOf(deployer.address)).to.equal(e18.mul(300));
    expect(
      (await collateral.troveManager.getEntireDebtAndColl(deployer.address))
        .debt
    ).to.equal(e18.mul(3115).div(10));

    const hashClose = await getDelegateHash(
      core.borrowerOperations,
      deployer,
      collateral.delegate.address,
      deadline
    );

    await core.onez.approve(collateral.delegate.address, e18.mul(10));

    await collateral.delegate.connect(deployer).adjustTrove(
      e18, // uint256 _maxFeePercentage,
      0, // uint256 _collDeposit,
      0, // uint256 _collWithdrawal,
      e18.mul(10), // uint256 _debtChange,
      false, // bool _isDebtIncrease,
      ZERO_ADDRESS, // address _upperHint,
      ZERO_ADDRESS, // address _lowerHint,
      deadline, // uint256 _deadline,
      hashClose.signature // bytes memory signature
    );

    expect(
      (await collateral.troveManager.getEntireDebtAndColl(deployer.address))
        .debt
    ).to.equal(e18.mul(3015).div(10));
  });
});
