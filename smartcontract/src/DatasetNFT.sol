// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DatasetNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    enum LicenseType {
        RESEARCH_ONLY,
        COMMERCIAL
    }

    struct DatasetInfo {
        address creator;
        string dataHash;
        string description;
        LicenseType licenseType;
        uint256 price;
        bool isListed;
        uint256 createdAt;
    }

    mapping(uint256 => DatasetInfo) public datasets;
    mapping(uint256 => mapping(address => bool)) public accessPermissions;

    event DatasetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string dataHash,
        LicenseType licenseType,
        uint256 price
    );

    event DatasetListed(uint256 indexed tokenId, uint256 price);
    event DatasetDelisted(uint256 indexed tokenId);
    event AccessGranted(uint256 indexed tokenId, address indexed buyer);

    constructor() ERC721("DatasetNFT", "DSD") Ownable() {}

    function mintDataset(
        string memory _tokenURI,
        string memory dataHash,
        string memory description,
        LicenseType licenseType,
        uint256 price
    ) external returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        datasets[newTokenId] = DatasetInfo({
            creator: msg.sender,
            dataHash: dataHash,
            description: description,
            licenseType: licenseType,
            price: price,
            isListed: false,
            createdAt: block.timestamp
        });

        emit DatasetMinted(newTokenId, msg.sender, dataHash, licenseType, price);
        return newTokenId;
    }

    function listDataset(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        datasets[tokenId].isListed = true;
        datasets[tokenId].price = price;
        emit DatasetListed(tokenId, price);
    }

    function delistDataset(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        datasets[tokenId].isListed = false;
        emit DatasetDelisted(tokenId);
    }

    function grantAccess(uint256 tokenId, address buyer) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        accessPermissions[tokenId][buyer] = true;
        emit AccessGranted(tokenId, buyer);
    }

    function hasAccess(uint256 tokenId, address user) external view returns (bool) {
        return ownerOf(tokenId) == user || accessPermissions[tokenId][user];
    }

    function getDatasetInfo(uint256 tokenId) external view returns (DatasetInfo memory) {
        return datasets[tokenId];
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}