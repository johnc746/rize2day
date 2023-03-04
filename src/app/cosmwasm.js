import { useState, useEffect, createContext, useContext } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';
import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { defaultRegistryTypes, SigningStargateClient } from '@cosmjs/stargate';
import { encodePubkey, makeSignDoc, Registry } from '@cosmjs/proto-signing';
import { encodeSecp256k1Pubkey } from '@cosmjs/amino/build/encoding';
import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { makeSignDoc as AminoMakeSignDoc } from '@cosmjs/amino';
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { config, chainConfig } from "./config.js";
import { isEmpty } from "app/methods";
import { QueryClient } from 'react-query'
import { coins } from '@cosmjs/stargate'
import { convertDenomToMicroDenom } from "utils/utils";

const SALE_TYPE = {
  Fixed: 0,
  Auction: 1
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true
    }
  }
})

const chainInfoQueryKey = '@chain-info'

const unsafelyReadChainInfoCache = () =>
  queryClient.getQueryCache().find(chainInfoQueryKey)?.state?.data


const getDefaultExecuteFee = (
  feeCurrency
) => ({
  amount: coins(500000, feeCurrency[0].coinDenom),
  gas: '500000',
})

const unsafelyGetDefaultExecuteFee = () => {
  /* hack: read chain info from query cache */
  const chainInfo = unsafelyReadChainInfoCache()

  /* throw an error if the function was called before the cache is available */
  if (!chainInfo) {
    throw new Error(
      'No chain info was presented in the cache. Seem to be an architectural issue. Contact developers.'
    )
  }

  return getDefaultExecuteFee(chainInfo.feeCurrencies)
}


