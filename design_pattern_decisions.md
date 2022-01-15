# Design pattern decisions

Charlize comprises five different types of functions:

1. Access control functions
2. User registration functions
3. Admin registration functions
4. Producer functions
5. Client functions
6. Oracle functions

Charlize applies inheritance through importing `Ownable` and `AccessControl` Openzeppelin contracts, providing Access Control patterns. These patterns help the owner control the contract, and producers, clients, and administrators have a reliable profile creation, access control to Charlize, and segmentation of functions according to the corresponding profile.

Charlize also applies interfaces when importing and implementing Chainlink's `KeeperCompatibleInterface` for the oracle that wakes up Charlize every 5 minutes, emitting an event listened at the frontend, in charge of determining which reagents expired at the end of that period.
