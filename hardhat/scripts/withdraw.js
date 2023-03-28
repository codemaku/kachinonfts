const { ethers } = require("hardhat");

async function main() {
  const MyContract = await ethers.getContractFactory("KachinoNFTs");
  const contract = await MyContract.attach(
    "0xb612AcB756Ea2662208A69c576FcFBAf87EC9b37" // The deployed contract address
  );

  // Now you can call functions of the contract
  await contract.withdraw();
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
