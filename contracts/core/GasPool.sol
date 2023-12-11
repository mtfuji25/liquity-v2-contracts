// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
    @title Prisma Gas Pool
    @notice Placeholder contract for tokens to be used as gas compensation
            See https://github.com/liquity/dev#gas-compensation
 */
contract GasPool {
    constructor(address debtToken, address onez) {
        // give approval for burns
        IERC20(onez).approve(address(debtToken), type(uint256).max);
    }
}
