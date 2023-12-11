import { Contract } from "ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IParams } from "./base/interfaces";
import { Provider, Wallet } from "zksync-web3";
import { ZkSyncArtifact } from "@matterlabs/hardhat-zksync-deploy/dist/types";
import * as ethers from "ethers";
import BaseDeploymentHelper from "./base/BaseDeploymentHelper";

export default class ZksDeploymentHelper extends BaseDeploymentHelper {
  deployer: Deployer;
  wallet: Wallet;

  constructor(
    privateKey: string,
    configParams: IParams,
    hre: HardhatRuntimeEnvironment,
    skipSave: boolean = false
  ) {
    super(configParams, hre, skipSave);
    this.wallet = new Wallet(privateKey);
    this.deployer = new Deployer(hre, this.wallet);
  }

  async getFactory(name: string): Promise<ZkSyncArtifact> {
    return await this.deployer.loadArtifact(name);
  }

  async waitForTx(txPromise: Promise<ethers.ContractTransaction>) {
    const tx = await txPromise;
    if (this.config.TX_CONFIRMATIONS === 0) return;
    await this.deployer.ethWallet.provider.waitForTransaction(
      tx.hash,
      this.config.TX_CONFIRMATIONS
    );
  }

  getEthersSigner = async (privateKey?: string): Promise<ethers.Signer> =>
    await new ethers.Wallet(
      privateKey || this.deployer.ethWallet.privateKey,
      this.getEthersProvider()
    );

  getContract = async <T extends Contract>(
    factoryN: string,
    address: string
  ) => {
    console.log("loading", factoryN, address);
    const factory = await this.getFactory(factoryN);
    return new ethers.Contract(
      address,
      factory.abi,
      await this.getEthersSigner()
    ) as T;
  };

  getEthersProvider = () => new Provider(this.config.RPC_URL);

  async deployContract<T extends Contract>(
    name: string,
    params: any[] = [],
    suffix: string = ""
  ): Promise<T> {
    if (
      this.state[`${name}${suffix}`] &&
      this.state[`${name}${suffix}`].address &&
      !this.skipSave
    ) {
      this.log(
        `- Using previously deployed ${name}${suffix} contract at address ${
          this.state[`${name}${suffix}`].address
        }`
      );
      return this.getContract<T>(this.state[`${name}${suffix}`].address, name);
    }

    this.log(`- Deploying ${name}:${suffix}`);
    const factory = await this.getFactory(name);
    const contract = (await this.deployer.deploy(factory, params, {
      gasPrice: this.config.GAS_PRICE,
    })) as T;

    // wait for the tx
    if (this.config.TX_CONFIRMATIONS > 0) {
      const provider = this.getEthersProvider();
      await provider.waitForTransaction(
        contract.deployTransaction.hash,
        this.config.TX_CONFIRMATIONS
      );
    }

    this.log(`- Deployed ${name}${suffix} at ${contract.address}`);
    this.state[`${name}${suffix}`] = {
      abi: name,
      address: contract.address,
      txHash: contract.deployTransaction.hash,
    };

    this.saveDeployment(this.state);
    await this.verifyContract(name, params);
    return contract;
  }
}
