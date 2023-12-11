// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {IDelegatedOps} from "../interfaces/IDelegatedOps.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
    @title Prisma Delegated Operations
    @notice Allows delegation to specific contract functionality. Useful for creating
            wrapper contracts to bundle multiple interactions into a single call.

            Functions that supports delegation should include an `account` input allowing
            the delegated caller to indicate who they are calling on behalf of. In executing
            the call, all internal state updates should be applied for `account` and all
            value transfers should occur to or from the caller.

            For example: a delegated call to `openTrove` should transfer collateral
            from the caller, create the debt position for `account`, and send newly
            minted tokens to the caller.
 */
contract DelegatedOps is EIP712, IDelegatedOps {
    using Counters for Counters.Counter;
    mapping(address => Counters.Counter) private _nonces;

    bytes32 public constant DELEGATE_TYPEHASH =
        keccak256(
            "Delegate(address owner,address delegate,bool value,uint256 nonce,uint256 deadline)"
        );

    /**
     * @dev Permit deadline has expired.
     */
    error ERC2612ExpiredSignature(uint256 deadline);

    /**
     * @dev Mismatched signature.
     */
    error ERC2612InvalidSigner(address signer, address owner);

    mapping(address owner => mapping(address caller => bool isApproved))
        public isApprovedDelegate;

    modifier callerOrDelegated(address _account) {
        require(
            msg.sender == _account || isApprovedDelegate[_account][msg.sender],
            "Delegate not approved"
        );
        _;
    }

    constructor() EIP712("ONEZ.cash", "1") {
        // nothing
    }

    function setDelegateApproval(
        address _delegate,
        bool _isApproved
    ) external override {
        isApprovedDelegate[msg.sender][_delegate] = _isApproved;
        emit DelegateApprovalSet(msg.sender, _delegate, _isApproved);
    }

    function revokeDelegateApproval(address _who) external override {
        isApprovedDelegate[_who][msg.sender] = false;
        emit DelegateApprovalSet(_who, msg.sender, false);
    }

    function nonces(
        address owner
    ) public view virtual override returns (uint256) {
        return _nonces[owner].current();
    }

    function setDelegateApprovalWithSig(
        address _who,
        address _delegate,
        bool _isApproved,
        uint256 _deadline,
        bytes memory _signature
    ) public override {
        if (block.timestamp > _deadline) {
            revert ERC2612ExpiredSignature(_deadline);
        }
        bytes32 structHash = keccak256(
            abi.encode(
                DELEGATE_TYPEHASH,
                _who,
                _delegate,
                _isApproved,
                _useNonce(_who),
                _deadline
            )
        );

        bytes32 _hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(_hash, _signature);
        require(signer == _who, "DelegatedOps: invalid signature");

        isApprovedDelegate[_who][_delegate] = _isApproved;
        emit DelegateApprovalSet(_who, _delegate, _isApproved);
    }

    function _useNonce(
        address owner
    ) internal virtual returns (uint256 current) {
        Counters.Counter storage nonce = _nonces[owner];
        current = nonce.current();
        nonce.increment();
    }
}
