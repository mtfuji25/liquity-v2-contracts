import { formatEther } from "ethers/lib/utils";

import BaseHelper, { ZERO_ADDRESS } from "./BaseHelper";
import {
  BorrowerOperations,
  DebtTokenOnezProxy,
  Factory,
  FeeReceiver,
  GasPool,
  LiquidationManager,
  MultiCollateralHintHelpers,
  MultiTroveGetter,
  ONEZ,
  PriceFeedPyth,
  PrismaCore,
  SortedTroves,
  StabilityPool,
  TroveManager,
  PrismaVault,
  TroveManagerGetters,
  ILendingPool,
  MockLendingPool,
  MockPyth,
  MintableERC20,
  WrappedLendingCollateral,
  BaseDelegate,
} from "../../typechain";
import { ICollateral, ICoreContracts, IExternalContracts } from "./interfaces";
import Bluebird from "bluebird";
import { BigNumber } from "ethers";
import * as ethers from "ethers";

const e18 = BigNumber.from(10).pow(18);

export default abstract class BaseDeploymentHelper extends BaseHelper {
  public async deploy() {
    const wallet = await this.getEthersSigner();
    const balBefore = formatEther(await wallet.getBalance());

    this.log(`Deployer is: ${await wallet.getAddress()}`);
    this.log(`Deployer ETH balance before: ${balBefore}`);

    this.config.ADMIN_ADDRESS = await wallet.getAddress();
    this.config.DEPLOYER_ADDRESS = await wallet.getAddress();

    const external = await this.deployOrLoadExternalContracts();

    // deploy core and gove
    const core = await this.deployCore(await wallet.getAddress(), external);

    const collaterals = await Bluebird.mapSeries(
      this.config.COLLATERALS,
      async (token) => {
        const result = await this.addCollateral(core, external, token);
        const { wCollateral, delegate, troveManager } = result;
        const erc20 = await this.loadOrDeployMockERC20(token);
        return {
          wCollateral,
          delegate,
          erc20,
          token,
          troveManager: troveManager.connect(wallet),
        };
      }
    );

    const facilitator = await core.onez.getFacilitator(
      core.debtTokenOnezProxy.address
    );
    if (facilitator.bucketCapacity.eq(0)) {
      this.log("- Adding protocol as a facilitator");
      await core.onez.addFacilitator(
        core.debtTokenOnezProxy.address,
        "bo",
        e18.mul(1000000)
      );
    }

    return {
      core,
      external,
      collaterals,
    };
  }

