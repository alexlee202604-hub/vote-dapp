// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 ^0.8.20;

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.js.

/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 *
 * Example usage to set ERC-1967 implementation slot:
 * ```solidity
 * contract ERC1967 {
 *     // Define the slot. Alternatively, use the SlotDerivation library to derive the slot.
 *     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
 *
 *     function _getImplementation() internal view returns (address) {
 *         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
 *     }
 *
 *     function _setImplementation(address newImplementation) internal {
 *         require(newImplementation.code.length > 0);
 *         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
 *     }
 * }
 * ```
 *
 * TIP: Consider using this library along with {SlotDerivation}.
 */
library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct Int256Slot {
        int256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Int256Slot` with member `value` located at `slot`.
     */
    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns a `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * IMPORTANT: Deprecated. This storage-based reentrancy guard will be removed and replaced
 * by the {ReentrancyGuardTransient} variant in v6.0.
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}

// src/Crowdfunding.sol

/// @notice Campaign status enum
enum CampaignStatus { Active, Success, Failed, Claimed }

/// @notice Campaign data structure
struct Campaign {
    uint256 id;
    address creator;
    string name;
    address token;    // address(0) for ETH, ERC20 address otherwise
    uint256 target;
    uint256 deadline;
    uint256 raised;
    CampaignStatus status;
}

/// @title Crowdfunding - Decentralized crowdfunding platform
/// @notice Users can create campaigns, contribute ETH/ERC20, withdraw on success, or refund on failure
contract Crowdfunding is ReentrancyGuard {
    /// @notice Auto-incrementing campaign ID counter
    uint256 public campaignIdCounter;
    
    /// @notice Campaign data by ID
    mapping(uint256 => Campaign) public campaigns;
    
    /// @notice Contributions by campaign ID and contributor address
    mapping(uint256 => mapping(address => uint256)) public contributions;

    // Custom errors
    error CampaignNotFound();
    error NotCampaignCreator();
    error CampaignNotActive();
    error DeadlinePassed();
    error DeadlineTooShort();
    error TargetMustBePositive();
    error ContributionMustBePositive();
    error NoContributionToRefund();
    error CampaignNotSuccessful();
    error CampaignNotFailed();
    error AlreadyClaimed();
    error TransferFailed();

    // Events
    event CampaignCreated(uint256 indexed id, address indexed creator, string name, address token, uint256 target, uint256 deadline);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event CampaignStatusUpdated(uint256 indexed campaignId, CampaignStatus status);

    /// @notice Create a new crowdfunding campaign
    /// @param name Campaign name
    /// @param token Token address (address(0) for ETH)
    /// @param target Target amount in wei
    /// @param duration Duration in seconds
    /// @return campaignId The ID of the created campaign
    function createCampaign(string calldata name, address token, uint256 target, uint256 duration) external returns (uint256) {
        if (target == 0) revert TargetMustBePositive();
        if (duration < 1 days) revert DeadlineTooShort();
        
        campaignIdCounter++;
        uint256 id = campaignIdCounter;
        
        campaigns[id] = Campaign({
            id: id,
            creator: msg.sender,
            name: name,
            token: token,
            target: target,
            deadline: block.timestamp + duration,
            raised: 0,
            status: CampaignStatus.Active
        });
        
        emit CampaignCreated(id, msg.sender, name, token, target, block.timestamp + duration);
        return id;
    }

    /// @notice Contribute to an active campaign
    /// @param campaignId Campaign ID to contribute to
    /// @param amount Amount to contribute (ignored for ETH, use msg.value)
    function contribute(uint256 campaignId, uint256 amount) external payable nonReentrant {
        Campaign storage camp = campaigns[campaignId];
        if (camp.id == 0) revert CampaignNotFound();
        if (camp.status != CampaignStatus.Active) revert CampaignNotActive();
        if (block.timestamp > camp.deadline) revert DeadlinePassed();
        
        uint256 contributionAmount;
        
        if (camp.token == address(0)) {
            // ETH campaign
            if (msg.value == 0) revert ContributionMustBePositive();
            contributionAmount = msg.value;
        } else {
            // ERC20 campaign - user must have approved the contract
            if (amount == 0) revert ContributionMustBePositive();
            contributionAmount = amount;
            IERC20(camp.token).transferFrom(msg.sender, address(this), amount);
        }
        
        contributions[campaignId][msg.sender] += contributionAmount;
        camp.raised += contributionAmount;
        
        emit ContributionMade(campaignId, msg.sender, contributionAmount);
        
        // Auto-check if goal reached
        if (camp.raised >= camp.target) {
            camp.status = CampaignStatus.Success;
            emit CampaignStatusUpdated(campaignId, CampaignStatus.Success);
        }
    }

    /// @notice Withdraw funds after a successful campaign (creator only)
    /// @param campaignId Campaign ID to withdraw from
    function withdraw(uint256 campaignId) external nonReentrant {
        _updateStatus(campaignId);
        
        Campaign storage camp = campaigns[campaignId];
        if (camp.id == 0) revert CampaignNotFound();
        if (msg.sender != camp.creator) revert NotCampaignCreator();
        if (camp.status != CampaignStatus.Success) revert CampaignNotSuccessful();
        
        camp.status = CampaignStatus.Claimed;
        uint256 amount = camp.raised;
        camp.raised = 0;
        
        emit CampaignStatusUpdated(campaignId, CampaignStatus.Claimed);
        emit FundsWithdrawn(campaignId, msg.sender, amount);
        
        if (camp.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            if (!IERC20(camp.token).transfer(msg.sender, amount)) revert TransferFailed();
        }
    }

    /// @notice Get a refund if the campaign failed (contributors only)
    /// @param campaignId Campaign ID to refund from
    function refund(uint256 campaignId) external nonReentrant {
        _updateStatus(campaignId);
        
        Campaign storage camp = campaigns[campaignId];
        if (camp.id == 0) revert CampaignNotFound();
        if (camp.status != CampaignStatus.Failed) revert CampaignNotFailed();
        
        uint256 amount = contributions[campaignId][msg.sender];
        if (amount == 0) revert NoContributionToRefund();
        
        contributions[campaignId][msg.sender] = 0;
        
        emit RefundIssued(campaignId, msg.sender, amount);
        
        if (camp.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            if (!IERC20(camp.token).transfer(msg.sender, amount)) revert TransferFailed();
        }
    }

    /// @notice Get campaign details
    /// @param campaignId Campaign ID
    /// @return Campaign struct
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        Campaign memory camp = campaigns[campaignId];
        if (camp.id == 0) revert CampaignNotFound();
        return camp;
    }

    /// @notice Get user's contribution to a campaign
    /// @param campaignId Campaign ID
    /// @param user User address
    /// @return Amount contributed
    function getUserContribution(uint256 campaignId, address user) external view returns (uint256) {
        return contributions[campaignId][user];
    }

    /// @notice Internal: Update campaign status based on deadline
    /// @param campaignId Campaign ID
    function _updateStatus(uint256 campaignId) internal {
        Campaign storage camp = campaigns[campaignId];
        if (camp.status != CampaignStatus.Active) return;
        if (block.timestamp <= camp.deadline) return;
        
        camp.status = camp.raised >= camp.target ? CampaignStatus.Success : CampaignStatus.Failed;
        emit CampaignStatusUpdated(campaignId, camp.status);
    }
}
