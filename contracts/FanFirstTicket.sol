// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FanFirstTicket
 * @dev NFT-based event ticket with bot verification
 * This contract should be deployed separately for each event
 */
contract FanFirstTicket is ERC721, Ownable {
    // Ticket price in wei (MATIC on Polygon)
    uint256 public ticketPrice;
    
    // Next token ID to mint
    uint256 public nextTokenId;
    
    // Maximum number of tickets
    uint256 public maxTickets;
    
    // Bot verification mapping (managed off-chain)
    mapping(address => bool) public humanVerified;
    
    // Event metadata
    string public eventName;
    string public eventDate;
    string public eventVenue;
    
    // Events
    event TicketPurchased(address indexed buyer, uint256 indexed tokenId, uint256 price);
    event TicketPriceUpdated(uint256 newPrice);
    event HumanVerified(address indexed buyer);
    
    /**
     * @dev Constructor
     * @param _eventName Name of the event
     * @param _ticketPrice Initial ticket price in wei
     * @param _maxTickets Maximum number of tickets available
     */
    constructor(
        string memory _eventName,
        uint256 _ticketPrice,
        uint256 _maxTickets
    ) ERC721("FanFirst Ticket", "FANTICKET") Ownable(msg.sender) {
        eventName = _eventName;
        ticketPrice = _ticketPrice;
        maxTickets = _maxTickets;
        nextTokenId = 1;
    }
    
    /**
     * @dev Purchase tickets and mint NFTs
     * @param buyer Address to mint tickets to
     * @param quantity Number of tickets to purchase
     */
    function mintTickets(address buyer, uint256 quantity) public payable {
        require(msg.value >= ticketPrice * quantity, "Incorrect payment amount");
        require(nextTokenId + quantity <= maxTickets + 1, "Not enough tickets available");
        require(quantity > 0 && quantity <= 4, "Can only buy 1-4 tickets at once");
        
        // Mint tickets
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = nextTokenId;
            _safeMint(buyer, tokenId);
            emit TicketPurchased(buyer, tokenId, ticketPrice);
            nextTokenId++;
        }
        
        // Refund excess payment
        if (msg.value > ticketPrice * quantity) {
            payable(msg.sender).transfer(msg.value - (ticketPrice * quantity));
        }
    }
    
    /**
     * @dev Single ticket purchase (backward compatible)
     */
    function confirmPurchase() public payable {
        mintTickets(msg.sender, 1);
    }
    
    /**
     * @dev Update ticket price (only owner)
     * @param _newPrice New ticket price in wei
     */
    function setTicketPrice(uint256 _newPrice) public onlyOwner {
        ticketPrice = _newPrice;
        emit TicketPriceUpdated(_newPrice);
    }
    
    /**
     * @dev Verify buyer as human (called by backend after bot check)
     * @param buyer Address to verify
     */
    function verifyHuman(address buyer) public onlyOwner {
        humanVerified[buyer] = true;
        emit HumanVerified(buyer);
    }
    
    /**
     * @dev Batch verify multiple addresses
     * @param buyers Array of addresses to verify
     */
    function batchVerifyHuman(address[] memory buyers) public onlyOwner {
        for (uint256 i = 0; i < buyers.length; i++) {
            humanVerified[buyers[i]] = true;
            emit HumanVerified(buyers[i]);
        }
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get remaining tickets
     */
    function remainingTickets() public view returns (uint256) {
        if (nextTokenId > maxTickets) {
            return 0;
        }
        return maxTickets - nextTokenId + 1;
    }
    
    /**
     * @dev Check if address owns a ticket for this event
     */
    function hasTicket(address owner) public view returns (bool) {
        return balanceOf(owner) > 0;
    }
}
