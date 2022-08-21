const { network } = require("hardhat")
const { developmentChain, INITIAL_ANSWER, DECIMALS } = require("../helper-hardhar-config")

// module.exports.default = deplyFunc()


module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  if (developmentChain.includes(network.name)) {
    log("Local Network detected ! Deploying Mocks")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER]
    })
    log("MOCK DEPLOYED")
    log("---------------------")
  }
}

module.exports.tags = ["all", "mocks"]