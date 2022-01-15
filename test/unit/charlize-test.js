const { expect } = require("chai");
// const BN = require('bn.js');
const { ethers } = require("hardhat");

describe("Charlize Unit Test", function () {
  let owner, admin, producer, client;

  //  basic:
  //  basic setup for all the tests:
  //     - deploy Charlize and CharlizeAdminSet contracts
  //     - create accounts
  beforeEach(async function () {
    CharlizeAdminSet = await ethers.getContractFactory("CharlizeAdminSet");
    [owner, admin, producer, client] = await ethers.getSigners();

    charlizeAdminSet = await CharlizeAdminSet.deploy();

    await charlizeAdminSet.deployed();

    CharlizeContract = await ethers.getContractFactory("Charlize");

    charlizeContract = await CharlizeContract.deploy(
      1638646924,
      300,
      charlizeAdminSet.address,
      1
    );

    await charlizeContract.deployed();
  });

  describe("Should set the right owner", function () {
    it("Should set the right owner for CharlizeAdminSet ", async function () {
      expect(await charlizeAdminSet.owner()).to.equal(owner.address);
    });

    it("Should set the right owner for Charlize", async function () {
      expect(await charlizeContract.owner()).to.equal(owner.address);
    });
  });

  // basic +
  // admin registration:
  // Checks the process of sending a transaction to Charlize
  // using to cover the registration fee for the admin role
  //      - TODO: transaction reverted using charlizeAdminSet as a proxy
  //      - transaction success
  describe("Admin registration", function () {
    it("Should register admin and change admin's state to ACCEPTED", async () => {
      await charlizeAdminSet
        .connect(admin)
        .registerAdmin(charlizeContract.address, { value: 1 });
      // await charlizeContract.getUserState(admin.address);
      expect(await charlizeContract.getUserState(admin.address)).to.equal(1);
      //expect(await charlizeContract.userAddressToState[admin]).to.equal(User.State.ACCEPTED);
      //await expect(() => charlizeAdminSet.connect(admin).registerAdmin({value: 1})).to.changeEtherBalance(owner, 1);
    });
  });

  // basic +
  // admin registration (transaction success) +
  // User registration (Producer/Client):
  // emulates the whole process for a client of sending a registration solicitude
  // and being approved by the admin changing client's status from PENDING to ACCEPTED
  //      logs
  //      transaction success
  //      registration approved by admin
  //      TODO: transaction reverted
  describe("User registration", function () {
    it("Should register producer assigning PENDING state", async () => {
      await charlizeContract.connect(producer).registerUser(1, "x@yxz.com");
      expect(await charlizeContract.getUserState(producer.address)).to.equal(0);
      //expect(await charlizeContract.isProducer(producer.address)).to.equal(true);
    });

    it("Should register client assigning PENDING state", async () => {
      await charlizeContract.connect(client).registerUser(2, "y@yxz.com");
      expect(await charlizeContract.getUserState(client.address)).to.equal(0);
      //expect(await charlizeContract.isProducer(producer.address)).to.equal(true);
    });

    it("Should grant PRODUCER role and ACCEPTED state", async () => {
      await charlizeAdminSet
        .connect(admin)
        .registerAdmin(charlizeContract.address, { value: 1 });
      await charlizeContract.connect(producer).registerUser(1, "x@yxz.com");
      await charlizeContract.connect(admin).grantAccess(producer.address, 1);
      expect(await charlizeContract.isProducer(producer.address)).to.equal(
        true
      );
      expect(await charlizeContract.getUserState(producer.address)).to.equal(1);
    });

    it("Should grant CLIENT role and ACCEPTED state", async () => {
      await charlizeAdminSet
        .connect(admin)
        .registerAdmin(charlizeContract.address, { value: 1 });
      await charlizeContract.connect(client).registerUser(2, "y@yxz.com");
      await charlizeContract.connect(admin).grantAccess(client.address, 2);
      expect(await charlizeContract.isClient(client.address)).to.equal(true);
      expect(await charlizeContract.getUserState(client.address)).to.equal(1);
    });
  });

  // basic +
  // admin registration (transaction success)
  // producer registration (transaction success)
  // registration approved by admin
  // reagent creation:
  // The whole process of creating a reagent and checking that the
  // contract emits the corresponding logs
  //      logs
  //      transaction success
  //      TODO: transaction reverted if try to create the same reagents (TWICE)
  describe("Reagent creation", function () {
    it("Should create a Reagent", async () => {
      await charlizeAdminSet
        .connect(admin)
        .registerAdmin(charlizeContract.address, { value: 1 });
      await charlizeContract.connect(producer).registerUser(1, "x@yxz.com");
      await charlizeContract.connect(admin).grantAccess(producer.address, 1);
      const reagentNDC = 55555;
      const reagentLotNumber = 44444;
      const expirationDate = 1641533876;
      //await charlizeContract.connect(producer).createReagent(reagentNDC, reagentLotNumber, expirationDate);
      //expect().to.emit().withArgs();
      expect(
        await charlizeContract
          .connect(producer)
          .createReagent(reagentNDC, reagentLotNumber, expirationDate)
      )
        .to.emit(charlizeContract, "ReagentCreation")
        .withArgs(
          /*charlizeContract.reagentId(reagentNDC, reagentLotNumber),*/
          reagentNDC,
          reagentLotNumber,
          producer.address,
          expirationDate
        );
    });
  });

  // basic
  // admin registration (transaction success)
  // producer registration (transaction success)
  // client registration (transaction success)
  // registration approved by admin TWICE
  // reagent creation TWICE
  // reagent subscription:
  // Emulates the whole process of a client subscribing to a reagent
  // and checking of corresponding logs
  //      logs
  //      transaction success
  //      transaction reverted if try to subscribe to non-existing reagent
  describe("Subscription to reagent", function () {
    it("Should subscribe a client to a reagent", async () => {
      await charlizeAdminSet
        .connect(admin)
        .registerAdmin(charlizeContract.address, { value: 1 });
      await charlizeContract.connect(producer).registerUser(1, "x@yxz.com");
      await charlizeContract.connect(admin).grantAccess(producer.address, 1);
      const reagentNDC = 55555;
      const reagentLotNumber = 44444;
      const expirationDate = 1641533876;
      await charlizeContract
        .connect(producer)
        .createReagent(reagentNDC, reagentLotNumber, expirationDate);
      await charlizeContract.connect(client).registerUser(2, "y@yxz.com");
      await charlizeContract.connect(admin).grantAccess(client.address, 2);
      //await charlizeContract.connect(client).subscribeToAReagent(reagentNDC, reagentLotNumber);
      expect(
        charlizeContract
          .connect(client)
          .subscribeToAReagent(reagentNDC, reagentLotNumber)
      )
        .to.emit(charlizeContract, "SubscribedToReagent")
        .withArgs(client.address, reagentNDC, reagentLotNumber);
    });
  });
});
