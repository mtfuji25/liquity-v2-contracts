import { IParams } from "../../utils/base/interfaces";
import mainnet from "./zksync-mainnet";

const params: IParams = {
  ...mainnet,
  OUTPUT_FILE: "./output/zksync-fork.json",
  LENDING_POOL_ADDRESS: "",
  TX_CONFIRMATIONS: 0,
  ETHERSCAN_BASE_URL: undefined,
  NETWORK_NAME: "zksync-fork",
};

export default params;
