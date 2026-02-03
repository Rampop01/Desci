// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/DatasetNFT.sol";
import "../src/DatasetMarketplace.sol";
import "../src/LicenseManager.sol";

contract DSDMTest is Test {
    DatasetNFT public datasetNFT;
    DatasetMarketplace public marketplace;
    LicenseManager public licenseManager;
    
    address creator = address(0x1);
    address buyer = address(0x2);
    
    function setUp() public {
        vm.startPrank(creator);
        
        // Deploy contracts
        datasetNFT = new DatasetNFT();
        marketplace = new DatasetMarketplace(address(datasetNFT));
        licenseManager = new LicenseManager(address(datasetNFT));
        
        vm.stopPrank();
    }
    
    function testMintAndPurchase() public {
        vm.startPrank(creator);
        
        // Mint dataset
        uint256 tokenId = datasetNFT.mintDataset(
            "ipfs://QmTestURI",
            "QmDatasetHash123",
            "Test dataset for research",
            DatasetNFT.LicenseType.RESEARCH_ONLY,
            0.1 ether
        );
        
        // List for sale
        marketplace.listDataset(tokenId, 0.1 ether);
        
        vm.stopPrank();
        
        // Buyer purchases access
        vm.startPrank(buyer);
        vm.deal(buyer, 1 ether);
        
        marketplace.purchaseAccess{value: 0.1 ether}(tokenId);
        
        // Verify access
        bool hasAccess = datasetNFT.hasAccess(tokenId, buyer);
        assertTrue(hasAccess);
        
        // Create license agreement
        licenseManager.createLicenseAgreement(tokenId, buyer, "QmTermsHash");
        
        // Verify license
        bool validLicense = licenseManager.verifyLicense(tokenId, buyer);
        assertTrue(validLicense);
        
        vm.stopPrank();
    }
}