const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

console.log("🔍 Testing Environment Variables\n");
console.log("================================================");

console.log("DEPLOYER_PRIVATE_KEY:", process.env.DEPLOYER_PRIVATE_KEY ? "✅ Found" : "❌ Not found");
if (process.env.DEPLOYER_PRIVATE_KEY) {
    console.log("  Length:", process.env.DEPLOYER_PRIVATE_KEY.length, "characters");
    console.log("  Preview:", process.env.DEPLOYER_PRIVATE_KEY.substring(0, 10) + "...");
}

console.log("\nPOLYGONSCAN_API_KEY:", process.env.POLYGONSCAN_API_KEY ? "✅ Found" : "❌ Not found");
if (process.env.POLYGONSCAN_API_KEY) {
    console.log("  Length:", process.env.POLYGONSCAN_API_KEY.length, "characters");
}

console.log("\nNEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:", process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? "✅ Found" : "❌ Not found");

console.log("\n================================================");
console.log("\nIf DEPLOYER_PRIVATE_KEY is not found:");
console.log("1. Check .env.local exists in project root");
console.log("2. Format should be: DEPLOYER_PRIVATE_KEY=yourkey (no spaces, no quotes)");
console.log("3. Make sure there are no extra spaces or special characters");
