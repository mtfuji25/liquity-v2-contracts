import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IParams, IState } from "./interfaces";
import * as ethers from "ethers";
import fs from "fs";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default abstract class BaseHelper {
  hre: HardhatRuntimeEnvironment;

  public state: IState;
  public config: IParams;
  public skipSave: boolean;

  constructor(
    configParams: IParams,
    hre: HardhatRuntimeEnvironment,
    skipSave: boolean = false
  ) {
    this.state = {};
    this.hre = hre;
    this.config = configParams;
    this.skipSave = skipSave;
  }

  loadPreviousDeployment() {
    if (fs.existsSync(this.config.OUTPUT_FILE)) {
      this.log();
      this.log(`------  Loading previous deployment ------ `);
      const text = fs.readFileSync(this.config.OUTPUT_FILE);
      this.state = JSON.parse(text.toString());
      this.log(`------  Done loading previous deployment ------ `);
      this.log();
    }
  }

  saveDeployment(_state: IState) {
    if (this.skipSave) return;
    const state = JSON.stringify(_state, null, 2);
    fs.writeFileSync(this.config.OUTPUT_FILE, state);
  }

  abstract waitForTx(
    txPromise: Promise<ethers.ContractTransaction>
  ): Promise<void>;

  abstract getEthersSigner(privateKey?: string): Promise<ethers.Signer>;

  abstract deployContract<T extends Contract>(
    factoryName: string,
    params?: any[],
    suffix?: string
  ): Promise<T>;

  async getSavedContract<T extends Contract>(factoryN: string, prefix: string) {
    const id = `${prefix}${factoryN}`;
    return await this.getContract<T>(factoryN, this.state[id].address);
  }

  abstract getContract<T extends Contract>(
    factoryN: string,
    address: string
  ): Promise<T>;

  // --- Verify on Ethrescan ---

  protected async verifyContract(
    name: string,
    constructorArguments: any[] = []
  ) {
    if (
      this.skipSave ||
      !this.config.ETHERSCAN_BASE_URL ||
      this.config.ETHERSCAN_BASE_URL === ""
    )
      return;

    if (!this.state[name] || !this.state[name].address) {
      console.error(`- No deployment state for contract ${name}!!`);
      return;
    }

    if (this.state[name].verification) {
      this.log(`- Contract ${name} already verified`);
      return;
    }

    try {
      this.log(`- Contract ${name} is being verified`);
      await this.hre.run("verify:verify", {
        address: this.state[name].address,
        constructorArguments,
      });
    } catch (error: any) {
      this.log(error);
      if (error.name != "NomicLabsHardhatPluginError") {
        console.error(`- Error verifying: ${error.name}`);
        console.error(error);
        return;
      }
    }

    this.state[
      name
    ].verification = `${this.config.ETHERSCAN_BASE_URL}/address/${this.state[name].address}#code`;
    this.saveDeployment(this.state);
  }

  log(...msg: string[]) {
    console.log(...msg);
  }
}
