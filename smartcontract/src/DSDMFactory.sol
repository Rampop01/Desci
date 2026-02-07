// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DatasetNFT.sol";
import "./DatasetMarketplace.sol";
import "./LicenseManager.sol";

contract DSDMFactory {
    event MarketplaceDeployed(
        address indexed creator,
        address datasetNFT,
        address marketplace,
        address licenseManager
    );
    
    struct DeploymentInfo {
        address datasetNFT;
        address marketplace;
        address licenseManager;
        address creator;
        uint256 deployedAt;
    }
    
    mapping(address => DeploymentInfo) public deployments;
    
    function deployMarketplace() external returns (
        address datasetNFT,
        address marketplace,
        address licenseManager
    ) {
        // Deploy DatasetNFT
        DatasetNFT datasetNFTContract = new DatasetNFT();
        datasetNFT = address(datasetNFTContract);
        
        // Deploy Marketplace
        DatasetMarketplace marketplaceContract = new DatasetMarketplace(datasetNFT);
        marketplace = address(marketplaceContract);
        
        // Grant MARKETPLACE_ROLE to Marketplace contract
        // The factory is the owner/admin of the NFT contract initially because it deployed it
        datasetNFTContract.grantRole(datasetNFTContract.MARKETPLACE_ROLE(), marketplace);
        
        // Deploy LicenseManager
        LicenseManager licenseManagerContract = new LicenseManager(datasetNFT);
        licenseManager = address(licenseManagerContract);
        
        // Transfer ownership/admin rights to the creator if desired?
        // For now, let's grant admin role to msg.sender so they can manage it too
        datasetNFTContract.grantRole(datasetNFTContract.DEFAULT_ADMIN_ROLE(), msg.sender);
        
        // Store deployment info
        deployments[msg.sender] = DeploymentInfo({
            datasetNFT: datasetNFT,
            marketplace: marketplace,
            licenseManager: licenseManager,
            creator: msg.sender,
            deployedAt: block.timestamp
        });
        
        emit MarketplaceDeployed(
            msg.sender,
            datasetNFT,
            marketplace,
            licenseManager
        );
    }
    
    function getDeployment(address creator) external view returns (DeploymentInfo memory) {
        return deployments[creator];
    }
}