// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDatasetNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getIPFSHash(uint256 tokenId) external view returns (string memory);
}

/**
 * @title DatasetMarketplace
 * @dev Marketplace for licensing scientific datasets represented as NFTs
 * Buyers purchase licenses, not ownership - the NFT owner retains ownership
 */
contract DatasetMarketplace is ReentrancyGuard, Ownable {
    IDatasetNFT public datasetNFT;
    
    // License types
    enum LicenseType { Research, Commercial }
    
    // Listing structure
    struct Listing {
        address seller;
        uint256 price; // in wei
        LicenseType licenseType;
        bool isActive;
        string title;
        string description;
    }
    
    // License structure
    struct License {
        uint256 tokenId;
        address buyer;
        LicenseType licenseType;
        uint256 purchasedAt;
        uint256 pricePaid;
    }
    
    // Platform fee (in basis points, 250 = 2.5%)
    uint256 public platformFeeBps = 250;
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => bool)) public hasLicense;
    mapping(address => License[]) public buyerLicenses;
    mapping(uint256 => address[]) public licensees;
    
    // Accumulated fees
    uint256 public accumulatedFees;
    
    // Events
    event DatasetListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        LicenseType licenseType,
        string title
    );
    
    event DatasetDelisted(uint256 indexed tokenId, address indexed seller);
    
    event LicensePurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        LicenseType licenseType
    );
    
    event PriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
    
    event FeesWithdrawn(address indexed to, uint256 amount);
    
    constructor(address _datasetNFT) Ownable(msg.sender) {
        datasetNFT = IDatasetNFT(_datasetNFT);
    }
    
    /**
     * @dev Lists a dataset for licensing
     * @param tokenId The NFT token ID
     * @param price Price in wei for a license
     * @param licenseType Type of license (Research or Commercial)
     * @param title Title of the dataset
     * @param description Description of the dataset
     */
    function listDataset(
        uint256 tokenId,
        uint256 price,
        LicenseType licenseType,
        string memory title,
        string memory description
    ) external {
        require(datasetNFT.ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        require(price > 0, "Price must be greater than 0");
        require(bytes(title).length > 0, "Title cannot be empty");
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            licenseType: licenseType,
            isActive: true,
            title: title,
            description: description
        });
        
        emit DatasetListed(tokenId, msg.sender, price, licenseType, title);
    }
    
    /**
     * @dev Removes a dataset listing
     * @param tokenId The NFT token ID to delist
     */
    function delistDataset(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Not listed");
        
        listing.isActive = false;
        
        emit DatasetDelisted(tokenId, msg.sender);
    }
    
    /**
     * @dev Updates the price of a listed dataset
     * @param tokenId The NFT token ID
     * @param newPrice New price in wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Not listed");
        require(newPrice > 0, "Price must be greater than 0");
        
        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit PriceUpdated(tokenId, oldPrice, newPrice);
    }
    
    /**
     * @dev Purchases a license for a dataset
     * @param tokenId The NFT token ID
     */
    function purchaseLicense(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Dataset not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        require(!hasLicense[tokenId][msg.sender], "Already has license");
        require(msg.sender != listing.seller, "Cannot buy own dataset");
        
        // Calculate fees
        uint256 platformFee = (listing.price * platformFeeBps) / 10000;
        uint256 sellerAmount = listing.price - platformFee;
        
        // Record the license
        hasLicense[tokenId][msg.sender] = true;
        licensees[tokenId].push(msg.sender);
        
        buyerLicenses[msg.sender].push(License({
            tokenId: tokenId,
            buyer: msg.sender,
            licenseType: listing.licenseType,
            purchasedAt: block.timestamp,
            pricePaid: listing.price
        }));
        
        // Accumulate platform fee
        accumulatedFees += platformFee;
        
        // Pay the seller
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success, "Payment to seller failed");
        
        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit LicensePurchased(tokenId, msg.sender, listing.seller, listing.price, listing.licenseType);
    }
    
    /**
     * @dev Checks if an address has access to a dataset (owner or licensee)
     * @param tokenId The NFT token ID
     * @param user The address to check
     * @return True if the user has access
     */
    function hasAccess(uint256 tokenId, address user) public view returns (bool) {
        // Owner always has access
        if (datasetNFT.ownerOf(tokenId) == user) {
            return true;
        }
        // Check if has purchased license
        return hasLicense[tokenId][user];
    }
    
    /**
     * @dev Gets listing details
     * @param tokenId The NFT token ID
     * @return seller The seller address
     * @return price The listing price
     * @return licenseType The license type
     * @return isActive Whether the listing is active
     * @return title The dataset title
     * @return description The dataset description
     */
    function getListing(uint256 tokenId) public view returns (
        address seller,
        uint256 price,
        LicenseType licenseType,
        bool isActive,
        string memory title,
        string memory description
    ) {
        Listing storage listing = listings[tokenId];
        return (
            listing.seller,
            listing.price,
            listing.licenseType,
            listing.isActive,
            listing.title,
            listing.description
        );
    }
    
    /**
     * @dev Gets all licensees for a dataset
     * @param tokenId The NFT token ID
     * @return Array of licensee addresses
     */
    function getLicensees(uint256 tokenId) public view returns (address[] memory) {
        return licensees[tokenId];
    }
    
    /**
     * @dev Gets the number of licenses sold for a dataset
     * @param tokenId The NFT token ID
     * @return Number of licenses sold
     */
    function getLicenseCount(uint256 tokenId) public view returns (uint256) {
        return licensees[tokenId].length;
    }
    
    /**
     * @dev Gets all licenses purchased by a buyer
     * @param buyer The buyer address
     * @return Array of License structs
     */
    function getBuyerLicenses(address buyer) public view returns (License[] memory) {
        return buyerLicenses[buyer];
    }
    
    /**
     * @dev Withdraws accumulated platform fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees to withdraw");
        
        accumulatedFees = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FeesWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Updates the platform fee (owner only)
     * @param newFeeBps New fee in basis points (max 1000 = 10%)
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = newFeeBps;
    }
    
    /**
     * @dev Updates the DatasetNFT contract address (owner only)
     * @param _datasetNFT New DatasetNFT contract address
     */
    function updateDatasetNFT(address _datasetNFT) external onlyOwner {
        datasetNFT = IDatasetNFT(_datasetNFT);
    }
}
