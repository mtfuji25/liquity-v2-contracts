// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MintableERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(_msgSender(), 1000e18);
    }

    function mint(uint256 value) public returns (bool) {
        _mint(_msgSender(), value);
        return true;
    }

    function burn(uint256 value) public returns (bool) {
        _burn(_msgSender(), value);
        return true;
    }

    function mint(address account, uint256 value) public returns (bool) {
        _mint(account, value);
        return true;
    }

    function burn(address account, uint256 value) public returns (bool) {
        _burn(account, value);
        return true;
    }

    function deposit() public payable {
        _mint(msg.sender, msg.value);
    }

    function withdraw(uint256 wad) public {
        _burn(msg.sender, wad);
        (bool success, ) = msg.sender.call{value: wad}("");
        require(success, "Withdraw failed");
    }
}
