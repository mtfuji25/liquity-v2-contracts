// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "./BaseDelegate.sol";
import "hardhat/console.sol";

contract ERC20Delegate is BaseDelegate {
    IERC20 public underlying;

    constructor(
        IBorrowerOperations _bo,
        IWrappedLendingCollateral _collateral,
        ITroveManager _tm,
        IERC20 _debt,
        IERC20 _underlying
    ) BaseDelegate(_bo, _collateral, _tm, _debt) {
        underlying = _underlying;
        underlying.approve(address(collateral), type(uint256).max);
    }

    function _mint(uint256 amt) internal override {
        if (amt > 0) {
            underlying.transferFrom(msg.sender, address(this), amt);
            collateral.mint(amt);
        }
    }

    function _flush(address to) internal override {
        uint256 balColl = collateral.balanceOf(address(this));
        uint256 balDebt = debt.balanceOf(address(this));
        uint256 balUnderlying = underlying.balanceOf(address(this));
        if (balColl > 0) collateral.burnTo(to, balColl);
        if (balDebt > 0) debt.transfer(to, balDebt);
        if (balUnderlying > 0) underlying.transfer(to, balUnderlying);
    }
}
