const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DSDM Contracts", function () {
  let datasetNFT;
  let marketplace;
  let owner;
  let seller;
  let buyer;

  const DATASET_HASH = "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
  const IPFS_HASH = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
  const METADATA_URI = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/metadata.json";
  const PRICE = ethers.parseEther("0.1"); // 0.1 ETH
  const TITLE = "Test Dataset";
  const DESCRIPTION = "A test scientific dataset";

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy DatasetNFT
    const DatasetNFT = await ethers.getContractFactory("DatasetNFT");
    datasetNFT = await DatasetNFT.deploy();
    await datasetNFT.waitForDeployment();

    // Deploy Marketplace
    const DatasetMarketplace = await ethers.getContractFactory("DatasetMarketplace");
    marketplace = await DatasetMarketplace.deploy(await datasetNFT.getAddress());
    await marketplace.waitForDeployment();
  });

  describe("DatasetNFT", function () {
    it("should mint a new dataset NFT", async function () {
      const tx = await datasetNFT.connect(seller).mintDatasetNFT(
        seller.address,
        DATASET_HASH,
        IPFS_HASH,
        METADATA_URI
      );
      await tx.wait();

      expect(await datasetNFT.ownerOf(1)).to.equal(seller.address);
      expect(await datasetNFT.getDatasetHash(1)).to.equal(DATASET_HASH);
      expect(await datasetNFT.getIPFSHash(1)).to.equal(IPFS_HASH);
      expect(await datasetNFT.tokenURI(1)).to.equal(METADATA_URI);
    });

    it("should verify dataset hash correctly", async function () {
      await datasetNFT.connect(seller).mintDatasetNFT(
        seller.address,
        DATASET_HASH,
        IPFS_HASH,
        METADATA_URI
      );

      expect(await datasetNFT.verifyDataset(1, DATASET_HASH)).to.be.true;
      expect(await datasetNFT.verifyDataset(1, "0xwronghash")).to.be.false;
    });

    it("should track total minted correctly", async function () {
      expect(await datasetNFT.totalMinted()).to.equal(0);

      await datasetNFT.connect(seller).mintDatasetNFT(
        seller.address,
        DATASET_HASH,
        IPFS_HASH,
        METADATA_URI
      );

      expect(await datasetNFT.totalMinted()).to.equal(1);
    });

    it("should reject empty dataset hash", async function () {
      await expect(
        datasetNFT.connect(seller).mintDatasetNFT(
          seller.address,
          "",
          IPFS_HASH,
          METADATA_URI
        )
      ).to.be.revertedWith("Dataset hash cannot be empty");
    });
  });

  describe("DatasetMarketplace", function () {
    beforeEach(async function () {
      // Mint a dataset NFT for the seller
      await datasetNFT.connect(seller).mintDatasetNFT(
        seller.address,
        DATASET_HASH,
        IPFS_HASH,
        METADATA_URI
      );
    });

    it("should list a dataset for licensing", async function () {
      await marketplace.connect(seller).listDataset(
        1,
        PRICE,
        0, // Research license
        TITLE,
        DESCRIPTION
      );

      const listing = await marketplace.getListing(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(PRICE);
      expect(listing.isActive).to.be.true;
      expect(listing.title).to.equal(TITLE);
    });

    it("should reject listing by non-owner", async function () {
      await expect(
        marketplace.connect(buyer).listDataset(
          1,
          PRICE,
          0,
          TITLE,
          DESCRIPTION
        )
      ).to.be.revertedWith("Not the NFT owner");
    });

    it("should allow purchasing a license", async function () {
      await marketplace.connect(seller).listDataset(
        1,
        PRICE,
        0,
        TITLE,
        DESCRIPTION
      );

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await marketplace.connect(buyer).purchaseLicense(1, { value: PRICE });

      expect(await marketplace.hasAccess(1, buyer.address)).to.be.true;
      expect(await marketplace.hasLicense(1, buyer.address)).to.be.true;
      expect(await marketplace.getLicenseCount(1)).to.equal(1);

      // Check seller received payment (minus platform fee)
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      const platformFee = (PRICE * BigInt(250)) / BigInt(10000); // 2.5%
      const expectedPayment = PRICE - platformFee;
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedPayment);
    });

    it("should reject duplicate license purchase", async function () {
      await marketplace.connect(seller).listDataset(
        1,
        PRICE,
        0,
        TITLE,
        DESCRIPTION
      );

      await marketplace.connect(buyer).purchaseLicense(1, { value: PRICE });

      await expect(
        marketplace.connect(buyer).purchaseLicense(1, { value: PRICE })
      ).to.be.revertedWith("Already has license");
    });

    it("should reject insufficient payment", async function () {
      await marketplace.connect(seller).listDataset(
        1,
        PRICE,
        0,
        TITLE,
        DESCRIPTION
      );

      await expect(
        marketplace.connect(buyer).purchaseLicense(1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("should allow delisting", async function () {
      await marketplace.connect(seller).listDataset(
        1,
        PRICE,
        0,
        TITLE,
        DESCRIPTION
      );

      await marketplace.connect(seller).delistDataset(1);

      const listing = await marketplace.getListing(1);
      expect(listing.isActive).to.be.false;
    });

    it("should track buyer licenses", async function () {
      await marketplace.connect(seller).listDataset(
        1,
        PRICE,
        0,
        TITLE,
        DESCRIPTION
      );

      await marketplace.connect(buyer).purchaseLicense(1, { value: PRICE });

      const licenses = await marketplace.getBuyerLicenses(buyer.address);
      expect(licenses.length).to.equal(1);
      expect(licenses[0].tokenId).to.equal(1);
      expect(licenses[0].pricePaid).to.equal(PRICE);
    });

    it("should allow owner to withdraw fees", async function () {
      await marketplace.connect(seller).listDataset(
        1,
        PRICE,
        0,
        TITLE,
        DESCRIPTION
      );

      await marketplace.connect(buyer).purchaseLicense(1, { value: PRICE });

      const platformFee = (PRICE * BigInt(250)) / BigInt(10000);
      expect(await marketplace.accumulatedFees()).to.equal(platformFee);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await marketplace.connect(owner).withdrawFees();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
      expect(await marketplace.accumulatedFees()).to.equal(0);
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      await datasetNFT.connect(seller).mintDatasetNFT(
        seller.address,
        DATASET_HASH,
        IPFS_HASH,
        METADATA_URI
      );
      await marketplace.connect(seller).listDataset(
        1,
        PRICE,
        0,
        TITLE,
        DESCRIPTION
      );
    });

    it("should grant access to NFT owner", async function () {
      expect(await marketplace.hasAccess(1, seller.address)).to.be.true;
    });

    it("should grant access to licensee", async function () {
      await marketplace.connect(buyer).purchaseLicense(1, { value: PRICE });
      expect(await marketplace.hasAccess(1, buyer.address)).to.be.true;
    });

    it("should deny access to random user", async function () {
      expect(await marketplace.hasAccess(1, buyer.address)).to.be.false;
    });
  });
});
