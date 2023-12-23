import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BorrowerOperations } from "../typechain";
import { BigNumber } from "ethers";
import { ZERO_ADDRESS } from "../utils/base/BaseHelper";
import { ICoreContracts, ITokenContracts } from "../utils/base/interfaces";

export const e18 = BigNumber.from(10).pow(18);
export const e6 = BigNumber.from(10).pow(6);

export const openTroves = async (
  bo: BorrowerOperations,
  tm: string,
  users: SignerWithAddress[],
  colls: BigNumber[],
  debts: BigNumber[],
  collateral: ITokenContracts
) => {
  for (let index = 0; index < users.length; index++) {
    const user = users[index];
    await openTrove(bo, tm, user, colls[index], debts[index], collateral);
  }
};

export const openTrove = async (
  bo: BorrowerOperations,
  tm: string,
  user: SignerWithAddress,
  coll: BigNumber,
  debt: BigNumber,
  collateral: ITokenContracts
) => {
  // mint wrapped collateral
  await mintCollateralWithApproval(user, coll, collateral, bo.address);

  // open trove
  await bo
    .connect(user)
    .openTrove(tm, user.address, e18, coll, debt, ZERO_ADDRESS, ZERO_ADDRESS);
};

export const mintCollateralWithApproval = async (
  user: SignerWithAddress,
  coll: BigNumber,
  collateral: ITokenContracts,
  approvalTo?: string
) => {
  // mint wrapped collateral
  await collateral.erc20
    .connect(user)
    .approve(collateral.wCollateral.address, e18.mul(9999999));

  await collateral.erc20.connect(user)["mint(uint256)"](coll);
  await collateral.wCollateral.connect(user).mint(coll);

  if (approvalTo)
    await collateral.wCollateral
      .connect(user)
      .approve(approvalTo, e18.mul(9999999));
};

export const burnCollateral = async (
  user: SignerWithAddress,
  coll: BigNumber,
  collateral: ITokenContracts
) => {
  // // mint wrapped collateral
  // await collateral.erc20
  //   .connect(user)
  //   .approve(collateral.wCollateral.address, e18.mul(9999999));

  await collateral.wCollateral.connect(user).burnTo(user.address, coll);
};

export const provideToSP = async (
  core: ICoreContracts,
  user: SignerWithAddress,
  amount: number
) => {
  await core.onez
    .connect(user)
    .approve(core.debtTokenOnezProxy.address, e18.mul(amount));

  await core.stabilityPool.connect(user).provideToSP(e18.mul(amount));
};

export const withdrawFromSP = async (
  core: ICoreContracts,
  user: SignerWithAddress,
  amount: number
) => {
  await core.stabilityPool.connect(user).withdrawFromSP(e18.mul(amount));
};
