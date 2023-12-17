// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../../interfaces/IDelegatedOps.sol";
import "../../interfaces/IBorrowerOperations.sol";
import "../../interfaces/IWrappedLendingCollateral.sol";
import "../../interfaces/ITroveManager.sol";

abstract contract BaseDelegate {
    IBorrowerOperations public bo;
    IWrappedLendingCollateral public collateral;
    ITroveManager public tm;
    IERC20 public debt;

    constructor(
        IBorrowerOperations _bo,
        IWrappedLendingCollateral _collateral,
        ITroveManager _tm,
        IERC20 _debt
    ) {
        bo = _bo;
        collateral = _collateral;
        tm = _tm;
        debt = _debt;

        collateral.approve(address(bo), type(uint256).max);
        collateral.approve(address(tm), type(uint256).max);
        debt.approve(address(bo.debtToken()), type(uint256).max);
    }

    modifier validateSignature(uint256 _deadline, bytes memory _signature) {
        bo.setDelegateApprovalWithSig(
            msg.sender,
            address(this),
            true,
            _deadline,
            _signature
        );
        _;
        bo.revokeDelegateApproval(msg.sender);
    }

    function openTrove(
        uint256 _maxFeePercentage,
        uint256 _debtAmount,
        uint256 _collAmount,
        address _upperHint,
        address _lowerHint,
        uint256 _deadline,
        bytes memory signature
    ) external payable validateSignature(_deadline, signature) {
        _mint(_collAmount);
        bo.openTrove(
            address(tm),
            msg.sender,
            _maxFeePercentage,
            _collAmount,
            _debtAmount,
            _upperHint,
            _lowerHint
        );
        _flush(msg.sender);
    }

    function adjustTrove(
        uint256 _maxFeePercentage,
        uint256 _collDeposit,
        uint256 _collWithdrawal,
        uint256 _debtChange,
        bool _isDebtIncrease,
        address _upperHint,
        address _lowerHint,
        uint256 _deadline,
        bytes memory signature
    ) external payable validateSignature(_deadline, signature) {
        _mint(_collDeposit);

        if (!_isDebtIncrease)
            debt.transferFrom(msg.sender, address(this), _debtChange);

        bo.adjustTrove(
            address(tm),
            msg.sender,
            _maxFeePercentage,
            _collDeposit,
            _collWithdrawal,
            _debtChange,
            _isDebtIncrease,
            _upperHint,
            _lowerHint
        );
        _flush(msg.sender);
    }

    function closeTrove(
        uint256 _deadline,
        bytes memory signature
    ) external validateSignature(_deadline, signature) {
        (, uint256 _debt) = tm.getTroveCollAndDebt(msg.sender);
        debt.transferFrom(
            msg.sender,
            address(this),
            _debt - tm.DEBT_GAS_COMPENSATION()
        );
        bo.closeTrove(address(tm), msg.sender);
        _flush(msg.sender);
    }

    function _flush(address to) internal virtual;

    function _mint(uint256 amt) internal virtual;
}
