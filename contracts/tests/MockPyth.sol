// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

contract MockPyth is IPyth {
    mapping(bytes32 => int64) public prices;
    mapping(bytes32 => int32) public expos;

    function setPrice(bytes32 id, int64 price, int32 expo) external {
        prices[id] = price;
        expos[id] = expo;
    }

    function getPriceUnsafe(
        bytes32 id
    ) external view returns (PythStructs.Price memory price) {
        price.price = prices[id];
        price.conf = 100;
        price.expo = expos[id];
        price.publishTime = block.timestamp;
    }

    function getValidTimePeriod()
        external
        view
        override
        returns (uint validTimePeriod)
    {
        return 0;
    }

    function getPrice(
        bytes32 id
    ) external view override returns (PythStructs.Price memory price) {}

    function getEmaPrice(
        bytes32 id
    ) external view override returns (PythStructs.Price memory price) {}

    function getPriceNoOlderThan(
        bytes32 id,
        uint age
    ) external view override returns (PythStructs.Price memory price) {}

    function getEmaPriceUnsafe(
        bytes32 id
    ) external view override returns (PythStructs.Price memory price) {}

    function getEmaPriceNoOlderThan(
        bytes32 id,
        uint age
    ) external view override returns (PythStructs.Price memory price) {}

    function updatePriceFeeds(
        bytes[] calldata updateData
    ) external payable override {}

    function updatePriceFeedsIfNecessary(
        bytes[] calldata updateData,
        bytes32[] calldata priceIds,
        uint64[] calldata publishTimes
    ) external payable override {}

    function getUpdateFee(
        bytes[] calldata updateData
    ) external view override returns (uint feeAmount) {}

    function parsePriceFeedUpdates(
        bytes[] calldata updateData,
        bytes32[] calldata priceIds,
        uint64 minPublishTime,
        uint64 maxPublishTime
    )
        external
        payable
        override
        returns (PythStructs.PriceFeed[] memory priceFeeds)
    {}

    function parsePriceFeedUpdatesUnique(
        bytes[] calldata updateData,
        bytes32[] calldata priceIds,
        uint64 minPublishTime,
        uint64 maxPublishTime
    )
        external
        payable
        override
        returns (PythStructs.PriceFeed[] memory priceFeeds)
    {}
}
