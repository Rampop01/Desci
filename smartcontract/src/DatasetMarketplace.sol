// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DatasetNFT.sol";

contract DatasetMarketplace {
    DatasetNFT public datasetNFT;
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }
    
    mapping(uint256 => Listing) public listings;
    
    event DatasetListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    event DatasetPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    
    constructor(address _datasetNFTAddress) {
        datasetNFT = DatasetNFT(_datasetNFTAddress);
    }
    
    function listDataset(uint256 tokenId, uint256 price) external {
        require(datasetNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        DatasetNFT.DatasetInfo memory info = datasetNFT.getDatasetInfo(tokenId);
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });
        
        datasetNFT.listDataset(tokenId, price);
        
        emit DatasetListed(tokenId, msg.sender, price);
    }
    
    function purchaseAccess(uint256 tokenId) external payable {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        
        DatasetNFT.DatasetInfo memory info = datasetNFT.getDatasetInfo(tokenId);
        require(info.isListed, "Dataset not listed");
        
        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: msg.value}("");
        require(success, "Payment failed");
        
        // Grant access to buyer
        datasetNFT.grantAccess(tokenId, msg.sender);
        
        // Delist after purchase (optional)
        listing.active = false;
        
        emit DatasetPurchased(tokenId, msg.sender, listing.seller, msg.value);
    }
    
    function cancelListing(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not seller");
        listings[tokenId].active = false;
        datasetNFT.delistDataset(tokenId);
    }
    
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
    
    function getActiveListings(uint256 startId, uint256 count) external view returns (Listing[] memory) {
        Listing[] memory activeListings = new Listing[](count);
        uint256 found = 0;
        
        for (uint256 i = startId; i < startId + count * 10 && found < count; i++) {
            if (listings[i].active) {
                activeListings[found] = listings[i];
                found++;
            }
        }
        
        // Resize array
        assembly {
            mstore(activeListings, found)
        }
        
        return activeListings;
    }
}