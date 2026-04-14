// SPDX-License-Identifier: MIT
/**
 * Minimal EVMChain adapter used by the EffiSend‑Hedera app.
 * Provides a `getNFTs(address, contract)` method compatible with the UI.
 * Utilises ethers.js when possible; otherwise returns an empty array to
 * avoid runtime crashes during local development.
 */

import { ethers } from "ethers";

export class EVMChain {
    /**
     * @param {object} chainConfig Configuration from `core/chains`.
     * Expected keys: rpcUrls (string or array), optionally others.
     */
    constructor(chainConfig) {
        this.chainConfig = chainConfig ?? {};
        const rpc = Array.isArray(this.chainConfig.rpcUrls)
            ? this.chainConfig.rpcUrls[0]
            : this.chainConfig.rpcUrls;
        this.provider = rpc ? new ethers.JsonRpcProvider(rpc) : ethers.getDefaultProvider();
    }

    /**
     * Retrieve NFTs owned by `owner` from an ERC‑721 contract.
     * Returns an array of objects with at least `{ tokenId, contract, image, name, description, attributes }`.
     * Errors are caught and result in an empty array so the UI remains stable.
     */
    async getNFTs(owner, contractAddress) {
        if (!owner || !contractAddress) return [];
        try {
            const abi = [
                "function balanceOf(address) view returns (uint256)",
                "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
                "function tokenURI(uint256) view returns (string)",
            ];
            const contract = new ethers.Contract(contractAddress, abi, this.provider);
            const balBN = await contract.balanceOf(owner);
            const balance = Number(balBN);
            const nfts = [];
            for (let i = 0; i < balance; i++) {
                const tokenIdBN = await contract.tokenOfOwnerByIndex(owner, i);
                const tokenId = tokenIdBN.toString();
                let uri = await contract.tokenURI(tokenId);
                if (uri.startsWith("ipfs://")) {
                    uri = uri.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
                }
                const resp = await fetch(uri);
                if (!resp.ok) continue;
                const meta = await resp.json();
                let image = meta.image ?? "";
                if (typeof image === "string" && image.startsWith("ipfs://")) {
                    image = image.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
                }
                nfts.push({
                    tokenId,
                    contract: contractAddress,
                    image,
                    name: meta.name ?? "",
                    description: meta.description ?? "",
                    attributes: meta.attributes ?? [],
                });
            }
            return nfts;
        } catch (e) {
            console.warn("EVMChain.getNFTs error", e);
            return [];
        }
    }
}
