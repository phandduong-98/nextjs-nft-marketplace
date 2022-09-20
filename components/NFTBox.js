import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import Image from "next/image";
import { Loading, Icon, Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";
const truncateStr = (fullString, strLen) => {
    if (fullString.lenght <= strLen) return fullString;
    const seperator = "...";
    const seperatorLength = seperator.length;
    const charstoShow = strLen - seperatorLength;
    const fronChars = Math.ceil(charstoShow / 2);
    const backChars = Math.floor(charstoShow / 2);
    return (
        fullString.substring(0, fronChars) +
        seperator +
        fullString.substring(fullString.length - backChars)
    );
};

export default function NFTBox({
    price,
    nftAddress,
    tokenId,
    marketplaceAddress,
    seller,
}) {
    const dispatch = useNotification();
    const { isWeb3Enabled, account } = useMoralis();
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDescription, setTokenDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const hideModal = () => setShowModal(false);
    const isOwnedByUser = seller === account || seller === undefined;
    const formattedSellerAddress = isOwnedByUser
        ? "you"
        : truncateStr(seller || "", 15);

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    });

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    });

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    async function updateUI() {
        // get tokenURI
        //using the img tag from the tokenURI, get the image
        const tokenURI = await getTokenURI();
        console.log(`The TokenURI is ${tokenURI}`);
        if (tokenURI) {
            //IPFS: Gateway: A server that will return IPFS files from a "normal" URL.
            const requestURL = tokenURI.replace(
                "ipfs://",
                "https://cloudflare-ipfs.com/ipfs/"
            );
            const tokenURIResponse = await (await fetch(requestURL)).json();
            const imageURI = tokenURIResponse.image;
            let imageURIURL;
            if (imageURI.includes("ipfs://")) {
                imageURIURL = imageURI.replace(
                    "ipfs://",
                    "https://cloudflare-ipfs.com/ipfs/"
                );
            } else {
                imageURIURL = imageURI.replace(
                    "https://ipfs.io/ipfs/",
                    "https://cloudflare-ipfs.com/ipfs/"
                );
            }

            setImageURI(imageURIURL);
            setTokenName(tokenURIResponse.name);
            setTokenDescription(tokenURIResponse.description);
            // otherway: render on moralis, use moralis hook(only testnet and mainnet)
        }
    }
    const handleCardClick = () => {
        isOwnedByUser //show modal : buy item
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: handleBuyItemSuccess,
              });
    };

    const handleBuyItemSuccess = async (tx) => {
        await tx.wait();
        dispatch({
            type: "success",
            message: "Item Bought",
            title: "Listing updated - please refresh",
            position: "topR",
        });
    };

    return (
        <div>
            <div>
                {imageURI ? (
                    <div className="p-2">
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-start">
                                    <Image
                                        loader={() => imageURI}
                                        unoptimized={true}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold font-mono">
                                        {tokenName} #{tokenId}
                                    </div>
                                    {/* <div className="italic text-sm">
                                        Owned by {formattedSellerAddress}
                                    </div> */}
                                    <div className="font-bold text-black text-sm">
                                        Price
                                    </div>
                                    <div className="flex font-bold">
                                        <Icon
                                            fill="#3f3f3f"
                                            size={20}
                                            svg="eth"
                                        />
                                        {ethers.utils.formatUnits(
                                            price,
                                            "ether"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
}
