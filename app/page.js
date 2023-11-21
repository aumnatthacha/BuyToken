/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { ethers, parseUnits } from "ethers";
import { formatEther } from "@ethersproject/units";
import abi from "./abi.json";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';

// Initialize Web3 React
const [metaMask, hooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
);

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
} = hooks;

const contractChain = 11155111;
const contractAddress = "0x79a56a164be8Da57691a460a5514D3D58bF67b6b";

const Page = () => {
  // Web3 React Hooks
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActive = useIsActive();
  const provider = useProvider();
  const [error, setError] = useState(undefined);

  // Connect to MetaMask eagerly
  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
  }, []);

  // Connect and Disconnect Handlers
  const handleConnect = () => {
    metaMask.activate(contractChain);
  };

  const handleDisconnect = () => {
    metaMask.resetState();
  };

  // Fetch Balance Effect
  const [balance, setBalance] = useState("");
  useEffect(() => {
    const fetchBalance = async () => {
      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi, signer);
      const myBalance = await smartContract.balanceOf(accounts[0]);
      console.log(formatEther(myBalance));
      setBalance(formatEther(myBalance));
    };
    if (isActive) {
      fetchBalance();
    }
  }, [isActive]);

  // Buy Token Handlers
  const [tokenValue, setTokenValue] = useState(0);
  const handleSetTokenValue = (event) => {
    setTokenValue(event.target.value);
  };

  const handleBuyToken = async () => {
    try {
      if (tokenValue <= 0) {
        return;
      }

      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi, signer);
      const buyValue = parseUnits(tokenValue.toString(), "ether");
      const tx = await smartContract.buy({
        value: buyValue.toString(),
      });

      smartContract.on("Transfer", (from, to, tokens) => {
        const tokenFloat = parseFloat(formatEther(tokens));
        const balanceFloat = parseFloat(balance);
        const total = tokenFloat + balanceFloat;
        setBalance(total.toString());
        setBuyToken("");
      });

      console.log("Transaction hash:", tx.hash);
    } catch (err) {
      console.log(err);
    }
  };

  // UI Rendering
  return (
    <div>
      <div className="container_center">
        <div className="card">
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label={accounts ? accounts[0] : ""} />
            <Button color="inherit" onClick={handleDisconnect}>
              Disconnect
            </Button>
            <Button color="inherit" onClick={handleConnect}>
              Connect
            </Button>
          </Stack>

          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '100%' },
            }}
            noValidate
            autoComplete="off"
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              Buy Token การซื้อเหรียญ
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              Balance: {balance}
            </Typography>


            <TextField
              label="Enter amount of Ether you want to buy"
              defaultValue=""
              type="number"
              onChange={handleSetTokenValue}
            />

            <Button
              sx={{
                backgroundColor: '#D6AD14',
                color: '#000',
                '&:hover': {
                  backgroundColor: '#E3C576',
                },
              }}
              variant="contained"
              onClick={handleBuyToken}
              fullWidth
            >
              Buy Token
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Page;
