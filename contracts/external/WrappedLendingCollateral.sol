// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../interfaces/ILendingPool.sol";
import "../interfaces/IWrappedLendingCollateral.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract WrappedLendingCollateral is
    Initializable,
    ReentrancyGuardUpgradeable,
    IWrappedLendingCollateral,
    ERC20Upgradeable
{
    using SafeERC20 for IERC20;

    address public borrowerOperations;
    bool public enableETH;
    IERC20 public aToken;
    IERC20 public underlying;
    ILendingPool public pool;
    uint256 public scale;

    function initialize(
        string memory name,
        string memory symbol,
        ILendingPool _pool,
        IERC20 _underlying,
        address _borrowerOperations
    ) external initializer {
        __ERC20_init(name, symbol);
        __ReentrancyGuard_init();

        pool = _pool;
        underlying = _underlying;
        borrowerOperations = _borrowerOperations;

        // get the atoken
        ILendingPool.ReserveData memory data = pool.getReserveData(
            address(underlying)
        );
        aToken = IERC20(data.aTokenAddress);

        // give approval to the pool
        aToken.approve(address(_pool), type(uint256).max);
        IERC20(underlying).approve(address(_pool), type(uint256).max);
    }

    function mint(uint256 amount) external payable override nonReentrant {
        underlying.safeTransferFrom(msg.sender, address(this), amount);

        _mint(msg.sender, amount);
        pool.supply(address(underlying), amount, address(this), 0);
    }

    function burnTo(address to, uint256 amount) external override nonReentrant {
        if (amount == 0) return;

        uint256 percentageOfSupply = (amount * 1e18) / totalSupply();
        uint256 aTokensHeld = aToken.balanceOf(address(this));
        uint256 aTokensToRedeem = (aTokensHeld * percentageOfSupply) / 1e18;

        _burn(msg.sender, amount);
        pool.withdraw(address(underlying), aTokensToRedeem, to);
    }
}
