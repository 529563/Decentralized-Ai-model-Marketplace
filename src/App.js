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
      <h1 style={{ marginBottom: '1rem' }}>AI Dataset Marketplace</h1>
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
