// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IZkSyncDeployer {
    function getNewAddressCreate(
        address _sender,
        uint256 _senderNonce
    ) external pure returns (address newAddress);
}
