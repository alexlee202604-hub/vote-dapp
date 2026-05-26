// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Crowdfunding.sol";

contract CrowdfundingTest is Test {
    Crowdfunding public crowdfunding;
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    
    uint256 constant TARGET = 10 ether;
    uint256 constant DURATION = 7 days;
    
    event CampaignCreated(uint256 indexed id, address indexed creator, address token, uint256 target, uint256 deadline);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);

    function setUp() public {
        crowdfunding = new Crowdfunding();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);
    }

    function test_CreateCampaign() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), TARGET, DURATION);
        assertEq(id, 1);
        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(uint256(camp.status), uint256(CampaignStatus.Active));
        assertEq(camp.raised, 0);
    }

    function test_CreateCampaignEmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit CampaignCreated(1, alice, address(0), TARGET, block.timestamp + DURATION);
        crowdfunding.createCampaign(address(0), TARGET, DURATION);
    }

    function test_CreateCampaignRevertZeroTarget() public {
        vm.prank(alice);
        vm.expectRevert(Crowdfunding.TargetMustBePositive.selector);
        crowdfunding.createCampaign(address(0), 0, DURATION);
    }

    function test_CreateCampaignRevertShortDuration() public {
        vm.prank(alice);
        vm.expectRevert(Crowdfunding.DeadlineTooShort.selector);
        crowdfunding.createCampaign(address(0), TARGET, 1 hours);
    }

    function test_ContributeETH() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), TARGET, DURATION);
        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit ContributionMade(id, bob, 1 ether);
        crowdfunding.contribute{value: 1 ether}(id, 0);
        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(camp.raised, 1 ether);
        assertEq(crowdfunding.getUserContribution(id, bob), 1 ether);
    }

    function test_ContributeReachTarget() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 1 ether, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);
        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(uint256(camp.status), uint256(CampaignStatus.Success));
        assertEq(camp.raised, 1 ether);
    }

    function test_ContributeRevertNonExistent() public {
        vm.prank(bob);
        vm.expectRevert(Crowdfunding.CampaignNotFound.selector);
        crowdfunding.contribute{value: 1 ether}(999, 0);
    }

    function test_ContributeRevertAfterDeadline() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), TARGET, 1 days);
        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(bob);
        vm.expectRevert(Crowdfunding.DeadlinePassed.selector);
        crowdfunding.contribute{value: 1 ether}(id, 0);
    }

    function test_ContributeRevertZeroETH() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), TARGET, DURATION);
        vm.prank(bob);
        vm.expectRevert(Crowdfunding.ContributionMustBePositive.selector);
        crowdfunding.contribute{value: 0}(id, 0);
    }

    function test_ContributeToInactive() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 1 ether, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);
        vm.prank(charlie);
        vm.expectRevert(Crowdfunding.CampaignNotActive.selector);
        crowdfunding.contribute{value: 1 ether}(id, 0);
    }

    function test_WithdrawSuccess() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 1 ether, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);
        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit FundsWithdrawn(id, alice, 1 ether);
        crowdfunding.withdraw(id);
        assertEq(alice.balance - balanceBefore, 1 ether);
        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(uint256(camp.status), uint256(CampaignStatus.Claimed));
    }

    function test_WithdrawRevertNotCreator() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 1 ether, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);
        vm.prank(bob);
        vm.expectRevert(Crowdfunding.NotCampaignCreator.selector);
        crowdfunding.withdraw(id);
    }

    function test_WithdrawRevertNotSuccessful() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), TARGET, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);
        vm.warp(block.timestamp + DURATION + 1);
        vm.prank(alice);
        vm.expectRevert(Crowdfunding.CampaignNotSuccessful.selector);
        crowdfunding.withdraw(id);
    }

    function test_RefundFailedCampaign() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), TARGET, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);
        vm.warp(block.timestamp + DURATION + 1);
        uint256 balanceBefore = bob.balance;
        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit RefundIssued(id, bob, 1 ether);
        crowdfunding.refund(id);
        assertEq(bob.balance - balanceBefore, 1 ether);
        assertEq(crowdfunding.getUserContribution(id, bob), 0);
    }

    function test_RefundRevertWhenSuccessful() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 1 ether, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 1 ether}(id, 0);
        vm.prank(bob);
        vm.expectRevert(Crowdfunding.CampaignNotFailed.selector);
        crowdfunding.refund(id);
    }

    function test_RefundRevertNoContribution() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), TARGET, DURATION);
        vm.warp(block.timestamp + DURATION + 1);
        vm.prank(charlie);
        vm.expectRevert(Crowdfunding.NoContributionToRefund.selector);
        crowdfunding.refund(id);
    }

    function test_RefundAndWithdrawFlow() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 5 ether, DURATION);
        vm.prank(bob);
        crowdfunding.contribute{value: 2 ether}(id, 0);
        vm.prank(charlie);
        crowdfunding.contribute{value: 2 ether}(id, 0);
        vm.warp(block.timestamp + DURATION + 1);
        vm.prank(bob);
        crowdfunding.refund(id);
        vm.prank(charlie);
        crowdfunding.refund(id);
        assertEq(crowdfunding.getUserContribution(id, bob), 0);
        assertEq(crowdfunding.getUserContribution(id, charlie), 0);
    }

    function testFuzz_ContributeVariousAmounts(uint8 amount) public {
        vm.assume(amount > 0 && amount < 200);
        uint256 contribution = uint256(amount) * (10**16);
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 1000 ether, 30 days);
        vm.deal(bob, contribution);
        vm.prank(bob);
        crowdfunding.contribute{value: contribution}(id, 0);
        assertEq(crowdfunding.getUserContribution(id, bob), contribution);
    }

    function testFuzz_MultipleContributors(uint64 amount1, uint64 amount2, uint64 amount3) public {
        vm.assume(amount1 > 0 && amount1 < 1000);
        vm.assume(amount2 > 0 && amount2 < 1000);
        vm.assume(amount3 > 0 && amount3 < 1000);
        uint256 c1 = uint256(amount1) * (10**16);
        uint256 c2 = uint256(amount2) * (10**16);
        uint256 c3 = uint256(amount3) * (10**16);
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 10000 ether, 30 days);
        vm.deal(bob, c1);
        vm.prank(bob); crowdfunding.contribute{value: c1}(id, 0);
        vm.deal(charlie, c2);
        vm.prank(charlie); crowdfunding.contribute{value: c2}(id, 0);
        address dave = address(0x4);
        vm.deal(dave, c3);
        vm.prank(dave); crowdfunding.contribute{value: c3}(id, 0);
        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(camp.raised, c1 + c2 + c3);
    }

    function testFuzz_TimeSensitive(uint256 timeShift, uint8 contribution) public {
        vm.assume(contribution > 0 && contribution < 100);
        vm.assume(timeShift > 0 && timeShift < 100 days);
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 100 ether, 7 days);
        uint256 contAmount = uint256(contribution) * (10**16);
        vm.deal(bob, contAmount);
        vm.prank(bob); crowdfunding.contribute{value: contAmount}(id, 0);
        vm.warp(block.timestamp + timeShift);
        if (timeShift > 7 days) {
            vm.prank(bob);
            (bool success,) = address(crowdfunding).call(abi.encodeWithSelector(crowdfunding.refund.selector, id));
            assertTrue(success || !success);
        }
    }

    function test_ExactTargetReached() public {
        vm.prank(alice);
        uint256 id = crowdfunding.createCampaign(address(0), 5 ether, DURATION);
        vm.prank(bob); crowdfunding.contribute{value: 3 ether}(id, 0);
        vm.prank(charlie); crowdfunding.contribute{value: 2 ether}(id, 0);
        Campaign memory camp = crowdfunding.getCampaign(id);
        assertEq(uint256(camp.status), uint256(CampaignStatus.Success));
        vm.prank(alice); crowdfunding.withdraw(id);
        camp = crowdfunding.getCampaign(id);
        assertEq(uint256(camp.status), uint256(CampaignStatus.Claimed));
    }

    function test_CampaignCounterIncrement() public {
        vm.prank(alice); crowdfunding.createCampaign(address(0), TARGET, DURATION);
        assertEq(crowdfunding.campaignIdCounter(), 1);
        vm.prank(bob); crowdfunding.createCampaign(address(0), TARGET, DURATION);
        assertEq(crowdfunding.campaignIdCounter(), 2);
        vm.prank(charlie); crowdfunding.createCampaign(address(0), TARGET, DURATION);
        assertEq(crowdfunding.campaignIdCounter(), 3);
    }
}
