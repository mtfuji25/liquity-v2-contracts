// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Transaction, IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from "./interfaces/IPaymaster.sol";
// import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";
import {BOOTLOADER_ADDRESS} from "./interfaces/L2ContractHelper.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SimplePaymaster is IPaymaster, Ownable {
    event TransactionPaid(uint256 fee);

    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_ADDRESS,
            "Only bootloader can call this method"
        );
        // Continue execution if called from the bootloader.
        _;
    }

    function validateAndPayForPaymasterTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable onlyBootloader returns (bytes4, bytes memory) {
        // Note, that while the minimal amount of ETH needed is tx.gasPrice * tx.gasLimit,
        // neither paymaster nor account are allowed to access this context variable.
        uint256 requiredETH = _transaction.gasLimit * _transaction.maxFeePerGas;

        // The bootloader never returns any data, so it can safely be ignored here.
        (bool success, ) = payable(BOOTLOADER_ADDRESS).call{value: requiredETH}(
            ""
        );

        emit TransactionPaid(requiredETH);

        require(
            success,
            "Failed to transfer tx fee to the bootloader. Paymaster balance might not be enough."
        );

        return (PAYMASTER_VALIDATION_SUCCESS_MAGIC, "");
    }

    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable override onlyBootloader {
        // Refunds are not supported yet.
    }

    function refundETH() public payable onlyOwner {
        payable(address(owner())).transfer(address(this).balance);
    }

    receive() external payable {}
}
