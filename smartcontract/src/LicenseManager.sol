// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DatasetNFT.sol";

contract LicenseManager {
    DatasetNFT public datasetNFT;
    
    struct LicenseAgreement {
        uint256 tokenId;
        address licensee;
        DatasetNFT.LicenseType licenseType;
        uint256 purchaseTimestamp;
        string termsHash;
    }
    
    mapping(uint256 => mapping(address => LicenseAgreement)) public agreements;
    mapping(uint256 => LicenseAgreement[]) public datasetAgreements;
    
    event LicenseAgreementCreated(
        uint256 indexed tokenId,
        address indexed licensee,
        DatasetNFT.LicenseType licenseType
    );
    
    constructor(address _datasetNFTAddress) {
        datasetNFT = DatasetNFT(_datasetNFTAddress);
    }
    
    function createLicenseAgreement(
        uint256 tokenId,
        address licensee,
        string memory termsHash
    ) external {
        require(datasetNFT.hasAccess(tokenId, msg.sender), "No access to create license");
        
        DatasetNFT.DatasetInfo memory info = datasetNFT.getDatasetInfo(tokenId);
        
        LicenseAgreement memory agreement = LicenseAgreement({
            tokenId: tokenId,
            licensee: licensee,
            licenseType: info.licenseType,
            purchaseTimestamp: block.timestamp,
            termsHash: termsHash
        });
        
        agreements[tokenId][licensee] = agreement;
        datasetAgreements[tokenId].push(agreement);
        
        emit LicenseAgreementCreated(tokenId, licensee, info.licenseType);
    }
    
    function verifyLicense(uint256 tokenId, address user) public view returns (bool) {
        return datasetNFT.hasAccess(tokenId, user);
    }
    
    function getLicenseType(uint256 tokenId, address user) external view returns (DatasetNFT.LicenseType) {
        require(this.verifyLicense(tokenId, user), "No valid license");
        return agreements[tokenId][user].licenseType;
    }
    
    function isCommercialAllowed(uint256 tokenId, address user) external view returns (bool) {
        if (!this.verifyLicense(tokenId, user)) return false;
        return agreements[tokenId][user].licenseType == DatasetNFT.LicenseType.COMMERCIAL;
    }
    
    function getAgreement(uint256 tokenId, address user) external view returns (LicenseAgreement memory) {
        return agreements[tokenId][user];
    }
}