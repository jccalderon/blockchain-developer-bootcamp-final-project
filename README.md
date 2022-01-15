## Public Ethereum account

> **0x82E5B6F92b528a3a790FEBa20FF3bf696635C5BE**

# Charlize

Charlize is an expiration date management decentralized application (Dapp) to optimize regulated reagents utilization in medical research. Charlize's scope may broaden to medications handled in the clinic and food in wholesale and retailer stores, complementing supply chain management operations.

In medical research, chemical agents for treating subjects undergo random inspections to comply with regulatory agencies; expired reagents are a common motive of sanctions. In this context, keeping track of changes of state of reagents' data in decentralized and immutable ways serve as an invaluable tool for auditing purposes.

## How to use Charlize

1. According to their profile, producers and clients send a registration application through Charlize that an administrator must approve.
2. Producers can create reagents using their National Drug Codes (NDC), lot numbers, and expiration dates. Expiration dates are in minutes, and the minimum is 5 minutes.
3. Clients may subscribe to reagents providing National Drug Codes (NDC) and lot numbers. There is no limit on the number of digits required, but NDC is an 11-digit code, while lot numbers may have more than four digits per code.
4. The administrator role is acquired by paying a 100 Wei registration fee on the Kovan network and 1 Wei on the Rinkeby network.
5. Once a reagent expires, the Dapp will display a message containing information about the expired reagent and the clients that subscribed to such reagent.
6. To have the best experience of Charlize, perform all the operations in the same session. That is, subscribe as producer/client/administrator, create one or more reagents, subscribe to one or more reagents, approve several registration solicitudes, and finally, receive a displayed message with the expired reagents and clients associated with them. The recommendation of keeping the session open is because the current version of Charlize stores logs sent by the smart contract on memory.
7. An external oracle wakes up Charlizes to search for expired reagents every five minutes. That event is recorded in the "Oracle counter," permanently displayed on the screen.

Frontend URL: https://unruffled-euler-5a91ad.netlify.app/
Check first that the Oracle has enough balance: https://keepers.chain.link/kovan/2168

## Screencast

https://youtu.be/kFsPSUxixa0
Most of the functionality is shown during the first 5 minutes, go from minute 11:50 to the end to see the effect of the oracle.

## File structure

```
   |-- artifacts
   |-- cache
   |-- contracts        // contract folder
   |-- deploy           // deploy script folder
   |-- deployements
   |-- frontend         // frontend web app
       |-- scripts      // javascript files
           |-- ABI      // ABI files
       |-- styles       // css files
   |-- node_modules
   |-- scripts          //
   |-- test             // tests

```

## Charlize installation

1. Install the most recent versions of Node.js hardhat and yarn

2. Clone Charlize's code base:
   git clone https://github.com/jccalderon/blockchain-developer-bootcamp-final-project.git

3. Install dependencies:

```
   cd blockchain-developer-bootcamp-final-project
   yarn add @nomiclabs/hardhat-waffle
   yarn add @nomiclabs/hardhat-ethers
   yarn add ethers
   yarn add dotenv
   yarn add --dev @nomiclabs/hardhat-etherscan
   yarn add @chainlink/contracts
   yarn add --dev hardhat-deploy
   npm i -g hardhat-shorthand
```

4. Populate the .env file with type string values for ETHERSCAN_API_KEY (https://etherscan.io/apis), RINKEBY_RPC_URL (rinkeby network), and MNEMONIC (metamask wallet or similar)

5. Compile and test

```
   hh compile
   hh test
```

6. For deployement on the rinkeby network:

```
hh deploy --network rinkeby
npx hardhat verify --network rinkeby 0xB2DBE40275B5688d203ba596d248AeA596D76fE7 "1638324714" "300"  "1000"
```

## Future directions

1. Notify clients of expired reagents through email.
2. Replace the current on-memory storage of logs with a system based on Smart Contract log queries to make Charlize less session-dependent.
3. Search for expired reagents on the first day of each month as expiration dates are given in terms of month and year.
4. Transform Charlize into a Decentralized Autonomous Organization (DAO).
