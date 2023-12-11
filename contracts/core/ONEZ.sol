// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../interfaces/IONEZ.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ONEZ is ERC20, AccessControl, IONEZ {
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(address => Facilitator) internal _facilitators;
    EnumerableSet.AddressSet internal _facilitatorsList;

    bytes32 public constant override FACILITATOR_MANAGER_ROLE =
        keccak256("FACILITATOR_MANAGER_ROLE");

    bytes32 public constant override BUCKET_MANAGER_ROLE =
        keccak256("BUCKET_MANAGER_ROLE");

    constructor() ERC20("ONEZ Stablecoin", "ONEZ") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(FACILITATOR_MANAGER_ROLE, msg.sender);
        _setupRole(BUCKET_MANAGER_ROLE, msg.sender);
    }

    function mint(address account, uint256 amount) external override {
        require(amount > 0, "INVALID_MINT_AMOUNT");
        Facilitator storage f = _facilitators[msg.sender];

        uint256 currentBucketLevel = f.bucketLevel;
        uint256 newBucketLevel = currentBucketLevel + amount;
        require(
            f.bucketCapacity >= newBucketLevel,
            "FACILITATOR_BUCKET_CAPACITY_EXCEEDED"
        );
        f.bucketLevel = uint128(newBucketLevel);

        _mint(account, amount);

        emit FacilitatorBucketLevelUpdated(
            msg.sender,
            currentBucketLevel,
            newBucketLevel
        );
    }

    function burn(uint256 amount) external override {
        require(amount > 0, "INVALID_BURN_AMOUNT");

        Facilitator storage f = _facilitators[msg.sender];
        uint256 currentBucketLevel = f.bucketLevel;
        uint256 newBucketLevel = currentBucketLevel - amount;
        f.bucketLevel = uint128(newBucketLevel);

        _burn(msg.sender, amount);

        emit FacilitatorBucketLevelUpdated(
            msg.sender,
            currentBucketLevel,
            newBucketLevel
        );
    }

    function addFacilitator(
        address facilitatorAddress,
        string calldata facilitatorLabel,
        uint128 bucketCapacity
    ) external override onlyRole(FACILITATOR_MANAGER_ROLE) {
        Facilitator storage facilitator = _facilitators[facilitatorAddress];
        require(
            bytes(facilitator.label).length == 0,
            "FACILITATOR_ALREADY_EXISTS"
        );
        require(bytes(facilitatorLabel).length > 0, "INVALID_LABEL");

        facilitator.label = facilitatorLabel;
        facilitator.bucketCapacity = bucketCapacity;

        _facilitatorsList.add(facilitatorAddress);

        emit FacilitatorAdded(
            facilitatorAddress,
            keccak256(abi.encodePacked(facilitatorLabel)),
            bucketCapacity
        );
    }

    function removeFacilitator(
        address facilitatorAddress
    ) external override onlyRole(FACILITATOR_MANAGER_ROLE) {
        require(
            bytes(_facilitators[facilitatorAddress].label).length > 0,
            "FACILITATOR_DOES_NOT_EXIST"
        );
        require(
            _facilitators[facilitatorAddress].bucketLevel == 0,
            "FACILITATOR_BUCKET_LEVEL_NOT_ZERO"
        );

        delete _facilitators[facilitatorAddress];
        _facilitatorsList.remove(facilitatorAddress);

        emit FacilitatorRemoved(facilitatorAddress);
    }

    function setFacilitatorBucketCapacity(
        address facilitator,
        uint128 newCapacity
    ) external override onlyRole(BUCKET_MANAGER_ROLE) {
        require(
            bytes(_facilitators[facilitator].label).length > 0,
            "FACILITATOR_DOES_NOT_EXIST"
        );

        uint256 oldCapacity = _facilitators[facilitator].bucketCapacity;
        _facilitators[facilitator].bucketCapacity = newCapacity;

        emit FacilitatorBucketCapacityUpdated(
            facilitator,
            oldCapacity,
            newCapacity
        );
    }

    function getFacilitator(
        address facilitator
    ) external view override returns (Facilitator memory) {
        return _facilitators[facilitator];
    }

    function getFacilitatorBucket(
        address facilitator
    ) external view override returns (uint256, uint256) {
        return (
            _facilitators[facilitator].bucketCapacity,
            _facilitators[facilitator].bucketLevel
        );
    }

    function getFacilitatorsList()
        external
        view
        override
        returns (address[] memory)
    {
        return _facilitatorsList.values();
    }
}
