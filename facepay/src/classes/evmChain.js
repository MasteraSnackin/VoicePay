// SPDX-License-Identifier: MIT
/**
 * Minimal EVMChain adapter used by the FacePay app.
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
     * Fetches token IDs and metadata in parallel for O(D) latency instead of O(n×D).
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
            if (balance === 0) return [];

            // Phase 1: Fetch all token IDs in parallel
            const tokenIdPromises = Array.from({ length: balance }, (_, i) =>
                contract.tokenOfOwnerByIndex(owner, i).then((bn) => bn.toString())
            );
            const tokenIds = await Promise.all(tokenIdPromises);

            // Phase 2: Fetch all token URIs in parallel
            const uriPromises = tokenIds.map((tokenId) =>
                contract.tokenURI(tokenId).then((uri) =>
                    uri.startsWith("ipfs://")
                        ? uri.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/")
                        : uri
                )
            );
            const uris = await Promise.all(uriPromises);

            // Phase 3: Fetch all metadata in parallel
            const metaPromises = uris.map(async (uri, idx) => {
                try {
                    const resp = await fetch(uri);
                    if (!resp.ok) return null;
                    const meta = await resp.json();
                    let image = meta.image ?? "";
                    if (typeof image === "string" && image.startsWith("ipfs://")) {
                        image = image.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
                    }
                    return {
                        tokenId: tokenIds[idx],
                        contract: contractAddress,
                        image,
                        name: meta.name ?? "",
                        description: meta.description ?? "",
                        attributes: meta.attributes ?? [],
                    };
                } catch {
                    return null;
                }
            });
            const results = await Promise.all(metaPromises);
            return results.filter(Boolean);
        } catch (e) {
            console.warn("EVMChain.getNFTs error", e);
            return [];
        }
    }
}