async function getKeplr() {
  if (window.keplr) {
    return window.keplr;
  }

  if (document.readyState === "complete") {
    return window.keplr;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event) => {
      if (
        event.target &&
        (event.target).readyState === "complete"
      ) {
        resolve(window.keplr);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
}

const defaultFee = {
  amount: [],
  gas: "1000000",
}

const CosmwasmContext = createContext({});
export const useSigningClient = () => useContext(CosmwasmContext);

export const SigningCosmWasmProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [signingClient, setSigningClient] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [balances, setBalances] = useState({});

  const MARKETPLACE = config.MARKETPLACE;
  const CW20_CONTRACT = config.CW20_CONTRACT;

  const loadClient = async (rpc = '') => {
    try {
      const temp = await CosmWasmClient.connect(config.RPC_URL);
      setClient(temp);
    } catch (error) {
      console.log(">>>>>>>>> CLIENT>>>>>", error);
    }
  }

  console.log(">>>>> Client >>>>", client)
  console.log(">>>>> SigningClient >>>>", signingClient);

  const connectWallet = async (new_config = null) => {
    const keplr = await getKeplr();
    let walletConfig = chainConfig;
    if (!isEmpty(new_config)) {
      walletConfig = new_config;
    }

    if (!window.getOfflineSigner || !window.keplr || !keplr) {
      alert("Please install keplr to continue.");
      window.open("https://www.keplr.app/", '_blank');
      return;
    } else {
      if (window.keplr.experimentalSuggestChain) {
        try {
          await window.keplr.experimentalSuggestChain(walletConfig);
        } catch (error) {
          console.log(error)
          toast.error('Failed to suggest the chain');
          return;
        }
      } else {
        toast.warn('Please use the recent version of keplr extension');
        return;
      }
    }

    try {
      await keplr.enable(walletConfig.chainId)
    } catch (err) {
      console.log(err);
      return;
    }

    try {
      const offlineSigner = await window.keplr.getOfflineSigner(
        walletConfig.chainId
      )
      const tempClient = await SigningCosmWasmClient.connectWithSigner(
        walletConfig.rpc,
        offlineSigner
      );
      console.log(">>>>>>>>>>> TempClient", tempClient)
      setSigningClient(tempClient);

      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;
      setWalletAddress(address);
      localStorage.setItem("address", address);
    }
    catch (err) {
      console.log(err)
      return
    }
  }

  const disconnect = () => {
    if (signingClient) {
      localStorage.removeItem("address");
      signingClient.disconnect();
    }
    setWalletAddress('');
    setSigningClient(null);
  }

  const fetchBalance = async (address, rest_url) => {
    try {
      const resp = await axios({
        method: "get",
        url: `${rest_url}/bank/balances/${address}`,
        headers: {
          Accept: 'application/json, text/plain, */*',
        }
      })

      return resp.data.result;
    } catch (error) {
      console.log('Blance error: ', error);
    }
    return 0;
  }

  const getConfig = async () => {
    if (!client) return;
    try {
      const result = await client.queryContractSmart(MARKETPLACE, {
        config: {}
      })
      return result;
    } catch (err) {
      console.log(err)
    }
  }

  const getOwnedCollections = async (address) => {
    if (!client) return;
    try {
      const result = await client.queryContractSmart(MARKETPLACE, {
        owned_collections: { "owner": address }
      })
      return result;
    } catch (err) {
      console.log(err)
    }
  }

  const listCollections = async () => {
    if (!client) return;
    try {
      const result = await client.queryContractSmart(MARKETPLACE, {
        list_collections: {}
      })
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  const collectionConfig = async (address) => {
    if (!client) return;
    try {
      const result = await client.queryContractSmart(address, {
        get_config: {}
      })
      return result;
    } catch (err) {
      console.log(err)
    }
  }


  const collection = async (id) => {
    if (!client) return;
    try {
      const result = await client.queryContractSmart(MARKETPLACE, {
        collection: { "id": parseInt(id) },
      })
      return result;
    } catch (err) {
      console.log(err)
    }
  }

  const numOffers = async () => {
    if (!client) return;
    try {
      const result = await client.queryContractSmart(MARKETPLACE, {
        get_count: {}
      })
      return result.count;
    } catch (err) {
      console.log(err);
    }
  }

  const addCollection = async (
    owner,
    maxTokens,
    name,
    symbol,
    tokenCodeId,
    maximumRoyaltyFee,
    royalties,
    uri
  ) => {
    try {
      console.log(">>> AddCollection1");
      if (!signingClient) return -1;
      console.log(">>> AddCollection2");
      const result = await signingClient.execute(
        owner,
        MARKETPLACE,
        {
          add_collection:
          {
            owner: owner,
            max_tokens: maxTokens,
            name: name,
            symbol: symbol,
            token_code_id: tokenCodeId,
            maximum_royalty_fee: maximumRoyaltyFee,
            royalties: royalties,
            uri: uri
          }
        },
        defaultFee,
        undefined,
        []
      )
      console.log(">>>> Result >>>>")
      return result.transactionHash
    }
    catch (error) {
      throw error;
    }
  }

  const batchMint = async (sender, uris, prices) => {
    const result = await signingClient.execute(
      sender,
      config.CW721_CONTRACT,
      { batch_mint: { uri: uris, price: prices } },
      defaultFee
    )
    return result.transactionHash
  }

  const mintNFT = async (
    sender,
    collectionContract,
    name,
    uri
  ) => {
    if (!signingClient) return -1;
    const result = await signingClient.execute(
      sender,
      collectionContract,
      {
        mint:
        {
          uri: uri,
          name: name
        }
      },
      defaultFee
    )
    return result.transactionHash
  }

  const burnNFT = async (
    sender,
    cw721Address,
    token_id
  ) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          burn:
          {
            token_id
          }
        },
        defaultFee
      )
      return result.transactionHash
    } catch (error) {
      throw error;
    }
  }

  const listNFT = async (
    sender,
    cw721Address,
    sale_type,
    duration_type,
    initial_price,
    reserve_price,
    denom,
    tokenId,
    targetContract
  ) => {
    try {
      if (!signingClient) return -1;
      initial_price = convertDenomToMicroDenom(initial_price);
      reserve_price = initial_price;
      const msg = { start_sale: { sale_type, duration_type, initial_price, reserve_price, denom: { "cw20": config.CW20_CONTRACT } } };
      console.log(">>>>>>>>> ", sender, cw721Address, tokenId, targetContract, msg)
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          send_nft: {
            contract: targetContract,
            token_id: tokenId.toString(),
            msg: btoa(JSON.stringify(msg)),
          },
        },
        defaultFee,
        undefined
      )
      return result.transactionHash
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  const sendToken = async (
    sender,
    amount,
    token_id,
    collectionAddr
  ) => {
    try {
      if (!signingClient) return -1;
      const msg = { propose: { token_id } };
      console.log("sendToken () ===> ",
        sender,
        CW20_CONTRACT,
        collectionAddr,
        convertDenomToMicroDenom(amount),
        msg
      )
      const result = await signingClient.execute(
        sender,
        CW20_CONTRACT,
        {
          send: {
            contract: collectionAddr,
            amount: convertDenomToMicroDenom(amount),
            msg: btoa(JSON.stringify(msg)),
          },
        },
        defaultFee,
        undefined
      )
      return result.transactionHash
    } catch (error) {
      console.log(">>>>", error)
      throw error;
    }
  }

  const buyNowNFT = async (
    sender,
    collectionContract,
    token_id,
    denom
  ) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          propose: {
            token_id,
            denom
          },
        },
        defaultFee,
        undefined
      )
      return result.transactionHash
    } catch (error) {
      throw error;
    }
  }

  const updateNFT = async (
    sender,
    collectionContract,
    token_id,
    sale_type,
    duration_type,
    initial_price,
    reserve_price,
    denom
  ) => {
    if (!signingClient) return -1;
    try {
      initial_price = convertDenomToMicroDenom(initial_price);
      reserve_price = initial_price;
      console.log("updateNFT () ===> ",
        sender,
        collectionContract,
        token_id,
        sale_type,
        duration_type,
        initial_price,
        reserve_price,
        denom
      )
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          edit_sale: {
            token_id,
            sale_type,
            duration_type,
            initial_price,
            reserve_price,
            denom
          },
        },
        defaultFee,
        undefined
      )
      return result.transactionHash
    } catch (error) {
      throw error;
    }
  }
  const acceptSaleNFT = async (
    sender,
    collectionContract,
    token_id
  ) => {
    if (!signingClient) return -1;
    console.log("?>>>>>>>>> ", sender, collectionContract, token_id)
    try {
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          accept_sale: {
            token_id
          },
        },
        defaultFee,
        undefined
      )
      return result.transactionHash
    } catch (error) {
      throw error;
    }
  }

  const cancelSaleNFT = async (
    sender,
    collectionContract,
    token_id
  ) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          cancel_sale: {
            token_id
          },
        },
        defaultFee,
        undefined
      )
      return result.transactionHash
    } catch (error) {
      throw error;
    }
  }

  const transferNFT = async (
    sender,
    cw721Address,
    recipient,
    token_id
  ) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          transfer_nft: {
            recipient,
            token_id
          },
        },
        defaultFee,
        undefined
      )
      return result.transactionHash
    } catch (error) {
      throw error;
    }
  }

  return (
    <CosmwasmContext.Provider
      value={{
        walletAddress,
        client,
        signingClient,
        loadClient,
        connectWallet,
        disconnect,
        fetchBalance,
        getConfig,
        getOwnedCollections,
        listCollections,
        collection,
        numOffers,
        addCollection,
        mintNFT,
        burnNFT,
        listNFT,
        sendToken,
        buyNowNFT,
        acceptSaleNFT,
        cancelSaleNFT,
        transferNFT,
        updateNFT,
        collectionConfig
      }}
    >
      {children}
    </CosmwasmContext.Provider>
  )
}