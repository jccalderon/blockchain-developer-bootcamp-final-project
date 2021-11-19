// SPDX-License-Identifier: GPL-3.0

/// @title Charlize - expiration date management Dapp 
/// @author Juan Carlos Calderon Martinez
///         For access control, part of the code uses as a 
///         reference the article "How to use AccessControl.sol""
///         from Aberto Cuesta Cañada
///         https://medium.com/coinmonks/how-to-use-accesscontrol-sol-9ea3a57f4b15   
/// @notice Producers create reagent profiles and clients
///         register to receive an email alert when the bought 
///         reagent, already created by the producer, expired
/// @dev The contract uses an oracle 
/// @custom:experimental This is a Minimum Viable Product.

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
contract Charlize is KeeperCompatibleInterface, Ownable, AccessControl{
    
    uint256 initialTimestamp;
    // Last time the keeper executed the performUpkeep function
    uint256 lastUpkeep;
    
    bytes32 public constant PRODUCER = keccak256("PRODUCER");
    bytes32 public constant CLIENT = keccak256("CLIENT");
    bytes32 public constant ADMIN = keccak256("ADMIN");

    enum userState{

        PENDING,
        ACCEPTED,
        REJECTED
        //TODO: RETIRED for those whose access is revoked

    }



    constructor(uint256 _initialTimestamp){

        
        initialTimestamp = _initialTimestamp;
        lastUpkeep = _initialTimestamp;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN, DEFAULT_ADMIN_ROLE);


    }

    /// ***********************************************************************

    ///@dev MODIFIERS:

    /// @dev restricts access to the admin role      
    modifier onlyAdmin(){
        requiere(isAdmin(msg.sender), "Restricted to admin");
        _;
    }

    /// @dev restricts access to the Producer role 
    modifier onlyProducer(){
        require(isProducer(msg.sender), "Restricted to Producers");
        _;
    }
    /// /// @dev restricts access to the Client role 
    modifier onlyClient(){
        require(isClient(msg.sender), "Restricted to clients");
        _;
    }


    /// ***********************************************************************

    /// @dev ACCESS CONTROL FUNCTIONS:

    
    /// @dev Returns true if the userAddress belongs to the admin role.   
    /// @param userAddress
    function isAdmin(address userAddress) public virtual view returns (bool){
        return hasRole(DEFAULT_ADMIN_ROLE, userAddress);
    }

    /// @dev Returns true if the userAddress belongs to a producer
    function isProducer(address userAddress) public virtual view returns(bool){
        return hasRole(PRODUCER, userAddress);

    }
    /// @dev Returns true if the userAddress belongs to a client
    function isClient(address userAddress ) public virtual view returns(bool){
        return hasRole(CLIENT, userAddress);
    }

    /// @notice 

    function pendingUsers() public view onlyAdmin{

        //returns users that are in pending state

    }
    ///  @notice  
    function grantAccess(){
        // admin grants access
        // admin, if successful, changes state of registered user 
        // from pending to accepted
        // admin, if unccessful, changes state of registered user
        // from pending to rejected
    }

    function revokeAccess(){
        // TODO:
        // admin revokes access 
        // admin changes state of registered user to retired
        

    }

    function changeUserFromRetiredOrRejectedToPending () public onlyOwner{
        // TODO: one address at a time, the owner of the contracts is 
        // the only one allowed to change the state of a retired or rejected
        // user to a pending state the admin can change to accept

    }


    // ***********************************************************************

    /// @dev USER REGISTRATION FUNCTIONS:


    /// @notice registers users (producer or client)
    /// @dev stores user's data in a User struct containing: 
    ///     -string  companyName
    ///     -enum    role {Producer, Client}
    ///     -string  email
    ///     -uint256 companyId 
    ///     User's data is stored in a mapping (companyId => User)
    ///     User's message.sender address is related to a companyId  - mapping(address => companyID)

    /// @param  role, email 
    /// @return boolean true if successfully registered, false if registration failed.
    function registerUser(string memory role, string memory email) public returns(bool){
    // user sends application form with data.
    // contract checks the user's address is not already registered  
    // Data is stored in an array of structs.
    // Each user is assigned a pending state. 
    // DEFAULT_ADMIN_ROLE in another function reads the data of the users in pending state
    // DEFAULT_ADMIN_ROLE grants access to users and changes state of users accepted
    // DEFAULT_ADMIN_ROLE may not grant access to users and changes state of users to rejected

    }

    // ***********************************************************************

    /// @dev REAGENT FUNCTIONS:

    /// @notice creates a reagent
    /// @dev stores reagent's data in a Reagent struct containing: 
    ///     -string  NDC (National Drug Code)
     ///    -uint256 lotNumber    
    ///     -string  expirationDate (month, year) 
    ///     -uint256 companyId 
    ///     -uint256 reagentID   
    ///     -enum Reagent.State (Usable, Expired)
    ///     Reagent's data is stored in a mapping (companyId => User)
    /// @param NDC, lotNumber, expirationDate
    /// @return boolean true if successfully created, false if creation failed.
    function createReagent(uint256 NDC, uint256 lotNumber, string memory expirationDate) public returns(bool){
        require(hasRole(PRODUCER, msg.sender), "Caller is not a Producer");

    }

    /// ***********************************************************************

    /// @dev REAGENT DATA MANAGEMENT FUNCTIONS:

    /// @notice gets data about a particular reagent
    /// @dev looks up data of a particular reagent
    /// @param NDC, lotNumber
    /// @return expirationDate
    function getReagentData(uint256 NDC, uint256 lotNumber ) public returns(string memory expirationDate){
        require(hasRole(CLIENT, msg.sender), "Caller is not a Client");

    }
    /// ***********************************************************************

    /// @dev ORACLE FUNCTIONS:

    /// @dev Oracle functions:
    ///      Oracle used: Chainlink's keeper
    ///      the keeper uses checkUpkeep and performUpkee functions.
    ///      Off-chain a keeper node runs a simulation of the checkUpkeep function.
    ///      when a condition is met, the keeper broadcasts
    ///      a transaction to the blockchain executing the 
    ///      performUpkeep function. When the performUpkeep function is executed
    ///      an email is sent to all the Clients whose reagent has expired.
    ///      When the current date corresponds to the first day of the month, the 
    ///      condition is met. However, for testing purposes, when the condition will 
    ///      be met every hour.  
    /// @param /*checkData*/ (not used in this case)
    /// @return upkeepNeeded (if true the keeper executes the performUpkeep function)
    ///         /*performData*/ not used  
    function checkUpkeep(bytes memory /*checkData*/) 
        external view override 
        returns (bool upkeepNeeded, bytes memory /* performData */) {

            require(block.timestamp >= initialTimestamp);
            upkeepNeeded = (block.timestamp - lastUpkeep) > 1 hours;  

    }

    /// @param /*performData*/ (not used in this case)
    function performUpkeep(bytes calldata /*performData*/) external override {

    
        // check what has expired 
        lastUpkeep = block.timestamp;
    }   
    
}
















