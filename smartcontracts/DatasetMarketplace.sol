//SPDX-License-Identifier: MIT Licensed
pragma solidity ^0.8.20;

///////////////////
// imports
///////////////////

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DatasetMarketplace is Ownable, ReentrancyGuard {
    ///////////////////
    // State Variables
    ///////////////////

    struct Dataset {
        uint256 id;
        string ipfsHash;
        address payable owner;
        uint256 price;
        bool isForSale;
    }

    // Mapping of dataset ID to Dataset struct
    mapping(uint256 => Dataset) public datasets;
    uint256 public datasetCount;

    //////////////
    // events
    /////////////

    event DatasetUploaded(uint256 indexed id, string ipfsHash, uint256 price);
    event DatasetPurchased(
        uint256 indexed id,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event PriceUpdated(uint256 indexed id, uint256 newPrice);
    event DatasetListed(uint256 indexed id, uint256 price);

    ///////////////////
    // modifier
    ///////////////////

    modifier onlyDatasetOwner(uint256 _id) {
        require(
            datasets[_id].owner == msg.sender,
            "Caller is not the dataset owner"
        );
        _;
    }

    ///////////////////
    // constructor
    ///////////////////

    constructor() Ownable(msg.sender) {}

    ///////////////////
    // extenal functions
    ///////////////////

    // Upload a new dataset to the marketplace
    // _ipfsHash: IPFS hash of the dataset
    // _price: Price of the dataset in ETH

    function uploadDataset(string memory _ipfsHash, uint256 _price) external {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        datasetCount++;
        datasets[datasetCount] = Dataset(
            datasetCount,
            _ipfsHash,
            payable(msg.sender),
            _price,
            true
        );

        emit DatasetUploaded(datasetCount, _ipfsHash, _price);
    }

    // Purchase a dataset from the marketplace
    // _id: The ID of the dataset to purchase
    function buyDataset(uint256 _id) external payable nonReentrant {
        Dataset storage dataset = datasets[_id];

        require(dataset.isForSale, "Dataset is not for sale");
        require(msg.value >= dataset.price, "Insufficient payment");
        require(
            dataset.owner != msg.sender,
            "Owner cannot buy their own dataset"
        );

        // Transfer ownership and mark as sold
        dataset.owner.transfer(msg.value);
        dataset.owner = payable(msg.sender);
        dataset.isForSale = false;

        emit DatasetPurchased(_id, msg.sender, dataset.owner, dataset.price);
    }

    // Update the price of an existing dataset (only by owner)
    // _id: The ID of the dataset
    // _newPrice: The new price to set
    function updatePrice(
        uint256 _id,
        uint256 _newPrice
    ) external onlyDatasetOwner(_id) {
        require(_newPrice > 0, "Price must be greater than zero");

        datasets[_id].price = _newPrice;
        emit PriceUpdated(_id, _newPrice);
    }

    // List a dataset for sale (only by owner)
    // _id: The ID of the dataset
    // _price: The price to list the dataset for sale
    function listDatasetForSale(
        uint256 _id,
        uint256 _price
    ) external onlyDatasetOwner(_id) {
        require(_price > 0, "Price must be greater than zero");

        datasets[_id].isForSale = true;
        datasets[_id].price = _price;

        emit DatasetListed(_id, _price);
    }

    ///////////////////
    // view functions
    ///////////////////

    // Get the details of a dataset by its ID
    // _id: The ID of the dataset
    function getDataset(uint256 _id) external view returns (Dataset memory) {
        return datasets[_id];
    }
}
