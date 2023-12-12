import { IParams } from "../../utils/base/interfaces";
import goerli from "./zksync-goerli";

const params: IParams = {
  ...goerli,
  RPC_URL: "http://127.0.0.1:8011",
  ETHERSCAN_BASE_URL: "",
  DEPLOYER_ADDRESS: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
  ADMIN_ADDRESS: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
  OUTPUT_FILE: "./output/zksync-goerli-fork.json",
  NETWORK_NAME: "zksync-fork",
};

export default params;
