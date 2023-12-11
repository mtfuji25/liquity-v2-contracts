// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../dependencies/PrismaOwnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IONEZ.sol";
import "../interfaces/IPrismaCore.sol";
import "../interfaces/IDebtTokenOnezProxy.sol";

/// @dev A proxy contract that abstracts the minting and burning to the onez token.
contract DebtTokenOnezProxy is PrismaOwnable, IDebtTokenOnezProxy {
    IONEZ public onez;

    // --- Addresses ---
    address public stabilityPoolAddress;
    address public borrowerOperationsAddress;
    address public factory;
    address public gasPool;

    mapping(address => bool) public troveManager;

    // Amount of debt to be locked in gas pool on opening troves
    uint256 public DEBT_GAS_COMPENSATION;

    constructor(
        address _prismaCore,
        IONEZ _onez,
        address _stabilityPoolAddress,
        address _borrowerOperationsAddress,
        address _factory,
        address _gasPool,
        uint256 _gasCompensation
    ) PrismaOwnable(_prismaCore) {
        onez = _onez;
        stabilityPoolAddress = _stabilityPoolAddress;
        borrowerOperationsAddress = _borrowerOperationsAddress;
        factory = _factory;
        gasPool = _gasPool;
        DEBT_GAS_COMPENSATION = _gasCompensation;
    }

    function enableTroveManager(address _troveManager) external {
        require(msg.sender == factory, "!Factory");
        troveManager[_troveManager] = true;
    }

    function balanceOf(address account) external view returns (uint256) {
        return onez.balanceOf(account);
    }

    function underlying() external view returns (IERC20) {
        return IERC20(onez);
    }

    // --- Functions for intra-Prisma calls ---

    function mintWithGasCompensation(
        address _account,
        uint256 _amount
    ) external returns (bool) {
        require(msg.sender == borrowerOperationsAddress);
        onez.mint(_account, _amount);
        onez.mint(gasPool, DEBT_GAS_COMPENSATION);
        return true;
    }

    function burnWithGasCompensation(
        address _account,
        uint256 _amount
    ) external returns (bool) {
        require(msg.sender == borrowerOperationsAddress);
        onez.transferFrom(_account, address(this), _amount);
        onez.transferFrom(gasPool, address(this), DEBT_GAS_COMPENSATION);
        onez.burn(_amount + DEBT_GAS_COMPENSATION);
        return true;
    }

    function mint(address _account, uint256 _amount) external {
        require(
            msg.sender == borrowerOperationsAddress || troveManager[msg.sender],
            "Debt: Caller not BO/TM"
        );
        onez.mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) external {
        require(troveManager[msg.sender], "Debt: Caller not TroveManager");
        onez.transferFrom(_account, address(this), _amount);
        onez.burn(_amount);
    }

    function sendToSP(address _sender, uint256 _amount) external {
        require(
            msg.sender == stabilityPoolAddress,
            "Debt: Caller not StabilityPool"
        );
        onez.transferFrom(_sender, msg.sender, _amount);
    }

    function returnFromPool(
        address _poolAddress,
        address _receiver,
        uint256 _amount
    ) external {
        require(
            msg.sender == stabilityPoolAddress || troveManager[msg.sender],
            "Debt: Caller not TM/SP"
        );
        onez.transferFrom(_poolAddress, _receiver, _amount);
    }
}
