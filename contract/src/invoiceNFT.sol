// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Base64.sol";

contract InvoiceNFT is ERC721URIStorage {
    struct InvoiceMetadata {
        address from;
        address to;
        string paymentChain;
        address invoiceCurrency;
        address settlementCurrency;
        string description;
        uint256 quantity;
        uint256 unitPrice;
        uint256 discount;
        uint256 tax;
        uint256 amount;
        bool isPaid; // Added field for payment status
        uint256 deadline; // Added field for deadline
    }

    // Mapping to store invoice metadata
    mapping(uint256 => InvoiceMetadata) public invoices;

    // Counter for token IDs
    uint256 private _nextTokenId = 1;

    // Events
    event InvoiceNFTCreated(uint256 indexed tokenId, address indexed creator, uint256 amount);
    event InvoiceUpdated(uint256 indexed tokenId, bool isPaid);

    constructor() ERC721("InvoiceNFT", "INVNFT") {}

    // Function to create an Invoice NFT
    function createInvoiceNFT(
        address to,
        string memory paymentChain,
        address invoiceCurrency,
        address settlementCurrency,
        string memory description,
        uint256 quantity,
        uint256 unitPrice,
        uint256 discount,
        uint256 tax,
        uint256 deadline // Added deadline parameter
    ) public returns (uint256) {
        // Create a new token ID
        uint256 tokenId = _nextTokenId++;

        // Create invoice metadata
        InvoiceMetadata memory newInvoice = InvoiceMetadata({
            from: msg.sender,
            to: to,
            paymentChain: paymentChain,
            invoiceCurrency: invoiceCurrency,
            settlementCurrency: settlementCurrency,
            description: description,
            quantity: quantity,
            unitPrice: unitPrice,
            discount: discount,
            tax: tax,
            amount: quantity * unitPrice - discount + tax,
            isPaid: false, // Default payment status
            deadline: deadline // Set deadline
        });

        // Store invoice metadata
        invoices[tokenId] = newInvoice;

        // Mint the NFT to the invoice creator
        _safeMint(msg.sender, tokenId);

        // Generate and set the tokenURI with metadata
        string memory tokenURI = _generateTokenURI(tokenId);
        _setTokenURI(tokenId, tokenURI);

        uint256 amount = quantity * unitPrice - discount + tax;

        emit InvoiceNFTCreated(tokenId, msg.sender, amount);

        return tokenId;
    }

    // Generate JSON metadata for the token
    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        InvoiceMetadata memory invoice = invoices[tokenId];

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{',
                            '"name": "Invoice #', 
                            _toString(tokenId), // Changed to use tokenId instead of invoiceNumber
                            '",',
                            '"description": "', 
                            invoice.description, 
                            '",',
                            '"image": "data:image/svg+xml;base64,', 
                            _generateSVG(invoice),
                            '",',
                            '"attributes": [',
                                '{"trait_type": "Amount", "value": "', 
                                _toString(invoice.amount), 
                                 
                                _addressToString(invoice.invoiceCurrency), // Changed to use invoiceCurrency
                                '"},',
                                '{"trait_type": "Issuer", "value": "', 
                                _addressToString(invoice.from), // Changed to use from address
                                '"},',
                                '{"trait_type": "Recipient", "value": "', 
                                _addressToString(invoice.to), // Changed to use to address
                                '"},',
                                '{"trait_type": "Deadline", "value": "', 
                                _toString(invoice.deadline), 
                                '"},',
                                '{"trait_type": "Status", "value": "', 
                                invoice.isPaid ? "Paid" : "Unpaid",
                                '"}'
                            ']',
                        '}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // Generate an SVG representation of the invoice
    function _generateSVG(InvoiceMetadata memory invoice) internal pure returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300">',
                    '<rect width="100%" height="100%" fill="#f0f0f0"/>',
                    '<text x="50%" y="20%" text-anchor="middle" font-size="20">Invoice #', 
                    _toString(invoice.amount), // Changed to display amount instead of invoiceNumber
                    '</text>',
                    '<text x="50%" y="30%" text-anchor="middle" font-size="16">Amount: ', 
                    _toString(invoice.amount), 
                    ' ', 
                    _addressToString(invoice.invoiceCurrency), // Changed to use invoiceCurrency
                    '</text>',
                    '<text x="50%" y="40%" text-anchor="middle" font-size="14">Deadline: ', 
                    _toString(invoice.deadline),
                    '</text>',
                '</svg>'
            )
        );

        return Base64.encode(bytes(svg));
    }

    // Update invoice payment status
    function updateInvoiceStatus(uint256 tokenId, bool isPaid) public {
        require(msg.sender == ownerOf(tokenId), "Only token owner can update status");

        invoices[tokenId].isPaid = isPaid;

        // Regenerate and update the token URI
        string memory updatedTokenURI = _generateTokenURI(tokenId);
        _setTokenURI(tokenId, updatedTokenURI);

        emit InvoiceUpdated(tokenId, isPaid);
    }

    // Utility function to convert uint to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Utility function to convert address to string
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    // Override supportsInterface to include ERC721URIStorage
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}