  public async deployCore(
    owner: string,
    external: IExternalContracts
  ): Promise<ICoreContracts> {
    this.log(`------ Deploying core contracts ------`);
    const gasCompenstaion = e18.mul(this.config.GAS_COMPENSATION);
    const onez = await this.loadOrDeployONEZ();

    // predict all the addresses that we will generate
    const estimates = await this.estimateDeploymentAddresses();

    this.log(
      "- Estimating DebtTokenOnezProxy at",
      estimates.DebtTokenOnezProxy
    );
    const debtTokenOnezProxy = await this.deployContract<DebtTokenOnezProxy>(
      "DebtTokenOnezProxy",
      [
        estimates.PrismaCore, // address _prismaCore,
        onez.address, // IONEZ _onez,
        estimates.StabilityPool, // address _stabilityPoolAddress,
        estimates.BorrowerOperations, // address _borrowerOperationsAddress,
        estimates.Factory, // address _factory,
        estimates.GasPool, // address _gasPool,
        gasCompenstaion, // uint256 _gasCompensation
      ]
    );

    this.log("- Estimating PrismaCore at", estimates.PrismaCore);
    const prismaCore = await this.deployContract<PrismaCore>("PrismaCore", [
      owner, // address _owner,
      owner, // address _guardian,
      estimates.PriceFeedPyth, // address _priceFeed,
      estimates.FeeReceiver, // address _feeReceiver
    ]);

    this.log("- Estimating PriceFeedPyth at", estimates.PriceFeedPyth);
    const priceFeedPyth = await this.deployContract<PriceFeedPyth>(
      "PriceFeedPyth",
      [estimates.PrismaCore, external.pyth.address]
    );

    this.log("- Estimating FeeReceiver at", estimates.FeeReceiver);
    const feeReceiver = await this.deployContract<FeeReceiver>("FeeReceiver", [
      estimates.PrismaCore,
    ]);

    this.log("- Estimating Factory at", estimates.Factory);
    const factory = await this.deployContract<Factory>("Factory", [
      estimates.PrismaCore, // address _prismaCore,
      estimates.DebtTokenOnezProxy, // IDebtTokenOnezProxy _debtToken,
      estimates.StabilityPool, // IStabilityPool _stabilityPool,
      estimates.BorrowerOperations, // IBorrowerOperations _borrowerOperations,
      estimates.SortedTroves, // address _sortedTroves,
      estimates.TroveManager, // address _troveManager,
      estimates.LiquidationManager, // ILiquidationManager _liquidationManager
    ]);

    this.log(
      "- Estimating BorrowerOperations at",
      estimates.BorrowerOperations
    );
    const borrowerOperations = await this.deployContract<BorrowerOperations>(
      "BorrowerOperations",
      [
        estimates.PrismaCore, // address _prismaCore,
        estimates.DebtTokenOnezProxy, // address _debtTokenAddress,
        estimates.Factory, // address _factory,
        e18.mul(this.config.MIN_NET_DEBT), // uint256 _minNetDebt,
        gasCompenstaion, // uint256 _gasCompensation
      ]
    );

    const gasPool = await this.deployContract<GasPool>("GasPool", [
      estimates.DebtTokenOnezProxy,
      onez.address,
    ]);

    // use an empty vault for now and keep it behind a proxy
    const prismaVaultImpl = await this.deployContract<PrismaVault>(
      "EmptyVault"
    );

    const prismaVault = await this.deployContract<PrismaVault>(
      "TransparentUpgradeableProxy",
      [prismaVaultImpl.address, owner, "0x"]
    );

    const liquidationManager = await this.deployContract<LiquidationManager>(
      "LiquidationManager",
      [
        estimates.StabilityPool, // IStabilityPool _stabilityPoolAddress,
        estimates.BorrowerOperations, // IBorrowerOperations _borrowerOperations,
        estimates.Factory, // address _factory,
        gasCompenstaion, // uint256 _gasCompensation
      ]
    );

    const stabilityPool = await this.deployContract<StabilityPool>(
      "StabilityPool",
      [
        estimates.PrismaCore, // address _prismaCore,
        estimates.DebtTokenOnezProxy, // IDebtTokenOnezProxy _debtTokenAddress,
        estimates.VaultProxy, // IPrismaVault _vault,
        estimates.Factory, // address _factory,
        liquidationManager.address, // address _liquidationManager
      ]
    );

    const multiCollateralHintHelpers =
      await this.deployContract<MultiCollateralHintHelpers>(
        "MultiCollateralHintHelpers",
        [prismaCore.address, gasCompenstaion]
      );
    const multiTroveGetter = await this.deployContract<MultiTroveGetter>(
      "MultiTroveGetter"
    );
    const troveManagerGetters = await this.deployContract<TroveManagerGetters>(
      "TroveManagerGetters",
      [factory.address]
    );

    const sortedTroves = await this.deployContract<SortedTroves>(
      "SortedTroves"
    );

    const troveManager = await this.deployContract<TroveManager>(
      "TroveManager",
      [
        prismaCore.address, // address _prismaCore,
        gasPool.address, // address _gasPoolAddress,
        debtTokenOnezProxy.address, // address _debtTokenAddress,
        borrowerOperations.address, // address _borrowerOperationsAddress,
        prismaVault.address, // address _vault,
        liquidationManager.address, // address _liquidationManager,
        gasCompenstaion, // uint256 _gasCompensation
      ]
    );

    return {
      prismaCore,
      troveManager,
      factory,
      feeReceiver,
      borrowerOperations,
      sortedTroves,
      debtTokenOnezProxy,
      onez,
      prismaVault,
      gasPool,
      liquidationManager,
      stabilityPool,
      priceFeedPyth,
      multiCollateralHintHelpers,
      multiTroveGetter,
      troveManagerGetters,
    };
  }

