// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IPriceFeed {
    event NewOracleRegistered(
        address token,
        address chainlinkAggregator,
        bool isEthIndexed
    );
    event PriceFeedStatusUpdated(address token, address oracle, bool isWorking);
    event PriceRecordUpdated(address indexed token, uint256 _price);

    function fetchPrice(address _token) external returns (uint256);

    function setOracle(
        address _token,
        address _chainlinkOracle,
        bytes4 sharePriceSignature,
        uint8 sharePriceDecimals,
        bool _isEthIndexed
    ) external;
}
