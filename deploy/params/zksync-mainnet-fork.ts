import { IParams } from "../../utils/base/interfaces";
import goerli from "./zksync-mainnet";

const params: IParams = {
  ...goerli,
  RPC_URL: "http://127.0.0.1:8011",
  ETHERSCAN_BASE_URL: "",
  TX_CONFIRMATIONS: 0,
  OUTPUT_FILE: "./output/zksync-mainnet-fork.json",
  NETWORK_NAME: "zksync-fork",
  DEPLOYER_ADDRESS: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
};

export default params;
