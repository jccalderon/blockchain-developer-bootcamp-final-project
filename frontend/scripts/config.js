function detectWallet() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Wallet detected!");
  } else {
    alert("You need to install Metamask or another wallet!");
  }
}

async function connectWallet() {
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  userAddress = await signer.getAddress();
  let networkInfo = await provider.getNetwork();
  let userAddressBalance = await provider.getBalance(userAddress);
  walletInformationElement.innerText =
    "Your wallet is " +
    userAddress.substr(0, 5) +
    "..." +
    userAddress.substr(38, 43) +
    " NetId is " +
    networkInfo.name +
    " Balance: " +
    ethers.utils.formatEther(userAddressBalance) +
    " Eth";
  connectElement.innerHTML = "Connected";
  isAccountConnected = true;

  //// when an operation implies change of state like a transaction then you use
  //// the signer (provider.getSigner()), but if you are going to only read, use
  //// the provider
  //const charlize = new ethers.Contract(CHARLIZE_ADDRESS, CHARLIZE_ABI, signer);
  // const charlizeAdminset = new ethers.Contract(
  //   CHARLIZEADMINSET_ADDRESS,
  //   CHARLIZEADMINSET_ABI,
  //   signer
  // );

  // let transaction = await charlize.registerUser(2, "xyx@gmail.com");
  // console.log(transaction);
}

function reloadPage() {
  window.location.reload();
}

function reloadPageWhenAccountChanged() {
  connectWallet();
  goToFirstPage();
}

function goToFirstPage() {
  firstPageTextElement.style.display = "block";
  registrationElement.style.display = "none";
  charlizeElement.style.display = "none";
  charlizePendingRegistrationsElement.style.display = "none";
  messageElement.innerText = "";
  transactionHashElement.innerText = "";
}

async function userRegistration(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const enteredEmail = formData.get("user-email");
  console.log(enteredEmail);
  console.log(roleNumber);
  const charlize = new ethers.Contract(
    CHARLIZE_ADDRESS,
    CHARLIZE_ABI,
    provider.getSigner()
  );
  const charlizeAdminset = new ethers.Contract(
    CHARLIZEADMINSET_ADDRESS,
    CHARLIZEADMINSET_ABI,
    provider.getSigner()
  );

  // Admin registration, role = 3
  if (roleNumber === 3) {
    console.log("asking for admin registration");
    let transaction = await charlizeAdminset.registerAdmin(CHARLIZE_ADDRESS, {
      value: 100,
    });
    // Contract instance for reading
    console.log(transaction);
    transactionHashElement.innerText = "Transaction hash: " + transaction.hash;
    let charlizeUserRegEvents = new ethers.Contract(
      CHARLIZE_ADDRESS,
      CHARLIZE_ABI,
      provider
    );
    // Event listener configuration (event: AccessGranted)
    charlizeUserRegEvents.once(
      "AccessGrantedToAdmin",
      (adminApplicant, userState, registrationAdminDate) => {
        console.log("Admin registration successfuly approved:");
        console.log(adminApplicant, userState, registrationAdminDate);
        successfulApplicationTextElement.style.display = "block";
        messageElement.innerText = "Admin registration successfuly approved";
      }
    );
    // Producer/Client registrations roles 1 or 2
  } else {
    console.log("Registration in progress...");
    messageElement.innerText = "Registration in progress...";
    let transaction = await charlize.registerUser(roleNumber, enteredEmail);
    console.log(transaction);
    transactionHashElement.innerText = "Transaction hash:" + transaction.hash;
    // Contract instance for reading
    let charlizeUserRegEvents = new ethers.Contract(
      CHARLIZE_ADDRESS,
      CHARLIZE_ABI,
      provider
    );
    // Event listener configuration (event: UserRegistered)
    charlizeUserRegEvents.once(
      "UserRegistered",
      (msgSender, roleNumber, email, stateOfUser, registrationDate) => {
        console.log("Registration successfuly submitted:");
        console.log(
          msgSender,
          roleNumber.toString(),
          email,
          stateOfUser,
          registrationDate
        );
        console.log("Now, it requires admin approval");
        messageElement.innerText =
          "Registration successfuly submitted. Now, it requires admin approval.";
      }
    );
  }
  // let transaction = await charlize.registerUser(roleNumber, enteredEmail);
  // console.log(transaction);
}

