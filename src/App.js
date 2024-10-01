import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractABI } from "./abi.js";

const contractAddress = "0x672C58cab737bE70B1f574eD3a960395f3Cadf85";

export default function DatasetMarketplace() {


  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [price, setPrice] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(null);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum, {
          name: 'Binance Smart Chain Testnet',
          chainId: 97,
          ensAddress: null // Disable ENS lookups
        });
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const uploadDataset = async () => {
    if (!contract) return;
    try {
      const tx = await contract.uploadDataset(ipfsHash, ethers.parseEther(price));
      await tx.wait();
      alert("Dataset uploaded successfully!");
    } catch (error) {
      console.error("Error uploading dataset:", error);
    }
  };

  const buyDataset = async () => {
    if (!contract) return;
    try {
      const dataset = await contract.getDataset(datasetId);
      const tx = await contract.buyDataset(datasetId, { value: dataset.price });
      await tx.wait();
      alert("Dataset purchased successfully!");
    } catch (error) {
      console.error("Error buying dataset:", error);
    }
  };

  const updatePrice = async () => {
    if (!contract) return;
    try {
      const tx = await contract.updatePrice(datasetId, ethers.parseEther(newPrice));
      await tx.wait();
      alert("Price updated successfully!");
    } catch (error) {
      console.error("Error updating price:", error);
    }
  };

  const listDatasetForSale = async () => {
    if (!contract) return;
    try {
      const tx = await contract.listDatasetForSale(datasetId, ethers.parseEther(price));
      await tx.wait();
      alert("Dataset listed for sale successfully!");
    } catch (error) {
      console.error("Error listing dataset for sale:", error);
    }
  };

  const getDataset = async () => {
    if (!contract) return;
    try {
      const dataset = await contract.getDataset(datasetId);
      alert(`Dataset Info:
        ID: ${dataset.id}
        IPFS Hash: ${dataset.ipfsHash}
        Owner: ${dataset.owner}
        Price: ${ethers.formatEther(dataset.price)} ETH
        For Sale: ${dataset.isForSale}`);
    } catch (error) {
      console.error("Error getting dataset:", error);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Dataset Marketplace</h1>
      <button onClick={connectWallet} style={{ marginBottom: '1rem' }}>
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>
      <div style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Upload Dataset</h2>
        <input
          type="text"
          placeholder="IPFS Hash"
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          style={{ marginBottom: '0.5rem', display: 'block' }}
        />
        <input
          type="text"
          placeholder="Price (ETH)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginBottom: '0.5rem', display: 'block' }}
        />
        <button onClick={uploadDataset}>Upload Dataset</button>
      </div>
      <div style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Buy Dataset</h2>
        <input
          type="text"
          placeholder="Dataset ID"
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
          style={{ marginBottom: '0.5rem', display: 'block' }}
        />
        <button onClick={buyDataset}>Buy Dataset</button>
      </div>
      <div style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Update Price</h2>
        <input
          type="text"
          placeholder="Dataset ID"
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
          style={{ marginBottom: '0.5rem', display: 'block' }}
        />
        <input
          type="text"
          placeholder="New Price (ETH)"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          style={{ marginBottom: '0.5rem', display: 'block' }}
        />
        <button onClick={updatePrice}>Update Price</button>
      </div>
      <div style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>List Dataset for Sale</h2>
        <input
          type="text"
          placeholder="Dataset ID"
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
          style={{ marginBottom: '0.5rem', display: 'block' }}
        />
        <input
          type="text"
          placeholder="Price (ETH)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginBottom: '0.5rem', display: 'block' }}
        />
        <button onClick={listDatasetForSale}>List for Sale</button>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Get Dataset</h2>
        <input
          type="text"
          placeholder="Dataset ID"
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
          style={{ marginBottom: '0.5rem', display: 'block' }}
        />
        <button onClick={getDataset}>Get Dataset</button>
      </div>
    </div>
  );
}

// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { ethers, parseEther, formatEther } from "ethers";
// import { DatasetMarketplaceABI } from "./DatasetMarketplaceABI.js";
// import { AIAgentDeploymentABI } from "./AIAgentDeploymentABI.js";

// const datasetMarketplaceAddress = "0xd9d59213b699d528BaCf93E5FBbc468689AB66aF";
// const aiAgentDeploymentAddress = "0xd9d59213b699d528BaCf93E5FBbc468689AB66aF";
// const pinataApiKey = "04caa91fd3f695c521e4";
// const pinataSecretApiKey = "a8cdd0c7064d425420c2c53a3cd377e37f55e4b3dc382635ee8427932f8e988e";

