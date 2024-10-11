// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BlockRight is ERC721, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;

    struct Content {
        string contentHash;
        address creator;
        uint256 creationTime;
        string metadataURI;
        bool isCommercial;
        uint256 price;
    }

    mapping(uint256 => Content) public contents;
    mapping(uint256 => mapping(address => bool)) public contentLicenses;

    event ContentRegistered(uint256 tokenId, address creator, string contentHash);
    event ContentLicensed(uint256 tokenId, address licensee);
    event PaymentReceived(uint256 tokenId, address payer, uint256 amount);

    constructor() ERC721("BlockRight", "BRT") Ownable(msg.sender) {
        _tokenIds = 0;
    }

    function registerContent(string memory contentHash, string memory metadataURI, bool isCommercial, uint256 price) public returns (uint256) {
        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);

        contents[newTokenId] = Content({
            contentHash: contentHash,
            creator: msg.sender,
            creationTime: block.timestamp,
            metadataURI: metadataURI,
            isCommercial: isCommercial,
            price: price
        });

        emit ContentRegistered(newTokenId, msg.sender, contentHash);

        return newTokenId;
    }

    function licenseContent(uint256 tokenId) public payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Content does not exist");
        Content memory content = contents[tokenId];

        payable(content.creator).transfer(msg.value);
        contentLicenses[tokenId][msg.sender] = true;

        emit ContentLicensed(tokenId, msg.sender);
        emit PaymentReceived(tokenId, msg.sender, msg.value);
    }

    function getContent(uint256 tokenId) public view returns (Content memory) {
        require(_ownerOf(tokenId) != address(0), "Content does not exist");
        return contents[tokenId];
    }
             
    function verifyContentHash(uint256 tokenId, string memory contentHash) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Content does not exist");
        return keccak256(abi.encodePacked(contents[tokenId].contentHash)) == keccak256(abi.encodePacked(contentHash));
    }

    function hasLicense(uint256 tokenId, address user) public view returns (bool) {
        return contentLicenses[tokenId][user];
    }

    function updateContentPrice(uint256 tokenId, uint256 newPrice) public {
        require(_ownerOf(tokenId) != address(0), "Content does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only content owner can update price");
        contents[tokenId].price = newPrice;
    }

    // Additional functions for updating content metadata, etc. can be added here
}
