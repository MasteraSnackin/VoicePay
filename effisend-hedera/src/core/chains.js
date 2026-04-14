// Chain configuration and icon helper for EffiSend Hedera
import { Image } from "react-native";

// Asset imports – add more icons here as needed
import HBAR from "../assets/logos/hbar.png";
import ETH from "../assets/logos/eth.png"; // fallback Ethereum icon (exists in assets)

/**
 * Exported blockchain configurations.
 * The app expects at least a Hedera entry (type "hedera") and an EVM entry for the
 * target chain id used in `tab5.js` (chainId 143).
 */
export const blockchains = [
    {
        chainId: 143,
        type: "hedera",
        rpcUrls: ["https://testnet.hashio.io/api"],
        iconKey: "hedera",
        explorerUrl: "https://hashscan.io/testnet",
    },
    // Example EVM configuration – useful for future extensions
    {
        chainId: 1,
        type: "evm",
        rpcUrls: ["https://mainnet.infura.io/v3/YOUR_PROJECT_ID"],
        iconKey: "ethereum",
        explorerUrl: "https://etherscan.io",
    },
];

/** Mapping of icon keys to image sources */
const ICON_MAP = {
    hedera: HBAR,
    ethereum: ETH,
};

/**
 * Returns a React element rendering the requested icon.
 * @param {string} key   Identifier matching a key in ICON_MAP.
 * @param {number} [size=24] Desired width/height in pixels.
 * @returns {JSX.Element}
 */
export function getIcon(key, size = 24) {
    const source = ICON_MAP[key] ?? HBAR; // Fallback to Hedera icon
    return <Image source={source} style={{ width: size, height: size }} />;
}
