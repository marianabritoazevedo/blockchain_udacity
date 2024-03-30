// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')
// Using this library to help with events emissions
const truffleAssertions = require('truffle-assertions')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("1", "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        // Instance of the contract
        const supplyChain = await SupplyChain.deployed()
        
        // Add a farmer
        await supplyChain.addFarmer(originFarmerID)

        // Mark an item as Harvested by calling function harvestItem(), only the farmer should be able to do this
        let stateResult = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        truffleAssertions.eventEmitted(stateResult, 'Harvested')
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        // Deploy an instance of the contract
        const supplyChain = await SupplyChain.deployed()
        itemState++; // The item was already harvested, go to the next state        
        
        // Mark an item as Processed by calling function processtItem()
        let stateResult = await supplyChain.processItem(upc, {from: originFarmerID})        

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
        truffleAssertions.eventEmitted(stateResult, 'Processed')
        
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        // Deploy an instance of the contract
        const supplyChain = await SupplyChain.deployed()
        itemState++; // The item was already processed, go to the next state            

        // Mark an item as Packed by calling function packItem()
        let stateResult = await supplyChain.packItem(upc, {from: originFarmerID})  

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')
        truffleAssertions.eventEmitted(stateResult, 'Packed')
        
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        // Deploy an instance of the contract
        const supplyChain = await SupplyChain.deployed()
        itemState++; // The item was already packed, go to the next state     

        // Mark an item as ForSale by calling function sellItem()
        let stateResult = await supplyChain.sellItem(upc, productPrice, {from: originFarmerID})  
        
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item price')
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')
        truffleAssertions.eventEmitted(stateResult, 'ForSale')
          
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        // Deploy an instance of the contract
        const supplyChain = await SupplyChain.deployed()
        itemState++; // The item was already forsale, go to the next state
        
        // Add a distributor
        await supplyChain.addDistributor(distributorID)

        // Mark an item as Sold by calling function buyItem()
        let stateResult = await supplyChain.buyItem(upc, {from: distributorID, value: productPrice}) 
        
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid DistributorID')
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')
        truffleAssertions.eventEmitted(stateResult, 'Sold')
        
    })    

    // // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        // Deploy an instance of the contract
        const supplyChain = await SupplyChain.deployed()
        itemState++; // The item was already sold, go to the next state

        // Mark an item as Shipped by calling function shipItem()
        let stateResult = await supplyChain.shipItem(upc, {from: distributorID}) 

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid DistributorID')
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State')
        truffleAssertions.eventEmitted(stateResult, 'Shipped')
              
    })    

    // // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        // Deploy an instance of the contract
        const supplyChain = await SupplyChain.deployed()
        itemState++; // The item was already shipped, go to the next state
        
        // Add a retailer
        await supplyChain.addRetailer(retailerID)

        // Mark an item as Received by calling function receiveItem()
        let stateResult = await supplyChain.receiveItem(upc, {from: retailerID}) 
        
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc) 

        // Verify the result set
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid retailerID')
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State')
        truffleAssertions.eventEmitted(stateResult, 'Received')
             
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        itemState++; // The item was already received, go to the next state
        
        // Add a consumier
        await supplyChain.addConsumer(consumerID)
        
        // Mark an item as Purchased by calling function purchaseItem()
        let stateResult = await supplyChain.purchaseItem(upc, {from: consumerID}) 

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc) 
        
        // Verify the result set
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid retailerID')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        truffleAssertions.eventEmitted(stateResult, 'Purchased')
        
    })    

    // // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        // Deploy an instance of the contract
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        
        // Verify the result set:
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        
    })

    // // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        // Deploy an instance of the contract
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc) 
        
        // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[2], productID, 'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid productNotes')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], itemState, 'Error: Missing or Invalid itemState')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Missing or Invalid retailerID')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Missing or Invalid consumerID')
    })

});

