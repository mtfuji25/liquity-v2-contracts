import { ZERO_ADDRESS } from "../../utils/base/BaseHelper";
import { IParams } from "../../utils/base/interfaces";

const params: IParams = {
  RPC_URL: "http://127.0.0.1:8011",
  COLLATERALS: [
    {
      address: "0x4200000000000000000000000000000000000023",
      symbol: "WETH",
      decimals: 18,
      interestRateInBps: "0",
      pythId:
        "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      capacityE18: "10000000000000000000000000", // 100 mil mint
      testnetPriceE8: 1800 * 1e8,
    },
    // {
    //   address: ZERO_ADDRESS,
    //   chainlinkOracleScale: 12,
    //   symbol: "USDC",
    //   decimals: 6,
    //   interestRateInBps: "0",
    //   capacityE18: "10000000000000000000000000", // 100 mil mint
    //   testnetPriceE8: 1 * 1e8,
    // },
  ],
  PYTH_ADDRESS: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
  ONEZ: ZERO_ADDRESS,
  LAYERZERO_ENDPOINT: ZERO_ADDRESS,
  LENDING_POOL_ADDRESS: "0x9e7f49C5173C38f07829E1d0Deba87Fb7C4ebd58",
  ADMIN_ADDRESS: "0x0F6e98A756A40dD050dC78959f45559F98d3289d",
  DEPLOYER_ADDRESS: "0x0F6e98A756A40dD050dC78959f45559F98d3289d",
  OUTPUT_FILE: "./output/blast-sepolia.json",
  GAS_PRICE: 1 * 1000000000, // 5.1 gwei
  TX_CONFIRMATIONS: 1,
  MIN_NET_DEBT: 20,
  GAS_COMPENSATION: 10,
  ETHERSCAN_BASE_URL: "https://testnet.blastscan.io",
  NETWORK_NAME: "blast-sepolia",
};

export default params;
