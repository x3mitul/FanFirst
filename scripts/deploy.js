const hre = require("hardhat");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

async function main() {
    console.log("Starting deployment to:", hre.network.name);

    if (!process.env.DEPLOYER_PRIVATE_KEY) {
        console.error("ERROR: DEPLOYER_PRIVATE_KEY not found in .env.local");
        process.exit(1);
    }

    const eventName = "FanFirst Launch Event";
    const ticketPriceWei = hre.ethers.parseEther("0.01");
    const maxTickets = 1000;

    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];

    if (!deployer) {
        throw new Error("No signer available");
    }

    console.log("Deploying from account:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

    console.log("Constructor Arguments:");
    console.log("  eventName:", eventName, typeof eventName);
    console.log("  ticketPriceWei:", ticketPriceWei.toString(), typeof ticketPriceWei);
    console.log("  maxTickets:", maxTickets, typeof maxTickets);

    console.log("Deploying FanFirstTicket...");
    const FanFirstTicket = await hre.ethers.getContractFactory("FanFirstTicket");
    const ticket = await FanFirstTicket.deploy(
        eventName,
        ticketPriceWei,
        maxTickets,
        {
            gasLimit: 3000000,
        }
    );

    console.log("Transaction sent! Hash:", ticket.deploymentTransaction().hash);
    console.log("Waiting for confirmation...");

    await ticket.waitForDeployment();
    const contractAddress = await ticket.getAddress();

    console.log("Contract deployed successfully!");
    console.log("Address:", contractAddress);

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        contractAddress: contractAddress,
        eventName: eventName,
        ticketPricePOL: "0.01",
        maxTickets: maxTickets,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
    };

    const deploymentPath = `./deployments/${hre.network.name}-deployment.json`;
    fs.mkdirSync('./deployments', { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to:", deploymentPath);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:");
        console.error(error);
        process.exit(1);
    });
