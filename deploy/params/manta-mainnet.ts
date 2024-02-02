import { ZERO_ADDRESS } from "../../utils/base/BaseHelper";
import { IParams } from "../../utils/base/interfaces";

const params: IParams = {
  RPC_URL: "https://pacific-rpc.manta.network/http",
  COLLATERALS: [
    {
      // chainlinkOracle: undefined,
      pythId:
        "0xc3883bcf1101c111e9fcfe2465703c47f2b638e21fef2cce0502e6c8f416e0e2",
      address: "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5",
      symbol: "MANTA",
      decimals: 18,
      interestRateInBps: "0",
      capacityE18: "10000000000000000000000", // 10k mint
    },
  ],
  PYTH_ADDRESS: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
  ONEZ: "0x7DB270182E12BFe88Dca47c98cB1eF563C3Ba69B",
  LENDING_POOL_ADDRESS: "0x2f9bB73a8e98793e26Cb2F6C4ad037BDf1C6B269",
  LAYERZERO_ENDPOINT: "0x1a44076050125825900e736c501f859c50fe728c",
  ADMIN_ADDRESS: "0x0F6e98A756A40dD050dC78959f45559F98d3289d",
  DEPLOYER_ADDRESS: "0x0F6e98A756A40dD050dC78959f45559F98d3289d",
  OUTPUT_FILE: "./output/manta-mainnet.json",
  GAS_PRICE: 0.1 * 1000000000, // 0.3 gwei
  TX_CONFIRMATIONS: 3,
  ETHERSCAN_BASE_URL: "https://pacific-explorer.manta.network",
  NETWORK_NAME: "manta",
  MIN_NET_DEBT: 2,
  GAS_COMPENSATION: 10,
};

export default params;
