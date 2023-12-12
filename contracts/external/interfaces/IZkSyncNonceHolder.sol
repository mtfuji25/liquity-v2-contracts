// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IZkSyncNonceHolder {
    function getDeploymentNonce(
        address _address
    ) external view returns (uint256);
}
