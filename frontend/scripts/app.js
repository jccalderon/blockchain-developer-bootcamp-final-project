// Kovan Network addresses:
const CHARLIZE_ADDRESS = "0x956577835510779b19f26FD27041fEAc61C31a7d";
const CHARLIZEADMINSET_ADDRESS = "0xa786aAf5D4c8Dfc626258A5bD27B46EbAFF2b6b3";

// Rinkeby Network addresses:
// const CHARLIZE_ADDRESS = "0xD356DC99366c2c7AB66D3AaA2ECa87CF58475a06";
// const CHARLIZEADMINSET_ADDRESS = "0xBA3Dd147ED39F25589688D3Cc435C878170900ea";

const ONE_MIN = 60;
const FIVE_MIN = 300;

let roleNumber = 0;
let oracleCounter = 0;
let addressInPendingState;
let userAddress;
let reagentCreationLogs = [];
let reagentSubscriptionLogs = [];
let isAccountConnected = false;

const connectElement = document.getElementById("connect-wallet-button");

const walletInformationElement = document.getElementById("wallet-information");

const connectKovanNetwork = document.getElementById("connect-kovan-network");

const connectToProducerElement = document.getElementById("connect-to-producer");

const connectToClientElement = document.getElementById("connect-to-client");

const connectToAdminElement = document.getElementById("connect-to-admin");

const registrationElement = document.getElementById("registration");

const registrationFormTextElement = document.getElementById(
  "registration-form-text"
);

const charlizeElement = document.getElementById("charlize");

const charlizeFormTextElement = document.getElementById("charlize-form-text");

const charlizeFormElement = document.getElementById("charlize-form");

const dateTimeFormElement = document.getElementById("date-time-form");

const firstPageTextElement = document.getElementById("first-page-text");

const logOutElement1 = document.getElementById("log-out-button-1");

const logOutElement2 = document.getElementById("log-out-button-2");

const logOutElement3 = document.getElementById("log-out-button-3");

const registrationFormElement = document.getElementById("registration-form");

const validateRegistrationsElement = document.getElementById(
  "validate-registrations"
);

const successfulApplicationTextElement = document.getElementById(
  "successful-application"
);

const charlizePendingRegistrationsElement = document.getElementById(
  "charlize-pending-registrations"
);

const charlizePendingRegistrationsFormElement = document.getElementById(
  "charlize-pending-registrations-form"
);

const charlizePendingRegistrationsTextElement = document.getElementById(
  "charlize-pending-registrations-text"
);

const charlizeAddressToApproveLabelElement = document.getElementById(
  "address-to-approve-label"
);

const nextAddressElement = document.getElementById("next-address");

const approveAddressElement = document.getElementById("approve-address");

const oracleElement = document.getElementById("oracle");

const expiredReagentsElement = document.getElementById("expired-reagents");

const messageElement = document.getElementById("messages");

const transactionHashElement = document.getElementById("transaction-hash");

//***********************************************************************

window.addEventListener("load", detectWallet);

const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

window.ethereum.on("accountsChanged", reloadPageWhenAccountChanged);
window.ethereum.on("chainChanged", reloadPage);
window.ethereum.on("disconnect", reloadPage);

connectElement.addEventListener("click", connectWallet);
connectKovanNetwork.addEventListener("click", connectWallet);

connectToProducerElement.addEventListener("click", producerFunctionality);
connectToClientElement.addEventListener("click", clientFunctionality);
connectToAdminElement.addEventListener("click", adminFunctionality);

registrationFormElement.addEventListener("submit", userRegistration);

logOutElement1.addEventListener("click", goToFirstPage);
logOutElement2.addEventListener("click", goToFirstPage);
logOutElement3.addEventListener("click", goToFirstPage);

charlizeFormElement.addEventListener("submit", reagentCreationOrSubscription);

validateRegistrationsElement.addEventListener("click", validateRegistrations);

nextAddressElement.addEventListener("click", nextAddress);

// approveAddressElement.addEventListener("click", approveAddress);

charlizePendingRegistrationsFormElement.addEventListener(
  "submit",
  approveRegistrations
);

oracleFunction();
