// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";


// Aave V3 Pool Interface
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

contract AaveYieldStaking is ReentrancyGuard {
    // Aave V3 Pool Address (this is the Ethereum mainnet address, change for other networks)
    IAavePool public constant AAVE_POOL = IAavePool(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2);

    // Token to be staked
    IERC20 public stakingToken;

    // Address to receive yields
    address public yieldRecipient;

    // Struct to track user stakes
    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
    }

    // User stakes
    mapping(address => StakeInfo) public stakes;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event YieldRecipientUpdated(address newRecipient);

    constructor(address _stakingToken, address _yieldRecipient) {
        stakingToken = IERC20(_stakingToken);
        yieldRecipient = _yieldRecipient;
    }

    // Stake tokens in Aave
    function stake(uint256 amount) external nonReentrant {
        // Ensure user hasn't already staked
        require(stakes[msg.sender].amount == 0, "Already staked");
        
        // Transfer tokens from user to contract
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Approve Aave pool to spend tokens
        require(stakingToken.approve(address(AAVE_POOL), amount), "Approval failed");
        
        // Supply tokens to Aave pool
        AAVE_POOL.supply(address(stakingToken), amount, address(this), 0);
        
        // Record stake
        stakes[msg.sender] = StakeInfo({
            amount: amount,
            stakedAt: block.timestamp
        });

        emit Staked(msg.sender, amount);
    }

    // Unstake tokens from Aave
    function unstake() external nonReentrant {
        StakeInfo memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No active stake");

        // Withdraw from Aave pool
        uint256 withdrawnAmount = AAVE_POOL.withdraw(address(stakingToken), userStake.amount, address(this));
        
        // Transfer original amount back to user
        require(stakingToken.transfer(msg.sender, withdrawnAmount), "Transfer back failed");
        
        // Clear stake
        delete stakes[msg.sender];

        emit Unstaked(msg.sender, withdrawnAmount);
    }

    // Withdraw accumulated yields (can only be called by owner)
    function withdrawYields() external  {
        // Calculate yields by checking contract's token balance 
        uint256 contractBalance = stakingToken.balanceOf(address(this));
        uint256 userStakedAmount = stakes[msg.sender].amount;
        uint256 yields = contractBalance - userStakedAmount;

        // Transfer yields to yield recipient
        require(stakingToken.transfer(yieldRecipient, yields), "Yield transfer failed");
    }

    // Update yield recipient
    function updateYieldRecipient(address _newRecipient) external  {
        require(_newRecipient != address(0), "Invalid recipient");
        yieldRecipient = _newRecipient;
        emit YieldRecipientUpdated(_newRecipient);
    }

    // Fallback function
    receive() external payable {}
}