// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TeelToken} from "../src/TeelToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TeelTokenTest is Test {
    TeelToken token;
    address owner;
    address addr1;
    address addr2;

    uint256 constant THRESHOLD = 100 ether;

    function setUp() public {
        owner = address(this); // test contract is owner
        addr1 = vm.addr(1);
        addr2 = vm.addr(2);

        token = new TeelToken("Teel Token", "TEEL", THRESHOLD);
    }

    // Test if all deployment parameters are working as intended
    function testDeployment() public view {
        assertEq(token.name(), "Teel Token");
        assertEq(token.symbol(), "TEEL");
        assertEq(token.decimals(), 18);
        assertEq(token.threshold(), THRESHOLD);
        assertEq(token.thresholdCrossed(), false);
        assertEq(token.owner(), owner);
    }

    // Test that owners is allowed to mint
    function testOwnerCanMint() public {
        uint256 amount = 50 ether;
        token.mint(addr1, amount);
        assertEq(token.balanceOf(addr1), amount);
        assertEq(token.totalSupply(), amount);
    }

    // Test that non owners will be blocked from minting
    function testNonOwnerCannotMint() public {
        vm.prank(addr1);
        // Manage custom error with Ownable
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                addr1
            )
        );
        token.mint(addr1, 10 ether);
    }

    // Test that the ThresholdCrossed event is emitted when minting reaches the threshold
    function testThresholdCrossedEvent() public {
        vm.expectEmit(true, false, false, true);

        emit TeelToken.ThresholdCrossed(THRESHOLD, THRESHOLD);
        token.mint(addr1, THRESHOLD);

        assertEq(token.thresholdCrossed(), true);
    }

    // Test that the ThresholdCrossed event is not emitted twice when threshold is crossed the first time
    function testThresholdDoesNotEmitTwice() public {
        token.mint(addr1, 60 ether);
        assertEq(token.thresholdCrossed(), false);

        vm.expectEmit(true, false, false, true);
        emit TeelToken.ThresholdCrossed(100 ether, THRESHOLD);
        token.mint(addr1, 40 ether);

        assertEq(token.thresholdCrossed(), true);

        // Mint more, should not emit ThresholdCrossed again
        token.mint(addr1, 10 ether);
        assertEq(token.thresholdCrossed(), true);
    }

    // Test that the threshold can be updated and emits the ThresholdUpdatedEvent properly
    function testUpdateThreshold() public {
        uint256 newThreshold = 200 ether;
        vm.expectEmit(false, false, false, true);
        emit TeelToken.ThresholdUpdated(newThreshold);
        token.updateThreshold(newThreshold);

        assertEq(token.threshold(), newThreshold);
        assertEq(token.thresholdCrossed(), false);
    }

    // Test that updating the threshold below current total supply immediately triggers ThresholdCrossed
    function testUpdateThresholdBelowSupply() public {
        token.mint(addr1, 150 ether);

        vm.expectEmit(true, false, false, true);
        emit TeelToken.ThresholdCrossed(150 ether, 100 ether);
        vm.expectEmit(false, false, false, true);
        emit TeelToken.ThresholdUpdated(100 ether);

        token.updateThreshold(100 ether);
        assertEq(token.thresholdCrossed(), true);
    }

    // Test that pausing minting prevents minting and unpausing restores it
    function testPauseAndUnpause() public {
        token.pauseMinting();
        // Manage custom error with Pausable
        vm.expectRevert(
            abi.encodeWithSelector(Pausable.EnforcedPause.selector)
        );
        token.mint(addr1, 10 ether);

        token.unpauseMinting();
        token.mint(addr1, 10 ether);
        assertEq(token.balanceOf(addr1), 10 ether);
    }

    // Test standard ERC-20 transfer and approve/transferFrom functionality
    function testERC20TransferAndApprove() public {
        token.mint(addr1, 50 ether);

        // transfer
        vm.prank(addr1);
        token.transfer(addr2, 20 ether);
        assertEq(token.balanceOf(addr2), 20 ether);
        assertEq(token.balanceOf(addr1), 30 ether);

        // approve + transferFrom
        vm.prank(addr1);
        token.approve(addr2, 30 ether);

        vm.prank(addr2);
        token.transferFrom(addr1, addr2, 30 ether);
        assertEq(token.balanceOf(addr2), 50 ether);
        assertEq(token.balanceOf(addr1), 0);
    }
}