  private async addCollateral(
    core: ICoreContracts,
    external: IExternalContracts,
    token: ICollateral
  ) {
    this.log(`------ Adding collateral ${token.symbol} ------`);

    const wCollateral = await this.deployContract<WrappedLendingCollateral>(
      "WrappedLendingCollateral",
      [
        token.symbol,
        token.symbol,
        external.lendingPool.address,
        token.address,
        core.borrowerOperations.address,
      ],
      token.symbol
    );

    const deployedTmAddress = await core.factory.collatearlToTM(
      wCollateral.address
    );

    if (
      (await core.priceFeedPyth.priceIds(wCollateral.address)) ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      this.log("- Setting pricefeeds");

      await this.waitForTx(
        core.priceFeedPyth.setOracle(wCollateral.address, token.pythId)
      );

      await this.waitForTx(
        core.priceFeedPyth.setOracle(token.address, token.pythId)
      );
    }

    if (deployedTmAddress === ZERO_ADDRESS) {
      this.log("- Deploying collateral");
      await this.waitForTx(
        core.factory.deployNewInstance(
          wCollateral.address, // address collateral
          core.priceFeedPyth.address, // address priceFeed;
          {
            minuteDecayFactor: "999037758833783000", // uint256 minuteDecayFactor; // 999037758833783000  (half life of 12 hours)
            redemptionFeeFloor: "5000000000000000", // uint256 redemptionFeeFloor; // 1e18 / 1000 * 5  (0.5%)
            maxRedemptionFee: "1000000000000000000", // uint256 maxRedemptionFee; // 1e18  (100%)
            borrowingFeeFloor: "5000000000000000", // uint256 borrowingFeeFloor; // 1e18 / 1000 * 5  (0.5%)
            maxBorrowingFee: "50000000000000000", // uint256 maxBorrowingFee; // 1e18 / 100 * 5  (5%)
            interestRateInBps: token.interestRateInBps, // "100", // uint256 interestRateInBps; // 100 (1%)
            maxDebt: e18.mul(1000000), // uint256 maxDebt;
            MCR: "1200000000000000000", // uint256 MCR; // 12 * 1e17  (120%)
          }
        )
      );

      this.log("- Collateral deployed");
    }

    let delegate: BaseDelegate;

    const tmAddress = await core.factory.collatearlToTM(wCollateral.address);
    const troveManager = await this.getContract<TroveManager>(
      "TroveManager",
      tmAddress
    );

    this.log("- Deploying delegate with troveManager", troveManager.address);
    if (token.symbol === "WETH")
      delegate = await this.deployContract<BaseDelegate>(
        "WETHDelegate",
        [
          core.borrowerOperations.address, // IBorrowerOperations _bo,
          wCollateral.address, // IWrappedLendingCollateral _collateral,
          tmAddress, // address _tm,
          core.onez.address, // IERC20 _debt,
          token.address, // IWETH _weth
        ],
        token.symbol
      );
    else
      delegate = await this.deployContract<BaseDelegate>(
        "ERC20Delegate",
        [
          core.borrowerOperations.address, // IBorrowerOperations _bo,
          wCollateral.address, // IWrappedLendingCollateral _collateral,
          tmAddress, // address _tm,
          core.onez.address, // IERC20 _debt,
          token.address, // IERC20 _underlying
        ],
        token.symbol
      );

    this.log(`------ Collateral Added ------`);
    return { wCollateral, delegate, troveManager };
  }

