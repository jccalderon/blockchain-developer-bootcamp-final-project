// creates the networkConfig variable using the data taken from the same
// variable in the helper-hardhat-config.js file
// https://stackify.com/node-js-module-exports/

let { networkConfig } = require("../helper-hardhat-config");
const { ethers } = require("hardhat");

module.exports = async ({
  // this a hardhat function that allows us to work with the deployer
  getNameAccounts,
  // allows things like logging
  deployments,
  // testing vs testnets
  getChainId,
}) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // deploy knows all our contracts are in the contracts folder
  // and will look for the contract charlize.so in this case
  // getNamedAccounts looks into the hardhat.config.js file for named accounts

  log("_____________________________________");

  // Here you deploy the contract
  const CharlizeAdminSet = await deploy("CharlizeAdminSet", {
    from: deployer,
    log: true,
  });
  log(
    `You have deployed a CharlizeAdminSet contract to ${CharlizeAdminSet.address}`
  );

  log("_____________________________________");

  const Charlize = await deploy("Charlize", {
    from: deployer,
    args: [1638324714, 300, CharlizeAdminSet.address, 1],
    log: true,
  });
  log(`You have deployed a Charlize contract to ${Charlize.address}`);

  //to call the "create" function from the SVGNFT contract
  // we need to create an instance of the contract
  //const CharlizeContract = await ethers.getContractFactory("Charlize")

  // adds a signer to sign transactions, hre => Hardhat runtime environment
  //const accounts = await hre.ethers.getSigners()
  //const signer = accounts[0]
  // this is the line that makes easy to make transactions, herer ethers works
  // as a Web3 instace of the contract
  // where:
  //       SVGNFT.address is the address of the contract
  //       svgNFTContract.interface is the abi
  //       signer is the deployer => accounts[0]
  //const CharlizeC = new ethers.Contract(Charlize.address, CharlizeContract.interface, signer)

  //networkConfig[chainId]['name'] this info is necesary to verify the contract on Etherscan
  //const networkName = networkConfig[chainId]['name']
  //log(`chainId: ${chainId}`)
  // log(`Verify with: \n npx hardhat verify --network ${networkName} ${Charlize.address} "1638324714" "300"  "1000"`)

  // creates an NFT
  //let TransactionResponse = await svgNFT.create(svg)
  // once the NFT is created after waiting for one block for the transaction to
  // go through you obtain a receipt
  //let receipt = await TransactionResponse.wait(1)

  //log(`You've made an NFT!`)

  //Displays the first tokenURI minted (0)
  //log(`You can view the tokenURI here ${await svgNFT.tokenURI(0)}`)
};
