pragma solidity 0.8.10;

// SPDX-License-Identifier: MIT

/// @title Charlize - expiration date management Dapp 
/// @author Juan Carlos Calderon Martinez
/// @notice Producers create reagent profiles and clients
///         register to receive an email alert when the bought 
///         reagent, already created by the producer, expired
/// @dev The contract uses an oracle for the smart contract to 
///      periodically wakeup and check what reagents expired by 
//       emiting an event
/// @custom:experimental This is a Minimum Viable Product.

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


contract Charlize is KeeperCompatibleInterface, Ownable, AccessControl{
    
    /// ***********************************************************************
    ///@dev VARIABLES:

    uint256 public initialTimestamp;
    // Oracle's periodicity used to check what reagent has expired
    /// @dev to ease the process of testing, set this variable to 5 minutes(300 seconds);
    uint256 public intervalTime;
    // Last time the keeper executed the performUpkeep function
    uint256 public lastUpkeep; 
    // helps to check the keeper is working
    uint256 public counter;
    
    uint256 public reagentCount;
    
    uint256 public producerCount;
    
    uint256 public userApplicationCount;
    
    uint256 public balance;
    
    uint256 public adminApplicationFee;
    
     /// ***********************************************************************
    ///@dev CONSTANTS:
    
    // PRODUCER is role: 1
    bytes32 public constant PRODUCER = keccak256("PRODUCER");
    // CLIENT is role: 2
    bytes32 public constant CLIENT = keccak256("CLIENT");
    // ADMIN is role: 3
    bytes32 public constant ADMIN = keccak256("ADMIN");
    
    /// ***********************************************************************
    ///@dev ARRAYS:

    address[] public addressesInPendingState;
    
    
    /// ***********************************************************************
    ///@dev MAPPINGS:

    mapping(address => UserState) userAddressToStateOfUser;
    mapping(address => uint256) userAddressToRegistrationDate;
    mapping(bytes32 => uint256) reagentIDToReagentCreationDate;
    mapping(address => uint256) userAddressToRoleNumber;
    
    
     /// ***********************************************************************
    ///@dev EVENTS:
    
    event ReagentCreation(/*bytes32 indexed reagentID,*/ uint256 reagentNDC, uint256 reagentLotNumber, address producerAddress, uint256 indexed expirationDate);
    event SubscribedToReagent(address indexed clientAddress, uint256 indexed reagentNDC, uint256 indexed reagentLotNumber);
    event UserRegistered(address indexed userAddress, uint256 roleNumber, string email, UserState indexed stateOfUser, uint256 indexed registrationDate);
    event CheckExpirationDate();
    event AccessGrantedToAdmin(address indexed userAddress, UserState indexed stateOfUser, uint256 indexed registrationDate);
    event AccessGrantedToUser(address indexed userAddress, UserState indexed stateOfUser, uint256 indexed registrationDate);
    event LogDeposit(address adminApplicantAddress);
    event PoppedAddressFromPendingStateArray(string poppedAddress);
    
    
    /// ***********************************************************************
    ///@dev ENUMS:

    enum UserState{

        PENDING,
        ACCEPTED,
        REJECTED,
        RETIRED

    }
    
    
    
    /// ***********************************************************************
    /// @dev CONSTRUCTOR:
    
    
        constructor(uint256 _initialTimestamp, uint256 _intervalTime, address _admin, uint256 _adminApplicationFee){

        
        initialTimestamp = _initialTimestamp;
        intervalTime= _intervalTime;
        lastUpkeep = _initialTimestamp;
        adminApplicationFee = _adminApplicationFee;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);


    }
    /// ***********************************************************************

    ///@dev MODIFIERS:
    
    /// @dev restricts access to the Producer role 
    modifier onlyProducer(){
        require(isProducer(msg.sender), "Restricted to Producers");
        //require(true, "Restricted to Producers"); //???
        _;
    }    

    /// /// @dev restricts access to the Client role 
    modifier onlyClient(){
        require(isClient(msg.sender), "Restricted to clients");
        // To test wiwthout admin
        //require(true, "Restricted to clients"); //???
        _;
    }


    /// @dev restricts access to the admin role      
    modifier onlyAdmin(){
        require(isAdmin(msg.sender), "Restricted to admin");
        // To test wiwthout admin
        //require(true, "Restricted to admin"); //???
        _;
    }


    
    /// ***********************************************************************

    /// @dev ACCESS CONTROL FUNCTIONS:
    
    
    /// @dev checks if the message sender is the admin   
    /// @param userAddress corresponds to the address of the user invoking the function
    /// @return bool, true if the user address belongs to the admin role
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


    ///  @dev admin, if successful, changes state of registered user 
    /// from pending to accepted
    /// admin, if unccessful, changes state of registered user
    /// from pending to rejected
    function grantAccess(address userAddress, uint256 roleNumber) public virtual onlyAdmin{

        require(userAddressToStateOfUser[userAddress] == UserState.PENDING, "User is not in pending state or wrong address");
        require(roleNumber > 0 || roleNumber < 3, "Invalid role number!");
        bytes32 role;
        if (roleNumber == 1) {
            role = PRODUCER;
        }
        if (roleNumber == 2) {
            role = CLIENT;
        }
        grantRole(role, userAddress);
        userAddressToStateOfUser[userAddress] = UserState.ACCEPTED;
        uint256 registrationDate = block.timestamp;
        emit AccessGrantedToUser(userAddress, UserState.ACCEPTED, registrationDate);
        
    }
    /// @dev the following is a set of helper functions to manage an array of 
    /// users whose registration is in PENDING state. Users soliciting registration
    /// are pushed into the array, and users with approved registration are popped  
    function getAddressInPendingState(uint256 positionInArray) public view returns (address) {
        return addressesInPendingState[positionInArray];
    }

    function pushAddressInPendingState(address addressInPendingState) public {
        addressesInPendingState.push(addressInPendingState);
    }

    function popAddressInPendingState() public {
        addressesInPendingState.pop();
        emit PoppedAddressFromPendingStateArray("Address popped");
    }

    function getLengthAddressInPendingStateArray()  public view returns(uint256){
        return addressesInPendingState.length;
    }

    function getRoleNumberOfUserAddress(address userAddress) public view returns(uint256){
        return userAddressToRoleNumber[userAddress];
    }


    function revokeAccess(address userAddress) public virtual onlyOwner{
        // TODO:
        // admin revokes access 
        // ONLY onlyOwner can revoke admin roles
        // admin changes state of registered user to retired
        

    }

    function changeUserFromRetiredOrRejectedToPending () public onlyOwner{
        // TODO: one address at a time, the owner of the contracts is 
        // the only one allowed to change the state of a retired or rejected
        // user to a pending state the admin can change to accept
        // a pending state allows the user to be reactivated

    }


    // ***********************************************************************

    /// @dev USER REGISTRATION FUNCTIONS:    
    
    /// @dev user sends application form with data (registrations).
    /// contract checks the user's address is not already registered  
    /// Each user is assigned a pending state. 
    /// DEFAULT_ADMIN_ROLE in another function reads the data of the users in pending state
    /// DEFAULT_ADMIN_ROLE grants access to users and changes state of users accepted
    /// TODO: DEFAULT_ADMIN_ROLE may not grant access to users and changes state of users to rejected
    function registerUser(uint256 roleNumber, string memory email) public{

    require(userAddressToRegistrationDate[msg.sender] == 0, "This user is already registered, contact Admin");
    userApplicationCount = userApplicationCount + 1;
    UserState stateOfUser = UserState.PENDING;
    pushAddressInPendingState(msg.sender);
    userAddressToRoleNumber[msg.sender] = roleNumber;
    userAddressToStateOfUser[msg.sender] = stateOfUser; 
    uint256 registrationDate = block.timestamp;
    userAddressToRegistrationDate[msg.sender] = registrationDate;
    emit UserRegistered( msg.sender, roleNumber, email, stateOfUser, registrationDate);

    }
    
    
    // ***********************************************************************

    /// @dev ADMIN REGISTRATION FUNCTIONS:        
    
    /// @dev register an address as admin after the payment of a registration fee
    /// the grantRole helper function, coming from the  AccessControl contract (Openzeppelin) only 
    /// allows its usage to addresses that were declared as admins through the contract's constructor.
    /// Thus, charlizeAdminSet serves as proxy for this transactions  
    function registerAdmin(address adminApplicant) public payable returns(uint256){

        require(userAddressToRegistrationDate[adminApplicant] == 0, "This Admin is already registered");
        require(msg.value == adminApplicationFee * 1 wei, "Value transfered is not enough to cover Admin application");
        balance += msg.value;
        console.log("Admin application fee received");
        grantRole(DEFAULT_ADMIN_ROLE, adminApplicant);
        userAddressToStateOfUser[adminApplicant] = UserState.ACCEPTED;
        uint256 registrationAdminDate = block.timestamp;
        userAddressToRegistrationDate[adminApplicant] = registrationAdminDate;
        emit AccessGrantedToAdmin(adminApplicant, UserState.ACCEPTED, registrationAdminDate);
        console.log("address: %s granted admin role on %s", adminApplicant, registrationAdminDate);
        return registrationAdminDate;
        
    
    }
    
    function getUserState(address userAddress) public view returns(UserState){

        return userAddressToStateOfUser[userAddress];        

    }
    
    /// ***********************************************************************

    /// @dev PRODUCER FUNCTIONS:
    
    function createReagent(uint256 reagentNDC, uint256 reagentLotNumber, uint256 expirationDate) 
        public onlyProducer{

        bytes32 reagentID = reagentId(reagentNDC, reagentLotNumber);
        require(!(reagentIDToReagentCreationDate[reagentID] > 0), "Reagent already existing!");
        uint256 reagentCreationDate = block.timestamp; 
        reagentIDToReagentCreationDate[reagentID] = reagentCreationDate;
        reagentCount = reagentCount + 1;
        console.log(reagentNDC, reagentLotNumber, msg.sender, expirationDate);
        emit ReagentCreation(/*reagentID,*/reagentNDC, reagentLotNumber, msg.sender, expirationDate);
        
    }

    /// ***********************************************************************

    /// @dev CLIENT FUNCTIONS:
    
    function subscribeToAReagent(uint256 reagentNDC, uint256 reagentLotNumber) 
        public onlyClient{

        bytes32 reagentID = reagentId(reagentNDC, reagentLotNumber);
        require(reagentIDToReagentCreationDate[reagentID] > 0, "Solicited Reagent doesn't exist, contact Admin");
        // uint256 subscriptionDate = block.timestamp;
        console.log("subscribed to reagentID");
        emit SubscribedToReagent(msg.sender, reagentNDC, reagentLotNumber);
        
        
    }
    
    /// @dev helper function to ease the management of reagents data by assigning a single identifier
    /// to each reagent, through a hash of NDC and lotnumber  
    function reagentId(uint256 reagentNDC, uint256 reagentLotNumber) public pure returns(bytes32){
        
         return keccak256(abi.encode(reagentNDC, reagentLotNumber));
        
    } 
    
    /// ***********************************************************************

    /// @dev ORACLE FUNCTIONS:

    /// @dev Oracle functions:
    ///      Oracle used: Chainlink's keeper
    ///      the keeper uses checkUpkeep and performUpkee functions.
    ///      Off-chain a keeper node runs a simulation of the checkUpkeep function.
    ///      when a condition is met, the keeper broadcasts
    ///      a transaction to the blockchain executing the 
    ///      performUpkeep function. When the performUpkeep function is executed emits
    ///      an event that a handler at the frontend is ready to listen.
    ///      When the current date corresponds to the first day of the month, the 
    ///      condition is met. However, for testing purposes, the condition will 
    ///      be met every 5 minutes.  
    /// @param /*checkData*/ (not used in this case)
    /// @return upkeepNeeded (if true the keeper executes the performUpkeep function)
    ///         /*performData*/ not used  
    function checkUpkeep(bytes memory /*checkData*/) 
        external view override
        returns (bool upkeepNeeded, bytes memory /* performData */) {

            require(block.timestamp >= initialTimestamp);
            upkeepNeeded = (block.timestamp - lastUpkeep) >= intervalTime;  

    }

    /// @param /*performData*/ (not used in this case)
    function performUpkeep(bytes calldata /*performData*/) external override{
        
        require((block.timestamp - lastUpkeep) >= intervalTime);

        uint256 currentTimestamp = block.timestamp;
        
        counter = counter + 1;
        
        emit CheckExpirationDate();
        
        // check what has expired 
        lastUpkeep = currentTimestamp;
    }   
    
    /// ***********************************************************************

    /// @dev FALLBACK FUNCTION:
    receive() external payable{
        balance += msg.value;
    }
    fallback() external {
        require(msg.data.length == 0);
        emit LogDeposit(msg.sender);
    }
    
}


// @dev proxy contract
contract CharlizeAdminSet is Ownable{
    
    constructor(){
        
    }
    
    function registerAdmin(Charlize charlize) public payable returns(uint256){
        console.log("Inside registerAdmin - CharlizeAdminSet");
        return charlize.registerAdmin{value: msg.value}(msg.sender);

    }

}