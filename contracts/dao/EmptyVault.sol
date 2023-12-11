// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

contract EmptyVault {
    function allocateNewEmissions(uint256) external pure returns (uint256) {
        return 0;
    }
}
