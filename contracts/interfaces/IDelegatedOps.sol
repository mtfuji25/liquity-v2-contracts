// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IDelegatedOps {
    event DelegateApprovalSet(
        address indexed caller,
        address indexed delegate,
        bool isApproved
    );

    function isApprovedDelegate(
        address _delegate,
        address caller
    ) external returns (bool isApproved);

    function setDelegateApproval(address _delegate, bool _isApproved) external;

    function setDelegateApprovalWithSig(
        address _who,
        address _delegate,
        bool _isApproved,
        uint256 deadline,
        bytes memory signature
    ) external;

    function nonces(address owner) external view returns (uint256);

    function revokeDelegateApproval(address _who) external;
}
