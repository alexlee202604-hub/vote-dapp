// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/Crowdfunding.sol";
import "../src/ZKVoting.sol";
import "./MockVerifier.sol";

/// @notice Simple ERC20 for testing
contract TestERC20 is ERC20 {
    constructor() ERC20("Test", "TST") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

/// @notice Enhanced coverage tests for Crowdfunding (ERC20 paths) and ZKVoting (vote success)
contract EnhancedCoverageTest is Test {
    Crowdfunding public crowdfunding;
    ZKVoting public voting;
    MockVerifier public mockVerifier;
    TestERC20 public token;

    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);

    uint256 constant TARGET = 10 ether;
    uint256 constant DURATION = 7 days;

    event CampaignCreated(uint256 indexed id, address indexed creator, address token, uint256 target, uint256 deadline);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event CampaignStatusUpdated(uint256 indexed campaignId, CampaignStatus status);
    event ProposalCreated(uint256 indexed id, string description, uint256 deadline);
    event VoteCast(uint256 indexed nullifier, uint256 voteHash);

    function setUp() public {
        crowdfunding = new Crowdfunding();
        token = new TestERC20();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);

        // Transfer tokens to users
        token.transfer(bob, 1000 * 10**18);
        token.transfer(charlie, 1000 * 10**18);

        // Setup ZK voting
        mockVerifier = new MockVerifier();
        voting = new ZKVoting(address(mockVerifier));
        vm.warp(1000000);
    }

    // =========== CROWDFUNDING ERC20 TESTS ===========

    function test_ERC20Contribute() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(token), TARGET, DURATION);

        vm.prank(bob);
        token.approve(address(crowdfunding), 1 ether);

        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit ContributionMade(id, bob, 1 ether);
        crowdfunding.contribute(id, 1 ether);

        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(camp.raised, 1 ether);
        assertEq(camp.token, address(token));
        assertEq(crowdfunding.getUserContribution(id, bob), 1 ether);
    }

    function test_ERC20ContributeReachTarget() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(token), 1 ether, DURATION);

        vm.prank(bob);
        token.approve(address(crowdfunding), 1 ether);

        vm.prank(bob);
        crowdfunding.contribute(id, 1 ether);

        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(uint256(camp.status), uint256(CampaignStatus.Success));
    }

    function test_ERC20ContributeRevertZeroAmount() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(token), TARGET, DURATION);

        vm.prank(bob);
        vm.expectRevert(Crowdfunding.ContributionMustBePositive.selector);
        crowdfunding.contribute(id, 0);
    }

    function test_ERC20ContributeAndWithdraw() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(token), 1 ether, DURATION);

        // Bob has tokens from setUp - approve and contribute
        vm.startPrank(bob);
        token.approve(address(crowdfunding), 1 ether);
        crowdfunding.contribute(id, 1 ether);
        vm.stopPrank();

        // Alice withdraws
        uint256 balanceBefore = token.balanceOf(alice);
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit FundsWithdrawn(id, alice, 1 ether);
        crowdfunding.withdraw(id);

        assertEq(token.balanceOf(alice) - balanceBefore, 1 ether);
        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(uint256(camp.status), uint256(CampaignStatus.Claimed));
    }

    function test_ERC20RefundFailedCampaign() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(token), 100 ether, DURATION);

        vm.startPrank(bob);
        token.approve(address(crowdfunding), 2 ether);
        crowdfunding.contribute(id, 1 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + DURATION + 1);

        uint256 balanceBefore = token.balanceOf(bob);
        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit RefundIssued(id, bob, 1 ether);
        crowdfunding.refund(id);

        assertEq(token.balanceOf(bob) - balanceBefore, 1 ether);
        assertEq(crowdfunding.getUserContribution(id, bob), 0);
    }

    function test_UpdateStatusNoChangeWhenAlreadySuccess() public {
        // When status is already Success, _updateStatus should not change it
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 1 ether, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);

        // Campaign is now Success, warp past deadline
        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(alice);
        crowdfunding.withdraw(id); // internally calls _updateStatus

        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(uint256(camp.status), uint256(CampaignStatus.Claimed));
    }

    function test_UpdateStatusNoChangeBeforeDeadline() public {
        // When deadline hasn't passed, _updateStatus should not change status
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), TARGET, DURATION);

        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);

        // Warp to just before deadline
        vm.warp(block.timestamp + DURATION - 1);

        // Call refund - _updateStatus runs but should see deadline hasn't passed
        // But refund requires Failed status, so it won't happen
        // Instead, we test that withdraw doesn't work (needs success)
        vm.prank(alice);
        vm.expectRevert(Crowdfunding.CampaignNotSuccessful.selector);
        crowdfunding.withdraw(id);
    }

    // =========== ZK VOTING VOTE SUCCESS PATHS ===========

    function _emptyProof() internal pure returns (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) {
        pA = [uint(0), 0];
        pB[0] = [uint(0), 0];
        pB[1] = [uint(0), 0];
        pC = [uint(0), 0];
    }

    function test_YesVoteSuccess() public {
        vm.prank(alice);
        uint256 id = voting.createProposal("Test", 7 days);

        (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) = _emptyProof();
        uint[4] memory pubSignals = [uint(12345), 0, id, 0]; // voteHash=0 → even → yes vote

        vm.expectEmit(true, true, false, false);
        emit VoteCast(12345, 0);
        voting.vote(pA, pB, pC, pubSignals);

        Proposal memory prop = voting.getProposal(id);
        assertEq(prop.yesVotes, 1);
        assertEq(prop.noVotes, 0);
        assertTrue(voting.isNullifierUsed(12345));
    }

    function test_NoVoteSuccess() public {
        vm.prank(alice);
        uint256 id = voting.createProposal("Test", 7 days);

        (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) = _emptyProof();
        uint[4] memory pubSignals = [uint(99999), 1, id, 0]; // voteHash=1 → odd → no vote

        vm.expectEmit(true, true, false, false);
        emit VoteCast(99999, 1);
        voting.vote(pA, pB, pC, pubSignals);

        Proposal memory prop = voting.getProposal(id);
        assertEq(prop.yesVotes, 0);
        assertEq(prop.noVotes, 1);
        assertTrue(voting.isNullifierUsed(99999));
    }

    function testFuzz_VoteChoice(uint256 nullifier, uint256 voteHash) public {
        vm.assume(nullifier > 0 && nullifier < 2**250); // Avoid overflow/edge cases
        vm.assume(voteHash < 2**250);

        vm.prank(alice);
        uint256 id = voting.createProposal("Fuzz Vote", 7 days);

        (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) = _emptyProof();
        uint[4] memory pubSignals = [uint(nullifier), uint(voteHash), id, 0];

        voting.vote(pA, pB, pC, pubSignals);

        Proposal memory prop = voting.getProposal(id);
        if (voteHash % 2 == 0) {
            assertEq(prop.yesVotes, 1);
            assertEq(prop.noVotes, 0);
        } else {
            assertEq(prop.yesVotes, 0);
            assertEq(prop.noVotes, 1);
        }
        assertTrue(voting.isNullifierUsed(nullifier));
    }

    function test_MultipleVotesDifferentProposals() public {
        uint256 id1 = voting.createProposal("P1", 7 days);
        uint256 id2 = voting.createProposal("P2", 7 days);

        (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) = _emptyProof();

        voting.vote(pA, pB, pC, [uint(1), 0, id1, 0]);
        voting.vote(pA, pB, pC, [uint(2), 1, id1, 0]);
        voting.vote(pA, pB, pC, [uint(3), 0, id2, 0]);

        Proposal memory p1 = voting.getProposal(id1);
        assertEq(p1.yesVotes, 1);
        assertEq(p1.noVotes, 1);

        Proposal memory p2 = voting.getProposal(id2);
        assertEq(p2.yesVotes, 1);
        assertEq(p2.noVotes, 0);
    }

    function test_GetProposalRevertNonExistent() public {
        vm.expectRevert(ZKVoting.ProposalNotFound.selector);
        voting.getProposal(999);
    }
}
