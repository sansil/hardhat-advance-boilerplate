// function deplyFunc() {
//   console.log('Hi')
// }

const { network } = require("hardhat")

// module.exports.default = deplyFunc()

const address =
  module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const fundMe = await deploy("FundMe", {
      from: deployer,
      args: [],
      log: true
    })
  }