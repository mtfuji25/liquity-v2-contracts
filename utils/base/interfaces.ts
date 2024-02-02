import {
  BaseDelegate,
  BorrowerOperations,
  DebtTokenOnezProxy,
  Factory,
  FeeReceiver,
  GasPool,
  ILendingPool,
  IPyth,
  LiquidationManager,
  MintableERC20,
  MockPyth,
  MultiCollateralHintHelpers,
  MultiTroveGetter,
  ONEZ,
  PriceFeed,
  PriceFeedPyth,
  PrismaCore,
  PrismaVault,
  SortedTroves,
  StabilityPool,
  TroveManager,
  TroveManagerGetters,
  WrappedLendingCollateral,
} from "../../typechain";

export interface IExternalContracts {
  lendingPool: ILendingPool;
  pyth: MockPyth;
  // chainLinkOracles: {
  //   [symbol: string]: MockV3Aggregator;
  // };
}

export interface ITokenContracts {
  wCollateral: WrappedLendingCollateral;
  delegate: BaseDelegate;
  troveManager: TroveManager;
  erc20: MintableERC20;
  token: ICollateral;
}

export type ICollateral = {
  chainlinkOracle?: string;
  chainlinkOracleScale?: number;
  pythId?: string;
  symbol: string;
  decimals: number;
  address: string;
  capacityE18: string;
  interestRateInBps: string;
  testnetPriceE8?: number;
};

export interface IParams {
  RPC_URL: string;
  ONEZ: string;
  PYTH_ADDRESS: string;
  COLLATERALS: ICollateral[];
  ADMIN_ADDRESS: string;
  DEPLOYER_ADDRESS: string;
  OUTPUT_FILE: string;
  GAS_PRICE: number;
  TX_CONFIRMATIONS: number;
  LAYERZERO_ENDPOINT: string;
  LENDING_POOL_ADDRESS: string;
  ETHERSCAN_BASE_URL?: string;
  NETWORK_NAME: string;

  MIN_NET_DEBT: number;
  GAS_COMPENSATION: number;
}

export type IState = {
  [key: string]: {
    abi: string;
    address: string;
    txHash: string;
    verification?: string;
  };
};

export interface ICoreContracts {
  prismaCore: PrismaCore;
  factory: Factory;
  troveManager: TroveManager;
  borrowerOperations: BorrowerOperations;
  debtTokenOnezProxy: DebtTokenOnezProxy;
  onez: ONEZ;
  gasPool: GasPool;
  feeReceiver: FeeReceiver;
  liquidationManager: LiquidationManager;
  sortedTroves: SortedTroves;
  stabilityPool: StabilityPool;
  priceFeedPyth: PriceFeedPyth;
  multiCollateralHintHelpers: MultiCollateralHintHelpers;
  multiTroveGetter: MultiTroveGetter;
  troveManagerGetters: TroveManagerGetters;
  prismaVault: PrismaVault;
}