async function validateRegistrations() {
  // setup of pending registrations form
  registrationElement.style.display = "none";
  successfulApplicationTextElement.style.display = "none";
  charlizePendingRegistrationsElement.style.display = "block";
  //nextAddressElement.style.display = "none";

  let charlize = new ethers.Contract(CHARLIZE_ADDRESS, CHARLIZE_ABI, provider);
  console.log("displays form with loading... message");

  let arrayLength = await charlize.getLengthAddressInPendingStateArray();
  let arrayLengthInt = parseInt(arrayLength._hex, 16);
  console.log("Int: %d", arrayLengthInt);
  // console.log("here:");
  // console.log(arrayLength);
  // console.log(ethers.BigNumber.isBigNumber(arrayLength));
  // console.log("hex:");
  // console.log(parseInt(arrayLength._hex, 16));
  // console.log("aquí de nuevo");

  if (arrayLengthInt === 0) {
    charlizePendingRegistrationsFormElement.style.display = "none";
    // text: There are no registrations to approve!
    charlizePendingRegistrationsTextElement.style.display = "block";
  } else {
    // read from contract address in pending state
    let addressRead = await charlize.getAddressInPendingState(
      arrayLengthInt - 1
    );
    // text: displays address to approve
    charlizeAddressToApproveLabelElement.textContent = addressRead;
    addressInPendingState = addressRead;
  }

  // let addressRead = await charlize.getAddressInPendingState(0);

  // console.log("next:");
  // console.log(addressRead);

  // let isproducer = await charlize.isProducer(
  //   "0x7997ef9b16c57E3737BEA15D2Cc339D2c45e78B5"
  // );
  // console.log("is producer?");
  // console.log(isproducer);

  // let isadmin = await charlize.isAdmin(
  //   "0x4Cb43B169270F1bFB97716291C9Dc53B1878Ef69"
  // );
  // console.log("is admin?");
  // console.log(isadmin);

  // charlize = new ethers.Contract(
  //   CHARLIZE_ADDRESS,
  //   CHARLIZE_ABI,
  //   provider.getSigner()
  // );

  // await charlize.popAddressInPendingState();

  // arrayLength === 0 means the ddressInPendingStateArray is empty

  // let addressRead = await charlize.getPendingStateAddress();
  // charlizeAddressToApproveLabelElement.textContent = addressRead;
  // addressInPendingState = addressRead;

  // if (arrayLength === 0) {
  //   // text: There are no registrations to approve!
  //   charlizePendingRegistrationsTextElement.style.display = "block";
  // } else {
  //   let addressRead = charlize.getPendingStateAddress();
  //   // text: displays address to approve
  //   charlizeAddressToApproveLabelElement.textContent = addressRead;
  //   addressInPendingState = addressRead;
  // }
}

async function approveRegistrations(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  let addressToApproveOn = formData.get("address-to-approve");
  if (addressToApproveOn === "on") {
    console.log("on was clicked");

    let charlize = new ethers.Contract(
      CHARLIZE_ADDRESS,
      CHARLIZE_ABI,
      provider
    );
    // Obtains user role number at registration time
    let userRoleNumber = await charlize.getRoleNumberOfUserAddress(
      addressInPendingState
    );
    console.log(userRoleNumber);
    let userRoleNumberInt = parseInt(userRoleNumber._hex, 16);
    console.log("users role: %d", userRoleNumberInt);

    charlize = new ethers.Contract(
      CHARLIZE_ADDRESS,
      CHARLIZE_ABI,
      provider.getSigner()
    );
    // Approves user application changing state to ACCEPTED
    approvalTransaction = await charlize.grantAccess(
      addressInPendingState,
      userRoleNumberInt
    );
    console.log(approvalTransaction);
    transactionHashElement.innerText =
      "Transaction hash: " + approvalTransaction.hash;

    let charlizeApproveEvents = new ethers.Contract(
      CHARLIZE_ADDRESS,
      CHARLIZE_ABI,
      provider
    );
    // Event listener configuration (event: AccessGranted)
    charlizeApproveEvents.once(
      "AccessGrantedToUser",
      (userAddress, stateOfUser, registrationDate) => {
        console.log("Application Accepted!");
        messageElement.innerText = "Application Accepted!";
        console.log(userAddress, stateOfUser, registrationDate);
        //nextAddressElement.style.display = "block";
        //approveAddressElement.style.display = "none";
      }
    );
  } else {
    // TODO: To be developed in the future
    console.log("on was not clicked");
  }
}

async function nextAddress() {
  console.log("next");

  let charlize = new ethers.Contract(
    CHARLIZE_ADDRESS,
    CHARLIZE_ABI,
    provider.getSigner()
  );

  let popAddressFromArray = await charlize.popAddressInPendingState();
  console.log(popAddressFromArray);
  transactionHashElement.innerText =
    "Transaction hash: " + popAddressFromArray.hash;

  let charlizePopAddressEvents = new ethers.Contract(
    CHARLIZE_ADDRESS,
    CHARLIZE_ABI,
    provider
  );

  charlizePopAddressEvents.once(
    "PoppedAddressFromPendingStateArray",
    (userAddress, stateOfUser, registrationDate) => {
      console.log("Address popped!");
      messageElement.innerText = "Address popped!";
      console.log(userAddress, stateOfUser, registrationDate);
      //charlizePendingRegistrationsFormElement.style.display = "none";
      //charlizePendingRegistrationsTextElement.style.display = "block";
      //nextAddressElement.style.display = "block";
      //approveAddressElement.style.display = "none";
    }
  );

  // let charlizePopAddressEvents = new ethers.Contract(
  //   CHARLIZE_ADDRESS,
  //   CHARLIZE_ABI,
  //   provider
  // );
  // // Event listener configuration (event: UserRegistered)
  // charlizePopAddressEvents.on(
  //   "AccessGranted",
  //   (userAddress, stateOfUser, registrationDate) => {
  //     console.log("Registration successfuly submited:");
  //     console.log(msgSender, stateOfUser, registrationDate);
  //     console.log("Application Accepted!");
  //   }
  // );

  // turned off
  // registrationElement.style.display = "none";
  // successfulApplicationTextElement.style.display = "none";
  // charlizePendingRegistrationsElement.style.display = "block";
  // nextAddressElement.style.display = "none";

  // registrationElement.style.display = "none";
  // successfulApplicationTextElement.style.display = "none";
  // charlizePendingRegistrationsElement.style.display = "block";
}

// async function approveAddress() {
//   console.log("approve");
//   // registrationElement.style.display = "none";
//   // successfulApplicationTextElement.style.display = "none";
//   // charlizePendingRegistrationsElement.style.display = "block";
// }
