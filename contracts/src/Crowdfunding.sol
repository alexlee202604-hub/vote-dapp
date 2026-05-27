// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
