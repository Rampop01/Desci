// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DatasetNFT is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant MARKETPLACE_ROLE = keccak256("MARKETPLACE_ROLE");

    enum LicenseType {
        RESEARCH_ONLY,
        COMMERCIAL
    }

    struct DatasetInfo {
        address creator;
        string dataHash;
        string description;
        LicenseType licenseType;
        uint256 createdAt;
    }

    mapping(uint256 => DatasetInfo) public datasets;
    mapping(uint256 => mapping(address => bool)) public accessPermissions;

    event DatasetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string dataHash,
        LicenseType licenseType
    );

    event AccessGranted(uint256 indexed tokenId, address indexed buyer);

    constructor() ERC721("DatasetNFT", "DSD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mintDataset(
        string memory _tokenURI,
        string memory dataHash,
        string memory description,
        LicenseType licenseType
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
            createdAt: block.timestamp
        });

        emit DatasetMinted(newTokenId, msg.sender, dataHash, licenseType);
        return newTokenId;
    }

    function grantAccess(uint256 tokenId, address buyer) external {
        require(
            hasRole(MARKETPLACE_ROLE, msg.sender) || ownerOf(tokenId) == msg.sender,
            "Caller is not marketplace or owner"
        );
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

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}