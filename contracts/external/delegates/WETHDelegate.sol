// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../../interfaces/IWETH.sol";
import "./BaseDelegate.sol";

contract WETHDelegate is BaseDelegate {
    IWETH public weth;

    constructor(
        IBorrowerOperations _bo,
        IWrappedLendingCollateral _collateral,
        ITroveManager _tm,
        IERC20 _debt,
        IWETH _weth
    ) BaseDelegate(_bo, _collateral, _tm, _debt) {
        weth = _weth;
        weth.approve(address(collateral), type(uint256).max);
    }

    receive() external payable {
        // do nothing
    }

    function _mint(uint256 amt) internal override {
        require(msg.value == amt, "invalid amt");
        // convert to weth and deposit into the lending protocol
        if (msg.value > 0) {
            weth.deposit{value: msg.value}();
            collateral.mint(msg.value);
        }
    }

    function _flush(address to) internal override {
        uint256 balColl = collateral.balanceOf(address(this));
        uint256 balDebt = debt.balanceOf(address(this));

        // withdraw from the lending protocol and withraw from weth
        if (balColl > 0) {
            collateral.burnTo(address(this), balColl);
            weth.withdraw(balColl);

            // we use address(this).balance because the difference from balColl and
            // address(this).balance is accumulated the yield
            (bool callSuccess, ) = to.call{value: address(this).balance}("");
            require(callSuccess, "eth transfer failed");
        }

        if (balDebt > 0) debt.transfer(to, balDebt);
    }
}
