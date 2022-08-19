require('@nomicfoundation/hardhat-toolbox')
require('hardhat-deploy')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.8',
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1,

    }
  }
}
