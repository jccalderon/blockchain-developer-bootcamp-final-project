// SPDX-License-Identifier: GPL-3.0

/// @title Charlize - expiration date management Dapp 
/// @author Juan Carlos Calderon Martinez
/// @notice Producers create reagent profiles and clients
///         register to receive an email alert when the bought 
///         reagent, already created by the producer, expired
/// @dev The contract uses an oracle 
/// @custom:experimental This is a Minimum Viable Product.

enum Role {Producer, Client}


pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract Charlize is KeeperCompatibleInterface{

    /// @notice registers users (producer or client)
    /// @dev stores user's data in a User struct containing: 
    ///     -string  companyName
    ///     -enum    role {Producer, Client}
    ///     -string  email
    ///     -uint256 companyId 
    ///     User's data is stored in a mapping (companyId => User)
    ///     User's message.sender address is related to a companyId  - mapping(address => companyID)

    /// @param  companyName, role, email 
    /// @return boolean true if successfully registered, false if registration failed.
    function registerUser(string _companyName, Role _role, string _email) public returns(bool){

    }

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
    function createReagent(uint256 _NDC, uint256 lotNumber, string expirationDate) public returns(bool){

    }


    /// @notice gets data about a particular Reagent
    /// @dev looks up data of a particular reagent
    /// @param NDC, lotNumber
    /// @return string cointaining Reagent.State() and expirationDate
    function getReagentData(uint256 _NDC, uint256 lotNumber ) public returns(string expirationDate){

    }
  
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

    /// @param checkData (not used in this case)
    /// @return upkeepNeeded (if true the keeper executes the performUpkeep function)
    function checkUpkeep(bytes calldata /* checkData */) external override returns (bool upkeepNeeded, bytes memory /* performData */) {
       
        
    }

    /// @param performData (not used in this case)
    function performUpkeep(bytes calldata /* performData */) external override {

        
    }   
    
}
















