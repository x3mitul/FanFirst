const hre = require("hardhat");

async function main() {
    console.log("Hardhat version:", hre.version);
    console.log("Ethers defined:", !!hre.ethers);
    if (hre.ethers) {
        try {
            const [deployer] = await hre.ethers.getSigners();
            console.log("Deployer:", deployer.address);
            const balance = await hre.ethers.provider.getBalance(deployer.address);
            console.log("Balance:", hre.ethers.formatEther(balance), "MATIC");

            const feeData = await hre.ethers.provider.getFeeData();
            console.log("Gas Price:", hre.ethers.formatUnits(feeData.gasPrice || 0n, "gwei"), "gwei");
            console.log("Max Priority Fee:", hre.ethers.formatUnits(feeData.maxPriorityFeePerGas || 0n, "gwei"), "gwei");
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}

main().catch(console.error);