  private async deployOrLoadExternalContracts(): Promise<IExternalContracts> {
    await this.loadMockCollaterals();

    const pyth = await this.loadOrDeployMockPyth();
    const lendingPool = await this.loadOrDeployMockLendingPool();

    return {
      pyth,
      lendingPool,
    };
  }

  private async loadOrDeployMockLendingPool() {
    if (this.config.LENDING_POOL_ADDRESS != ZERO_ADDRESS)
      return await this.getContract<ILendingPool>(
        "MockLendingPool",
        this.config.LENDING_POOL_ADDRESS
      );

    const pool = await this.deployContract<MockLendingPool>(`MockLendingPool`);

    for (let index = 0; index < this.config.COLLATERALS.length; index++) {
      await this.waitForTx(
        pool.initReserve(this.config.COLLATERALS[index].address)
      );
    }

    return pool as ILendingPool;
  }

  private async loadMockCollaterals() {
    for (let index = 0; index < this.config.COLLATERALS.length; index++) {
      const token = this.config.COLLATERALS[index];
      if (token.address !== ZERO_ADDRESS) continue;

      const instance = await this.loadOrDeployMockERC20(token);
      this.config.COLLATERALS[index].address = instance.address;
    }
  }

  private async loadOrDeployMockERC20(token: ICollateral) {
    if (token.address != ZERO_ADDRESS)
      return await this.getContract<MintableERC20>(
        "MintableERC20",
        token.address
      );

    this.log(`- Deploying mock token for ${token.symbol}`);
    return await this.deployContract<MintableERC20>(`MintableERC20`, [
      token.symbol,
      token.symbol,
    ]);
  }

  private async loadOrDeployONEZ() {
    if (this.config.ONEZ != ZERO_ADDRESS)
      return await this.getContract<ONEZ>("ONEZ", this.config.ONEZ);

    this.log(`- Deploying mock onez token`);
    return await this.deployContract<ONEZ>(`ONEZ`);
  }

  private async loadOrDeployMockPyth() {
    if (this.config.PYTH_ADDRESS != ZERO_ADDRESS)
      return await this.getContract<MockPyth>(
        "MockPyth",
        this.config.PYTH_ADDRESS
      );

    const pyth = await this.deployContract<MockPyth>(`MockPyth`);

    for (let index = 0; index < this.config.COLLATERALS.length; index++) {
      await this.waitForTx(
        pyth.setPrice(
          this.config.COLLATERALS[index].pythId,
          this.config.COLLATERALS[index].testnetPriceE8 || 0,
          -8
        )
      );
    }
    return pyth;
  }

  abstract estimateDeploymentAddress(
    address: string,
    nonce: number
  ): Promise<string>;

  abstract getDeploymentNonce(address: string): Promise<number>;

  private async estimateDeploymentAddresses() {
    this.log("- Estimating deployment addresses");
    const who = await (await this.getEthersSigner()).getAddress();
    const nonce = await this.getDeploymentNonce(who);

    const addreses = [];
    for (let index = 0; index < 16; index++) {
      addreses.push(await this.estimateDeploymentAddress(who, nonce + index));
    }

    this.log("- Done estimating deployment addresses");

    return {
      DebtTokenOnezProxy: addreses[0],
      PrismaCore: addreses[1],
      PriceFeedPyth: addreses[2],
      FeeReceiver: addreses[3],
      Factory: addreses[4],
      BorrowerOperations: addreses[5],
      GasPool: addreses[6],
      EmptyVault: addreses[7],
      VaultProxy: addreses[8],
      LiquidationManager: addreses[9],
      StabilityPool: addreses[10],
      MultiCollateralHintHelpers: addreses[11],
      MultiTroveGetter: addreses[12],
      TroveManagerGetters: addreses[13],
      SortedTroves: addreses[14],
      TroveManager: addreses[15],
    };
  }
}
