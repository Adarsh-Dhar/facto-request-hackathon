// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

contract InvoiceNFTMarketplace is ERC721 {
    // Replace Counters with a native uint256 for tracking token IDs
    uint256 private _nextTokenId = 1;

    // Struct to represent an invoice
    struct Invoice {
        uint256 amount;
        uint256 deadline;
        address originalOwner;
        uint256 creationDate;
        bool isListed;
        uint256 listingStartTime;
    }

    // Struct to represent a bid
    struct Bid {
        address bidder;
        uint256 bidAmount;
        uint256 bidTime;
    }

    // Mapping of token ID to Invoice details
    mapping(uint256 => Invoice) public invoices;

    // Mapping of token ID to current bids
    mapping(uint256 => Bid[]) public tokenBids;

    // Mapping to track if a token is currently in auction
    mapping(uint256 => bool) public isInAuction;

    // Event declarations
    event InvoiceCreated(uint256 indexed tokenId, address indexed owner, uint256 amount, uint256 deadline);
    event InvoiceListed(uint256 indexed tokenId, uint256 listingTime);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 bidAmount);
    event AuctionEnded(uint256 indexed tokenId, address winner, uint256 winningBid);
    event OwnershipTransferRequested(uint256 indexed tokenId, address newOwner);
    event OwnershipTransferAccepted(uint256 indexed tokenId, address newOwner);
    event OwnershipTransferRejected(uint256 indexed tokenId);

    constructor() ERC721("InvoiceNFT", "INVNFT") {
        
    }

    // Function to create a new Invoice NFT
    function createInvoiceNFT(
        uint256 amount, 
        uint256 deadline
    ) public returns (uint256) {
        // Use the current _nextTokenId and then increment
        uint256 newTokenId = _nextTokenId;
        _nextTokenId++;

        // Mint the NFT to the creator
        _safeMint(msg.sender, newTokenId);

        // Store invoice details
        invoices[newTokenId] = Invoice({
            amount: amount,
            deadline: deadline,
            originalOwner: msg.sender,
            creationDate: block.timestamp,
            isListed: false,
            listingStartTime: 0
        });

        emit InvoiceCreated(newTokenId, msg.sender, amount, deadline);

        return newTokenId;
    }

    // Function to list an invoice for auction
    function listInvoiceForAuction(uint256 tokenId) public {
        // Ensure the caller is the owner of the token
        require(ownerOf(tokenId) == msg.sender, "Only token owner can list");
        require(!isInAuction[tokenId], "Invoice is already in auction");

        // Mark the invoice as listed
        invoices[tokenId].isListed = true;
        invoices[tokenId].listingStartTime = block.timestamp;
        isInAuction[tokenId] = true;

        // Clear previous bids
        delete tokenBids[tokenId];

        emit InvoiceListed(tokenId, block.timestamp);
    }

    // Function to place a bid on an invoice
    function bidOnInvoice(uint256 tokenId) public payable {
        Invoice storage invoice = invoices[tokenId];
        
        // Check if the invoice is currently listed
        require(invoice.isListed, "Invoice is not for sale");
        require(block.timestamp < invoice.listingStartTime + 24 hours, "Auction has ended");

        // Create a new bid
        Bid memory newBid = Bid({
            bidder: msg.sender,
            bidAmount: msg.value,
            bidTime: block.timestamp
        });

        tokenBids[tokenId].push(newBid);

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    // Function to end the auction and determine the winner
    function endAuction(uint256 tokenId) public {
        Invoice storage invoice = invoices[tokenId];
        
        // Check if auction time has passed
        require(block.timestamp >= invoice.listingStartTime + 24 hours, "Auction not yet ended");
        require(invoice.isListed, "Invoice is not listed");

        // Find the highest bid
        Bid memory winningBid = _determineWinner(tokenId);

        // Mark auction as ended
        invoice.isListed = false;
        isInAuction[tokenId] = false;

        // Request ownership transfer
        emit OwnershipTransferRequested(tokenId, winningBid.bidder);
    }

    // Internal function to determine the winner
    function _determineWinner(uint256 tokenId) internal view returns (Bid memory) {
        Bid[] memory bids = tokenBids[tokenId];
        require(bids.length > 0, "No bids placed");

        Bid memory winningBid = bids[0];

        // Find the highest bid
        for (uint256 i = 1; i < bids.length; i++) {
            if (bids[i].bidAmount > winningBid.bidAmount || 
                (bids[i].bidAmount == winningBid.bidAmount && bids[i].bidTime < winningBid.bidTime)) {
                winningBid = bids[i];
            }
        }

        return winningBid;
    }

    // Function for the owner to accept or reject ownership transfer
    function handleOwnershipTransfer(uint256 tokenId, bool accept) public {
        Invoice storage invoice = invoices[tokenId];
        
        require(msg.sender == ownerOf(tokenId), "Only current owner can handle transfer");

        if (accept) {
            // Determine the winner
            Bid memory winningBid = _determineWinner(tokenId);

            // Transfer the token
            _transfer(msg.sender, winningBid.bidder, tokenId);

            // Refund other bidders
            _refundOtherBidders(tokenId, winningBid.bidder);

            emit OwnershipTransferAccepted(tokenId, winningBid.bidder);
        } else {
            // Relist the invoice for another 24 hours
            listInvoiceForAuction(tokenId);
            emit OwnershipTransferRejected(tokenId);
        }
    }

    // Internal function to refund other bidders
    function _refundOtherBidders(uint256 tokenId, address winner) internal {
        Bid[] memory bids = tokenBids[tokenId];
        
        for (uint256 i = 0; i < bids.length; i++) {
            if (bids[i].bidder != winner) {
                payable(bids[i].bidder).transfer(bids[i].bidAmount);
            }
        }
    }

    // Function to get all NFTs
    function getAllInvoiceNFTs() public view returns (Invoice[] memory) {
        Invoice[] memory allInvoices = new Invoice[](_nextTokenId - 1);
        
        for (uint256 i = 1; i < _nextTokenId; i++) {
            allInvoices[i-1] = invoices[i];
        }
        
        return allInvoices;
    }

    // Function to get bids for a specific token
    function getBidsForToken(uint256 tokenId) public view returns (Bid[] memory) {
        return tokenBids[tokenId];
    }
}