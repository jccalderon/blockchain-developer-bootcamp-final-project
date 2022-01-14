async function producerFunctionality() {
  if (!isAccountConnected) {
    alert("Please, first click the Connect button at the top right");
    return;
  }
  // Producer role
  roleNumber = 1;

  firstPageTextElement.style.display = "none";
  // ?? check if an address is subscribed with a role, if it is, then
  // ?? skip registration and proceed to create a reagent
  // ?? create/subscribe implies modifying form header and adding or
  // ?? removing offset added to current date time.

  let charlize = new ethers.Contract(CHARLIZE_ADDRESS, CHARLIZE_ABI, provider);

  let isProducer = await charlize.isProducer(userAddress);

  console.log(isProducer);

  if (isProducer) {
    console.log("ready to party");
    charlizeFormTextElement.textContent = "Create a record for a reagent:";
    charlizeElement.style.display = "block";
  } else {
    registrationFormTextElement.textContent = "Register as Producer:";
    registrationElement.style.display = "block";
  }
}

async function clientFunctionality() {
  if (!isAccountConnected) {
    alert("Please, first click the Connect button at the top right");
    return;
  }
  //Client role
  roleNumber = 2;

  firstPageTextElement.style.display = "none";
  // ?? check if an address is subscribed with a role, if it is, then
  // ?? skip registration and proceed to subscribe to reagent
  // ?? create/subscribe implies modifying form header and adding or
  // ?? removing offset added to current date time.

  let charlize = new ethers.Contract(CHARLIZE_ADDRESS, CHARLIZE_ABI, provider);

  let isClient = await charlize.isClient(userAddress);

  console.log(isClient);

  if (isClient) {
    charlizeFormTextElement.textContent = "Subscribe to an existing reagent:";
    dateTimeFormElement.style.display = "none";
    charlizeElement.style.display = "block";
  } else {
    registrationFormTextElement.textContent = "Register as Client:";
    registrationElement.style.display = "block";
  }
}

async function adminFunctionality() {
  if (!isAccountConnected) {
    alert("Please, first click the Connect button at the top right");
    return;
  }

  // Admin role
  roleNumber = 3;

  firstPageTextElement.style.display = "none";

  let charlize = new ethers.Contract(CHARLIZE_ADDRESS, CHARLIZE_ABI, provider);

  let isAdmin = await charlize.isAdmin(userAddress);

  console.log(isAdmin);

  if (isAdmin) {
    console.log("Hurray!");
    validateRegistrations();
  } else {
    registrationFormTextElement.textContent = "Register as Administrator:";
    registrationElement.style.display = "block";
  }
}

async function reagentCreationOrSubscription(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const nationalDrugCode = formData.get("ndc-code");
  const lotNumber = formData.get("lot-number");
  const dateTimeOffset = formData.get("date-time-offset");
  console.log(nationalDrugCode);
  console.log(lotNumber);
  console.log(dateTimeOffset);
  console.log(roleNumber);

  let expirationDate =
    Math.round(new Date().getTime() / 1000) + parseInt(dateTimeOffset) * 60;

  console.log(expirationDate);

  let charlize = new ethers.Contract(
    CHARLIZE_ADDRESS,
    CHARLIZE_ABI,
    provider.getSigner()
  );

  if (roleNumber === 1) {
    let reagent = await charlize.createReagent(
      nationalDrugCode,
      lotNumber,
      expirationDate
    );
    console.log(reagent);
    transactionHashElement.innerText = "Transaction hash: " + reagent.hash;

    let charlizeReagentEvents = new ethers.Contract(
      CHARLIZE_ADDRESS,
      CHARLIZE_ABI,
      provider
    );
    console.log("control check 1");

    charlizeReagentEvents.once(
      "ReagentCreation",
      async (reagentNDC, reagentLotNumber, userAddress, expirationDate) => {
        console.log("Reagent Created!!");
        messageElement.innerText = "Reagent Created!!";
        console.log(reagentNDC, reagentLotNumber, userAddress, expirationDate);
        let reagentCreationLog = {
          reagentNDC: parseInt(reagentNDC._hex, 16),
          reagentLotNumber: parseInt(reagentLotNumber._hex, 16),
          userAddress: userAddress,
          expirationDate: parseInt(expirationDate._hex, 16),
        };
        console.log(reagentCreationLog);
        reagentCreationLogs.push(reagentCreationLog);
      }
    );
  } else {
    let subscriptionToReagent = await charlize.subscribeToAReagent(
      nationalDrugCode,
      lotNumber
    );
    console.log(subscriptionToReagent);
    transactionHashElement.innerText =
      "Transaction hash: " + subscriptionToReagent.hash;

    let charlizeSubscriptionToReagentEvents = new ethers.Contract(
      CHARLIZE_ADDRESS,
      CHARLIZE_ABI,
      provider
    );

    charlizeSubscriptionToReagentEvents.once(
      "SubscribedToReagent",
      async (userAddress, reagentNDC, reagentLotNumber) => {
        console.log("Subscribed to Reagent!!");
        messageElement.innerText = "Subscribed to Reagent!!";
        console.log(userAddress, reagentNDC, reagentLotNumber);
        let reagentSubscriptionLog = {
          userAddress: userAddress,
          reagentNDC: parseInt(reagentNDC._hex, 16),
          reagentLotNumber: parseInt(reagentLotNumber._hex, 16),
        };
        console.log(reagentSubscriptionLog);
        reagentSubscriptionLogs.push(reagentSubscriptionLog);
      }
    );
  }
}

async function oracleFunction() {
  let charlizeOracleEvents = new ethers.Contract(
    CHARLIZE_ADDRESS,
    CHARLIZE_ABI,
    provider
  );

  charlizeOracleEvents.on("CheckExpirationDate", async () => {
    console.log("Oracle Counter: %d", oracleCounter);
    oracleElement.innerText = "Oracle Counter: " + oracleCounter;
    oracleCounter++;
  });
}
