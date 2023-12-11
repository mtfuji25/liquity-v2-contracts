// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {PrismaOwnable} from "../dependencies/PrismaOwnable.sol";
import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract PriceFeedPyth is PrismaOwnable {
    mapping(address => bytes32) public priceIds;
    IPyth public pyth;

    /** Constants ---------------------------------------------------------------------------------------------------- */

    // Used to convert a chainlink price answer to an 18-digit precision uint
    uint256 public constant TARGET_DIGITS = 18;

    // State ------------------------------------------------------------------------------------------------------------

    constructor(address _prismaCore, address _pyth) PrismaOwnable(_prismaCore) {
        pyth = IPyth(_pyth);
    }

    // Admin routines ---------------------------------------------------------------------------------------------------

    function setOracle(address _token, bytes32 _priceId) external onlyOwner {
        priceIds[_token] = _priceId;
    }

    // Public functions -------------------------------------------------------------------------------------------------

    function updateFeeds(bytes[] calldata priceUpdateData) public payable {
        // Update the prices to the latest available values and pay the required fee for it. The `priceUpdateData` data
        // should be retrieved from our off-chain Price Service API using the `pyth-evm-js` package.
        // See section "How Pyth Works on EVM Chains" below for more information.
        uint fee = pyth.getUpdateFee(priceUpdateData);
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);

        // refund remaining eth
        payable(msg.sender).call{value: address(this).balance}("");
    }

    function fetchPrice(address _token) public view returns (uint256) {
        return _fetchPrice(_token);
    }

    function quote(
        address token,
        uint256 amount
    ) external view returns (uint256) {
        uint256 price = _fetchPrice(token);
        return (amount * price) / 1e18;
    }

    // Internal functions -----------------------------------------------------------------------------------------------

    function _fetchPrice(address token) internal view returns (uint256) {
        PythStructs.Price memory price = pyth.getPriceUnsafe(priceIds[token]);
        uint8 decimals = uint8(-1 * int8(price.expo));
        return _scalePriceByDigits(uint256(uint64(price.price)), decimals);
    }

    function _scalePriceByDigits(
        uint256 _price,
        uint8 _answerDigits
    ) internal pure returns (uint256) {
        // Convert the price returned by the oracle to an 18-digit decimal for use.
        uint256 price;
        if (_answerDigits >= TARGET_DIGITS) {
            // Scale the returned price value down to Liquity's target precision
            price = _price / (10 ** (_answerDigits - TARGET_DIGITS));
        } else if (_answerDigits < TARGET_DIGITS) {
            // Scale the returned price value up to Liquity's target precision
            price = _price * (10 ** (TARGET_DIGITS - _answerDigits));
        }
        return price;
    }
}
