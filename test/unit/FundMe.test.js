const { assert, expect } = require('chai')
const { deployments, ethers, getNamedAccounts } = require('hardhat')

describe('FundMe', async function () {
  let fundMe
  let deployer
  let mockV3Aggregator
  const sendValue = ethers.utils.parseEther('1') // 1eth
  beforeEach(async function () {
    //deploy our fundMe contract
    //obtain all accounts from hardhat
    const accounts = await ethers.getSigners()
    const accountZero = accounts[0]
    deployer = (await getNamedAccounts()).deployer
    // call and deploy all deploys with tag all
    await deployments.fixture(['all'])
    // all callings to Fundme will be from deployer
    fundMe = await ethers.getContract('FundMe', deployer)
    mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer)
  })

  describe('constructor', async function () {
    it('sets the aggregator address correctly ', async function () {
      const response = await fundMe.priceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  describe('fund', async function () {
    it("Fails if you don't send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        'You need to spend more ETH!',
      )
    })
    it('update the amount funded data structure', async function () {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.addressToAmountFunded(deployer)
      assert.equal(response.toString(), sendValue.toString())
    })
    it('add funder to our array of funders', async function () {
      await fundMe.fund({ value: sendValue })
      const funder = await fundMe.funders(0)
      assert.equal(funder, deployer)
    })
  })

  describe('withdraw', async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue })
    })

    it('withdraw ETH from a single founder', async function () {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address,
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      const transactionResponse = await fundMe.withdraw()
      const txReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = txReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address,
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      assert.equal(endingFundMeBalance, 0)
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString(),
      )
    })

    it('allows us to withdraw with multiples funders', async function () {
      const accounts = await ethers.getSigners()

      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i])
        await fundMeConnectedContract.fund({ value: sendValue })
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address,
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      const transactionResponse = await fundMe.withdraw()
      const txReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = txReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address,
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      assert.equal(endingFundMeBalance, 0)
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString(),
      )

      // check that founders are reset propertly
      await expect(fundMe.funders(0)).to.be.reverted
      for (i = 1; i < 6; i++) {
        assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0)
      }
    })

    it('allow only the owner to withdraw', async function () {
      const accounts = await ethers.getSigners()
      const attacker = accounts[1]
      const attackerConnectedContract = await fundMe.connect(attacker)
      // await attackerConnectedContract.withdraw()
      await expect(attackerConnectedContract.withdraw()).to.be.reverted
    })
  })
})
