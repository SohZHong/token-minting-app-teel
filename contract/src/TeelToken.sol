// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TeelToken
 * @notice ERC20 token with owner-only minting, pausable minting,
 *         and threshold tracking based on total supply.
 */
contract TeelToken is ERC20, Ownable, Pausable {
    // Track total supply threshold
    uint256 public threshold;
    // Track if threshold event has been emitted at least once
    bool public thresholdCrossed;

    // Events
    event TokenMinted(address to, uint256 amount);
    event ThresholdCrossed(uint256 totalSupply, uint256 threshold);
    event ThresholdUpdated(uint256 newThreshold);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 threshold_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        threshold = threshold_;
    }

    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        _mint(to, amount);

        // Retrieve total supply
        uint256 supply = totalSupply();

        // Check threshold using total supply
        if (!thresholdCrossed && supply >= threshold) {
            thresholdCrossed = true;
            emit ThresholdCrossed(supply, threshold);
        }

        emit TokenMinted(to, amount);
    }

    function updateThreshold(uint256 newThreshold) external onlyOwner {
        threshold = newThreshold;
        thresholdCrossed = false;

        // Retrieve total supply
        uint256 supply = totalSupply();

        // Check if the new threshold is less than total supply
        if (supply >= newThreshold) {
            thresholdCrossed = true;
            emit ThresholdCrossed(supply, newThreshold);
        }

        emit ThresholdUpdated(newThreshold);
    }

    function pauseMinting() external onlyOwner {
        _pause();
    }

    function unpauseMinting() external onlyOwner {
        _unpause();
    }
}