// function App() {
//   const [datasets, setDatasets] = useState([]);
//   const [taskType, setTaskType] = useState("");
//   const [ipfsHash, setIpfsHash] = useState("");
//   const [price, setPrice] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [account, setAccount] = useState("");
//   const [marketplaceContract, setMarketplaceContract] = useState(null);
//   const [agentContract, setAgentContract] = useState(null);

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         await provider.send("eth_requestAccounts", []);
//         const signer = await provider.getSigner();
//         const address = await signer.getAddress();

//         setAccount(address);

//         const marketplaceContract = new ethers.Contract(
//           datasetMarketplaceAddress,
//           DatasetMarketplaceABI,
//           signer
//         );
//         const agentContract = new ethers.Contract(
//           aiAgentDeploymentAddress,
//           AIAgentDeploymentABI,
//           signer
//         );

//         setMarketplaceContract(marketplaceContract);
//         setAgentContract(agentContract);

//         alert("Connected to MetaMask");
//       } catch (error) {
//         console.error("Connection error", error);
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   const uploadToIPFS = async (file) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
//     try {
//       const response = await axios.post(url, formData, {
//         maxBodyLength: "Infinity",
//         headers: {
//           'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
//           pinata_api_key: pinataApiKey,
//           pinata_secret_api_key: pinataSecretApiKey
//         }
//       });
//       return response.data.IpfsHash;
//     } catch (error) {
//       console.error("Error uploading file to IPFS:", error);
//       return null;
//     }
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     setImageFile(file);
//   };

//   const handleListDataset = async () => {
//     if (!imageFile) {
//       alert("Please select an image to upload");
//       return;
//     }

//     try {
//       const ipfsHash = await uploadToIPFS(imageFile);

//       if (ipfsHash) {
//         const tx = await marketplaceContract.uploadDataset(ipfsHash, parseEther(price));
//         await tx.wait();
//         alert(`Dataset listed with IPFS hash: ${ipfsHash} and price: ${price} ETH`);
//         fetchDatasets();
//       }
//     } catch (error) {
//       console.error("Error listing dataset", error);
//     }
//   };

//   const fetchDatasets = useCallback(async () => {
//     try {
//       const count = await marketplaceContract.datasetCount();
//       const allDatasets = [];
//       for (let i = 1; i <= count; i++) {
//         const dataset = await marketplaceContract.getDataset(i);
//         allDatasets.push(dataset);
//       }
//       setDatasets(allDatasets);
//     } catch (error) {
//       console.error("Error fetching datasets", error);
//     }
//   }, [marketplaceContract]);

//   const handleBuyDataset = async (datasetId, datasetPrice) => {
//     try {
//       const tx = await marketplaceContract.buyDataset(datasetId, {
//         value: datasetPrice, // Send the required amount of ETH
//       });
//       await tx.wait();
//       alert("Dataset purchased successfully!");
//       fetchDatasets(); // Refresh the list of datasets after purchase
//     } catch (error) {
//       console.error("Error buying dataset", error);
//     }
//   };

//   const handleDeployAgent = async () => {
//     if (!taskType || !ipfsHash) {
//       alert("Please provide the task type and dataset IPFS hash");
//       return;
//     }

//     try {
//       const tx = await agentContract.deployAgent(taskType, ipfsHash);
//       await tx.wait();
//       alert("AI Agent deployed successfully!");
//     } catch (error) {
//       console.error("Error deploying AI agent", error);
//     }
//   };

//   useEffect(() => {
//     if (marketplaceContract) {
//       fetchDatasets();
//     }
//   }, [marketplaceContract, fetchDatasets]);

//   return (
//     <div>
//       <h1>AI & Dataset Marketplace</h1>
//       <div>
//         {account ? (
//           <p>Connected Account: {account}</p>
//         ) : (
//           <button onClick={connectWallet}>Connect MetaMask</button>
//         )}
//       </div>
//       <div>
//         <h2>List Your Dataset for Sale</h2>
//         <input type="file" onChange={handleFileChange} />
//         <input
//           type="number"
//           placeholder="Price in ETH"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//         />
//         <button onClick={handleListDataset}>List Dataset</button>
//       </div>
//       <div>
//         <h2>Available Datasets</h2>
//         <ul>
//           {datasets.map((dataset) => (
//             <li key={dataset.id}>
//               <p>
//                 IPFS Hash: {dataset.ipfsHash}<br />
//                 Price: {formatEther(dataset.price)} ETH<br />
//                 Owner: {dataset.owner}<br />
//                 <button onClick={() => handleBuyDataset(dataset.id, dataset.price)}>Buy Dataset</button>
//               </p>
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div>
//         <h2>Deploy AI Agent</h2>
//         <input
//           type="text"
//           placeholder="Task Type"
//           value={taskType}
//           onChange={(e) => setTaskType(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Dataset IPFS Hash"
//           value={ipfsHash}
//           onChange={(e) => setIpfsHash(e.target.value)}
//         />
//         <button onClick={handleDeployAgent}>Deploy Agent</button>
//       </div>
//     </div>
//   );
// }

// export default App;
