//SPDX-License-Identifier: MIT Licensed
pragma solidity ^0.8.20;

// Import
import {FunctionsClient} from "lib/chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "lib/chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "lib/chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

// Define the AIAgentWithChainlink contract inheriting from FunctionsClient and ConfirmedOwner
contract AIAgentWithChainlink is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request; // Using the FunctionsRequest library for request management

    // Struct representing an AI agent
    struct Agent {
        uint id; // Unique identifier for the agent
        address owner; // Address of the agent owner
        string taskType; // Type of AI task to be performed
        string datasetIpfsHash; // IPFS hash of the dataset for the task
        bool isCompleted; // Status indicating if the task is completed
        string result; // Result of the task
    }

    // State variables

    uint public agentCount = 0; // Counter for the number of agents
    mapping(uint => Agent) public agents; // Mapping to store agents by their ID
    mapping(bytes32 => uint) public requestIdToAgentId; // Mapping to associate request IDs with agent IDs

    // Events to log actions
    event AgentDeployed(uint id, address owner, string taskType);
    event AgentCompleted(uint id, string result);
    event AgentRequestFailed(uint id, string error);
    event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

    bytes32 public donId; // Decentralized Oracle Network (DON) ID for Chainlink Functions

    // Constructor to initialize the contract with a router and DON ID
    constructor(
        address router,
        bytes32 _donId
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        donId = _donId; // Set the DON ID
    }

    /**
     * @notice Deploy the AI agent with a specific task and dataset
     * @param _taskType Type of AI task to be performed
     * @param _datasetIpfsHash IPFS hash where the dataset is stored
     * @param _subscriptionId Subscription ID for Chainlink Functions billing
     * @param _callbackGasLimit Gas limit for callback
     */
    function deployAgent(
        string memory _taskType,
        string memory _datasetIpfsHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit
    ) public {
        agentCount++; // Increment the agent count
        // Create a new agent and store it in the mapping
        agents[agentCount] = Agent(
            agentCount,
            msg.sender,
            _taskType,
            _datasetIpfsHash,
            false,
            ""
        );

        emit AgentDeployed(agentCount, msg.sender, _taskType); // Emit event for agent deployment

        // JavaScript code to process the AI task off-chain (placeholder)
        string memory jsCode = string(
            abi.encodePacked(
                "const ipfsHash = '",
                _datasetIpfsHash,
                "';",
                "let result = processDataset(ipfsHash);", // Placeholder for actual AI model logic
                "return Functions.encodeString(result);" // Encode the result as a string
            )
        );

        // Prepare Chainlink request
        FunctionsRequest.Request memory req;
        req.initializeRequest(
            FunctionsRequest.Location.Inline, // Request code is inline
            FunctionsRequest.CodeLanguage.JavaScript, // Code is in JavaScript
            jsCode // JavaScript code to execute
        );

        // Send the request to Chainlink Functions
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            _subscriptionId,
            _callbackGasLimit,
            donId
        );

        // Map the requestId to the agentId for tracking
        requestIdToAgentId[requestId] = agentCount;
    }

    /**
     * @notice Fulfillment function called by Chainlink Functions upon task completion
     * @param requestId The request ID generated by Chainlink Functions
     * @param response The processed result from the AI model
     * @param err Any error that occurred during the off-chain computation
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        uint agentId = requestIdToAgentId[requestId]; // Get the agent ID from the request ID
        Agent storage agent = agents[agentId]; // Get the agent instance

        if (err.length == 0) {
            // AI task completed successfully
            agent.isCompleted = true; // Mark the task as completed
            agent.result = string(response); // Store the result
            emit AgentCompleted(agentId, agent.result); // Emit completion event
        } else {
            // AI task failed or encountered an error
            agent.isCompleted = true; // Mark the task as completed
            agent.result = "Error: Failed to process AI task"; // Store error message
            emit AgentRequestFailed(agentId, string(err)); // Emit failure event
        }

        // Emit Chainlink OCR response for tracking
        emit OCRResponse(requestId, response, err);
    }

    /**
     * @notice Withdraw LINK tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        // Transfer all LINK tokens from the contract to the owner's address
        require(
            LinkTokenInterface(chainlinkTokenAddress()).transfer(
                msg.sender,
                LinkTokenInterface(chainlinkTokenAddress()).balanceOf(
                    address(this)
                )
            ),
            "Withdraw failed"
        );
    }

    /**
     * @notice Set the DON ID for Chainlink Functions
     * @param newDonId New DON ID
     */
    function setDonId(bytes32 newDonId) external onlyOwner {
        donId = newDonId; // Update the DON ID
    }
}
