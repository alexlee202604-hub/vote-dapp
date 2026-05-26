// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DAOToken.sol";

contract DAOTokenTest is Test {
    DAOToken public token;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    function setUp() public {
        vm.prank(owner);
        token = new DAOToken();
    }

    function test_InitialSupply() public {
        assertEq(token.totalSupply(), 1000000 * 10**18);
        assertEq(token.balanceOf(owner), 1000000 * 10**18);
    }

    function test_NameAndSymbol() public {
        assertEq(token.name(), "Vote DAO Token");
        assertEq(token.symbol(), "VOTE");
    }

    function test_Mint() public {
        vm.prank(owner);
        token.mint(user1, 1000 * 10**18);
        assertEq(token.balanceOf(user1), 1000 * 10**18);
        assertEq(token.totalSupply(), (1000000 + 1000) * 10**18);
    }

    function test_MintRevertNotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        token.mint(user2, 100 * 10**18);
    }

    function test_Burn() public {
        vm.prank(owner);
        token.burn(owner, 500000 * 10**18);
        assertEq(token.balanceOf(owner), 500000 * 10**18);
        assertEq(token.totalSupply(), 500000 * 10**18);
    }

    function test_BurnRevertNotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        token.burn(user1, 100 * 10**18);
    }

    function test_Transfer() public {
        vm.prank(owner);
        token.transfer(user1, 100 * 10**18);
        assertEq(token.balanceOf(user1), 100 * 10**18);
        assertEq(token.balanceOf(owner), (1000000 - 100) * 10**18);
    }

    function test_ApproveAndTransferFrom() public {
        vm.prank(owner);
        token.approve(user1, 50 * 10**18);
        
        vm.prank(user1);
        token.transferFrom(owner, user2, 50 * 10**18);
        
        assertEq(token.balanceOf(user2), 50 * 10**18);
        assertEq(token.allowance(owner, user1), 0);
    }

    // Fuzz test: random transfers
    function testFuzz_Transfer(uint128 amount) public {
        vm.assume(amount > 0 && amount <= 500000 * 10**18);
        
        vm.prank(owner);
        token.transfer(user1, amount);
        
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(owner), 1000000 * 10**18 - amount);
    }

    // Fuzz: random mint + burn
    function testFuzz_MintBurn(uint128 mintAmount, uint128 burnAmount) public {
        vm.assume(mintAmount > 0 && mintAmount < 1000000 * 10**18);
        vm.assume(burnAmount > 0 && burnAmount <= mintAmount);
        
        vm.prank(owner);
        token.mint(user1, mintAmount);
        
        assertEq(token.balanceOf(user1), mintAmount);
        
        vm.prank(owner);
        token.burn(user1, burnAmount);
        
        assertEq(token.balanceOf(user1), mintAmount - burnAmount);
    }
}
