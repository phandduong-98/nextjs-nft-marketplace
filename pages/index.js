import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";
import { useEffect } from "react";
import { Loading } from "web3uikit";

export default function Home() {
    const { isWeb3Enabled, account } = useMoralis();
    const { data: listedNfts, isFetching: fetchingListedNfts } =
        useMoralisQuery(
            // TableName,
            // Function for the query
            "ActiveItem",
            (query) => query.limit(10).descending("tokenId")
        );

    console.log("listedNfts", listedNfts);
    return (
        <div className="container mx-auto ">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently listed</h1>
            <div className="flex flex-wrap gap-8">
                {isWeb3Enabled ? (
                    fetchingListedNfts ? (
                        <div
                            style={{
                                backgroundColor: "#ECECFE",
                                borderRadius: "8px",
                                padding: "20px",
                            }}
                        >
                            <Loading
                                size={12}
                                spinnerColor="#2E7DAF"
                                spinnerType="wave"
                            />
                        </div>
                    ) : (
                        listedNfts.map((nft) => {
                            const {
                                price,
                                nftAddress,
                                tokenId,
                                marketplaceAddress,
                                seller,
                            } = nft.attributes;
                            console.log(nft.attributes);
                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    key={`${nftAddress}${tokenId}`}
                                />
                            );
                        })
                    )
                ) : (
                    <div>Web3 is not available</div>
                )}
            </div>
        </div>
    );
}
