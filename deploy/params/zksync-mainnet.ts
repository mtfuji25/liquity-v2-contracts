import { ZERO_ADDRESS } from "../../utils/base/BaseHelper";
import { IParams } from "../../utils/base/interfaces";

const params: IParams = {
  RPC_URL: "https://mainnet.era.zksync.io",
  COLLATERALS: [
    {
      pythId:
        "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
      symbol: "WETH",
      decimals: 18,
      interestRateInBps: "0",
      capacityE18: "10000000000000000000000000", // 100 mil mint
    },
  ],

  PYTH_ADDRESS: "0xf087c864AEccFb6A2Bf1Af6A0382B0d0f6c5D834",
  ONEZ: ZERO_ADDRESS,
  LENDING_POOL_ADDRESS: "0x4d9429246EA989C9CeE203B43F6d1C7D83e3B8F8",
  LAYERZERO_ENDPOINT: "0x9b896c0e23220469C7AE69cb4BbAE391eAa4C8da",
  ADMIN_ADDRESS: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
  DEPLOYER_ADDRESS: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
  OUTPUT_FILE: "./output/zksync-mainnet.json",
  GAS_PRICE: 5 * 1000000000, // 5.1 gwei
  TX_CONFIRMATIONS: 3,
  ETHERSCAN_BASE_URL: "https://explorer.zksync.io/",
  NETWORK_NAME: "zksync-mainnet",

  MIN_NET_DEBT: 200,
  GAS_COMPENSATION: 10,
};

export default params;
