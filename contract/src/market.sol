// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "./invoiceNFT.sol";

contract InvoiceNFTMarketplace is Ownable, ReentrancyGuard {
    InvoiceNFT public immutable invoiceNFT;
    uint256 public platformFee = 25; // 2.5% fee (based on 1000)

    // Constructor to initialize the base class
    constructor(address _invoiceNFTAddress) Ownable(msg.sender) ReentrancyGuard() {
        require(_invoiceNFTAddress != address(0), "Invalid NFT contract address");
        invoiceNFT = InvoiceNFT(_invoiceNFTAddress);
    }
    
    enum BidStatus { Pending, Accepted, Rejected }
    
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 listingPrice;
        bool isActive;
    }
    
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
        BidStatus status;
        uint256 tokenId;
    }
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Bid[]) public bids;
    
    // Events
    event InvoiceCreatedAndListed(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 listingPrice
    );
    
    event ListingCreated(
        address indexed seller,
        uint256 indexed tokenId,
        uint256 listingPrice
    );
    
    event ListingCanceled(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event BidPlaced(
        address indexed bidder,
        uint256 indexed tokenId,
        uint256 amount
    );
    
    event BidAccepted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 amount
    );
    
    event BidRejected(
        uint256 indexed tokenId,
        uint256 bidIndex
    );

    // Create and list an invoice NFT in one transaction
    function createAndListInvoice(
        address to,
        string memory paymentChain,
        address invoiceCurrency,
        address settlementCurrency,
        string memory description,
        uint256 quantity,
        uint256 unitPrice,
        uint256 discount,
        uint256 tax,
        uint256 deadline,
        uint256 listingPrice
    ) external nonReentrant returns (uint256) {
        // Create the invoice NFT
        uint256 tokenId = invoiceNFT.createInvoiceNFT(
            to,
            paymentChain,
            invoiceCurrency,
            settlementCurrency,
            description,
            quantity,
            unitPrice,
            discount,
            tax,
            deadline
        );

        // Approve marketplace to transfer the NFT
        invoiceNFT.approve(address(this), tokenId);

        // Create listing
        listings[tokenId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            listingPrice: listingPrice,
            isActive: true
        });

        emit InvoiceCreatedAndListed(tokenId, msg.sender, listingPrice);
        
        return tokenId;
    }

    // List existing invoice NFT
    function listInvoice(uint256 tokenId, uint256 listingPrice) external nonReentrant {
        require(invoiceNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(invoiceNFT.getApproved(tokenId) == address(this), "Marketplace not approved");
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            listingPrice: listingPrice,
            isActive: true
        });

        emit ListingCreated(msg.sender, tokenId, listingPrice);
    }

    // Cancel listing
    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        
        emit ListingCanceled(tokenId, msg.sender);
    }

    // Place bid
    function placeBid(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.listingPrice, "Bid below listing price");
        
        bids[tokenId].push(Bid({
            bidder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            status: BidStatus.Pending,
            tokenId: tokenId
        }));

        emit BidPlaced(msg.sender, tokenId, msg.value);
    }

    // Accept or reject bid
    function processBid(uint256 tokenId, uint256 bidIndex, bool accept) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");
        require(bidIndex < bids[tokenId].length, "Invalid bid index");

        Bid storage selectedBid = bids[tokenId][bidIndex];
        require(selectedBid.status == BidStatus.Pending, "Bid not pending");

        if (accept) {
            // Calculate platform fee
            uint256 fee = (selectedBid.amount * platformFee) / 1000;
            uint256 sellerAmount = selectedBid.amount - fee;

            // Transfer NFT to buyer
            invoiceNFT.safeTransferFrom(listing.seller, selectedBid.bidder, tokenId);
            
            // Transfer funds
            (bool feeSuccess, ) = payable(owner()).call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
            
            (bool sellerSuccess, ) = payable(listing.seller).call{value: sellerAmount}("");
            require(sellerSuccess, "Seller transfer failed");

            // Update status
            selectedBid.status = BidStatus.Accepted;
            listing.isActive = false;

            emit BidAccepted(tokenId, listing.seller, selectedBid.bidder, selectedBid.amount);
        } else {
            // Reject bid and refund bidder
            selectedBid.status = BidStatus.Rejected;
            
            (bool success, ) = payable(selectedBid.bidder).call{value: selectedBid.amount}("");
            require(success, "Refund failed");

            emit BidRejected(tokenId, bidIndex);
        }
    }

    // Update platform fee (only owner)
    function updatePlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 100, "Fee too high"); // Max 10%
        platformFee = _platformFee;
    }

    // Get invoice details
    function getInvoiceDetails(uint256 tokenId) external view returns (
        address from,
        address to,
        string memory paymentChain,
        address invoiceCurrency,
        address settlementCurrency,
        string memory description,
        uint256 quantity,
        uint256 unitPrice,
        uint256 discount,
        uint256 tax,
        uint256 amount,
        bool isPaid,
        uint256 deadline
    ) {
        return invoiceNFT.invoices(tokenId);
    }

    // Get all active listings
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        uint256 totalSupply = 1;
        
        // Count active listings
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (listings[i].isActive) {
                activeCount++;
            }
        }
        
        // Create result array
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 currentIndex = 0;
        
        // Populate result array
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (listings[i].isActive) {
                activeListings[currentIndex] = listings[i];
                currentIndex++;
            }
        }
        
        return activeListings;
    }

    // Get bids for a specific token
    function getBidsForToken(uint256 tokenId) external view returns (Bid[] memory) {
        return bids[tokenId];
    }
}