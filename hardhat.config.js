require("@nomicfoundation/hardhat-chai-matchers")
require("@nomiclabs/hardhat-ganache");
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
  solidity: {
    version: "0.8.9", 
    optimizer: {
      enabled: true,
      runs: 200,
    },
  }, 
   defaultNetwork: "bsc",
   networks: {
      hardhat: {
         throwOnTransactionFailures: true,
         throwOnCallFailures: true,
         allowUnlimitedContractSize: true,
      },
      bsc: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
}
