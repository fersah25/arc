// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ArcQuest {
    string public lastMessage;
    address public lastMessenger;
    uint256 public totalGMs;

    event NewGM(address indexed user, string message);

    function sayGM(string memory _message) public {
        lastMessage = _message;
        lastMessenger = msg.sender;
        totalGMs++;
        emit NewGM(msg.sender, _message);
    }

    function getLatestInfo() public view returns (address, string memory) {
        return (lastMessenger, lastMessage);
    }
}
