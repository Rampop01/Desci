const hre = require("hardhat");

async function main() {
  console.log("Deploying DSDM contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Deploy DatasetNFT
  console.log("1. Deploying DatasetNFT...");
  const DatasetNFT = await hre.ethers.getContractFactory("DatasetNFT");
  const datasetNFT = await DatasetNFT.deploy();
  await datasetNFT.waitForDeployment();
  const datasetNFTAddress = await datasetNFT.getAddress();
  console.log("   DatasetNFT deployed to:", datasetNFTAddress);

  // Deploy DatasetMarketplace
  console.log("\n2. Deploying DatasetMarketplace...");
  const DatasetMarketplace = await hre.ethers.getContractFactory("DatasetMarketplace");
  const marketplace = await DatasetMarketplace.deploy(datasetNFTAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("   DatasetMarketplace deployed to:", marketplaceAddress);

  // Verify deployment
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE!");
  console.log("========================================\n");
  
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log(`NEXT_PUBLIC_DATASET_NFT_ADDRESS=${datasetNFTAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  
  console.log("\n\nAdd these to your .env.local file or Vercel environment variables.");
  
  // Verify contracts on Etherscan (if not localhost)
  const network = hre.network.name;
  if (network !== "localhost" && network !== "hardhat") {
    console.log("\n\nWaiting for block confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    console.log("\n3. Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: datasetNFTAddress,
        constructorArguments: [],
      });
      console.log("   DatasetNFT verified!");
      
      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [datasetNFTAddress],
      });
      console.log("   DatasetMarketplace verified!");
    } catch (error) {
      console.log("   Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
