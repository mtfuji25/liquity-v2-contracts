import { Contract, ContractFactory, ContractTransaction } from "ethers";
import BaseDeploymentHelper from "./base/BaseDeploymentHelper";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IParams } from "./base/interfaces";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export default class EvmDeploymentHelper extends BaseDeploymentHelper {
  signer: SignerWithAddress;

  constructor(
    signer: SignerWithAddress,
    configParams: IParams,
    hre: HardhatRuntimeEnvironment,
    skipSave: boolean = false
  ) {
    super(configParams, hre, skipSave);
    this.signer = signer;
  }

  getFactory(name: string): Promise<ContractFactory> {
    return ethers.getContractFactory(name);
  }

  async waitForTx(txPromise: Promise<ContractTransaction>) {
    this.log("- tx sent", (await txPromise).hash);
  }

  getEthersSigner = async () => this.signer;

  async getContract<T extends Contract>(factoryN: string, address: string) {
    const factory = await this.getFactory(factoryN);
    const contract = new ethers.Contract(address, factory.interface) as T;
    const signer = await this.getEthersSigner();
    return contract.connect(signer) as T;
  }

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

      return await this.getContract<T>(
        name,
        this.state[`${name}${suffix}`].address
      );
    }

    this.log(`- Deploying ${name}`);

    const factory = await this.getFactory(name);
    const contract = (await factory.deploy(...params, {
      gasPrice: this.config.GAS_PRICE,
    })) as T;

    // wait for the tx
    if (this.config.TX_CONFIRMATIONS > 0) {
      await contract.deployTransaction.wait(this.config.TX_CONFIRMATIONS);
    }

    this.log(`- Deployed ${name}${suffix} at ${contract.address}`);
    this.state[`${name}${suffix}`] = {
      abi: name,
      address: contract.address,
      txHash: contract.deployTransaction.hash,
    };
    this.saveDeployment(this.state);
    await this.verifyContract(`${name}${suffix}`, params);

    return contract;
  }

  async getDeploymentNonce(address: string): Promise<number> {
    return await (await this.getEthersSigner()).getTransactionCount();
  }

  async estimateDeploymentAddress(
    address: string,
    nonce: number
  ): Promise<string> {
    const rlp_encoded = ethers.utils.RLP.encode([
      address,
      ethers.BigNumber.from(nonce.toString()).toHexString(),
    ]);

    const contract_address_long = ethers.utils.keccak256(rlp_encoded);
    const contract_address = "0x".concat(contract_address_long.substring(26));
    return ethers.utils.getAddress(contract_address);
  }
}
