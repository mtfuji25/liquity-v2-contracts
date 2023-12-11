// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IPrismaCore.sol";

interface IPrismaOwnable {
    function PRISMA_CORE() external view returns (IPrismaCore);

    function owner() external view returns (address);

    function guardian() external view returns (address);
}
