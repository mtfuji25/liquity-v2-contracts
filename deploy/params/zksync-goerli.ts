import { ZERO_ADDRESS } from "../../utils/base/BaseHelper";
import { IParams } from "../../utils/base/interfaces";

const params: IParams = {
  RPC_URL: "https://testnet.era.zksync.dev",
  COLLATERALS: [
    {
      pythId:
        "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
      address: "0x81d6b98beb0a4288dcfab724fdeae52e5aa2f7b1",
      symbol: "WETH",
      decimals: 18,
      interestRateInBps: "0",
      capacityE18: "10000000000000000000000000", // 100 mil mint
    },
    {
      pythId:
        "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722",
      address: "0x9223dc9205cf8336ca59ba0bd390647e62d487e5",
      symbol: "USDC",
      decimals: 6,
      interestRateInBps: "0",
      capacityE18: "10000000000000000000000000", // 100 mil mint
    },
  ],

  PYTH_ADDRESS: "0xC38B1dd611889Abc95d4E0a472A667c3671c08DE",
  ONEZ: ZERO_ADDRESS,
  LAYERZERO_ENDPOINT: ZERO_ADDRESS,
  LENDING_POOL_ADDRESS: "0xC4b785A74b3d8EBE75C8d0b8Ff960d66527CAE63",
  ADMIN_ADDRESS: "0xb76F765A785eCa438e1d95f594490088aFAF9acc",
  DEPLOYER_ADDRESS: "0xb76F765A785eCa438e1d95f594490088aFAF9acc",
  OUTPUT_FILE: "./output/zksync-goerli.json",
  GAS_PRICE: 5 * 1000000000,
  TX_CONFIRMATIONS: 0,
  ETHERSCAN_BASE_URL: "https://goerli.explorer.zksync.io",
  NETWORK_NAME: "zksync-goerli",
  MIN_NET_DEBT: 200,
  GAS_COMPENSATION: 10,
};

export default params;
