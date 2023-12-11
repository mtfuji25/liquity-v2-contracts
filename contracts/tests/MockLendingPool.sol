// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../interfaces/ILendingPool.sol";
import "./MintableERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

contract MockLendingPool is ILendingPool {
    mapping(IERC20 => MintableERC20) aTokenMapping;

    function initReserve(IERC20Metadata asset) external {
        if (aTokenMapping[asset] != MintableERC20(address(0))) return;
        MintableERC20 a = new MintableERC20(asset.name(), asset.symbol());
        aTokenMapping[asset] = a;
    }

    function supply(
        address _reserve,
        uint256 _amount,
        address _to,
        uint16
    ) external {
        MintableERC20 a = aTokenMapping[IERC20(_reserve)];
        IERC20(_reserve).transferFrom(msg.sender, address(this), _amount);
        a.mint(_to, _amount);
    }

    function withdraw(
        address _reserve,
        uint256 _amount,
        address to
    ) external returns (uint256) {
        MintableERC20 a = aTokenMapping[IERC20(_reserve)];

        IERC20(_reserve).transfer(to, _amount);
        a.burn(msg.sender, _amount);
        return _amount;
    }

    function getReserveData(
        address asset
    ) external view returns (ReserveData memory k) {
        k.aTokenAddress = address(aTokenMapping[IERC20(asset)]);
    }
}
