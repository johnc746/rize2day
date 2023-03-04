import Label from "components/Label/Label";
import styles from "../containers/Collections/UploadDetails.module.sass";
import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Input from "shared/Input/Input";
import Textarea from "shared/Textarea/Textarea";
import { Helmet } from "react-helmet";
import FormItem from "components/FormItem";
import { RadioGroup, Switch } from "@headlessui/react";
import { nftsImgs } from "contains/fakeData";
import MySwitch from "components/MySwitch";
import axios from "axios";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import NcImage from "shared/NcImage/NcImage";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { changeCollectionList, CollectionData, selectConllectionList, selectConsideringCollectionId } from "app/reducers/collection.reducers";
import { selectCurrentChainId, selectCurrentUser, selectCurrentWallet, selectDetailedUser, selectGlobalProvider, selectWalletStatus } from "app/reducers/auth.reducers";
import { Navigate, useNavigate } from "react-router-dom";
import { isEmpty } from "app/methods";
import { config } from "app/config.js";
import { changeTradingResult, selectCurrentTradingResult } from "app/reducers/nft.reducers";
// import { batchMintOnSale, singleMintOnSale } from "InteractWithSmartContract/interact";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";
import TextField from '@mui/material/TextField';
// import DateTimePicker  from 'react-datetime-picker';
import { useSigningClient } from "app/cosmwasm";

export interface PageUploadItemProps {
  className?: string;
}

const plans = [
  {
    name: "Crypto Legend - Professor",
    featuredImage: nftsImgs[0],
  },
  {
    name: "Crypto Legend - Professor",
    featuredImage: nftsImgs[1],
  },
  {
    name: "Crypto Legend - Professor",
    featuredImage: nftsImgs[2],
  },
  {
    name: "Crypto Legend - Professor",
    featuredImage: nftsImgs[3],
  },
  {
    name: "Crypto Legend - Professor",
    featuredImage: nftsImgs[4],
  },
  {
    name: "Crypto Legend - Professor",
    featuredImage: nftsImgs[5],
  },
];

const PageUploadItem: FC<PageUploadItemProps> = ({ className = "" }) => {
  const consideringCollectionId = useAppSelector(selectConsideringCollectionId);
  const currentUsr = useAppSelector(selectCurrentUser);
  const globalAddress = useAppSelector(selectCurrentWallet);
  const detailedUserInfo = useAppSelector(selectDetailedUser);
  const collections = useAppSelector(selectConllectionList);
  const tradingResult = useAppSelector(selectCurrentTradingResult);
  const walletStatus = useAppSelector(selectWalletStatus);
  const globalProvider = useAppSelector(selectGlobalProvider);
  const currentChainId = useAppSelector(selectCurrentChainId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [sale, setSale] = useState(false);
  const [selected, setSelected] = useState({ name: "", _id: "", address: "" });
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMusicFileName, setSelectedMusicFileName] = useState("");
  const [selectedMusicFile, setSelectedMusicFile] = useState(null);
  const [logoImg, setLogoImg] = useState("");
  const [textName, setTextName] = useState("");
  const [textWebsite, setTextWebsite] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [colls, setColls] = useState(Array<CollectionData>);
  const [auction, setAuction] = useState(false);
  const [period, setPeriod] = useState(0);
  const [price, setPrice] = useState(0);
  const [stockAmount, setStockAmount] = useState(1);
  const [timeLength, setTimeLength] = useState(0);
  const [metaStr, setMetaStr] = useState("");
  const [working, setWorking] = useState(false);
  const [auctionEndTime, setAuctionEndTime] = useState<Date | null>(new Date());
  const { mintNFT, collectionConfig }: any = useSigningClient();

  useEffect(() => {
    //check the current user, if ther user is not exists or not verified, go back to the home
    if (isEmpty(currentUsr) || (!isEmpty(detailedUserInfo) && !isEmpty(detailedUserInfo?.verified) && !detailedUserInfo?.verified)) 
    {
      toast.warn("Please connect your wallet first.");
      navigate("/");
    }
  }, [])

  useEffect(() => {
    if (collections && collections.length > 0) {
      let tempOptions: any = [];
      collections.map((coll, index) => (
        tempOptions.push({
          _id: coll?._id || "",
          name: coll?.name || "",
          bannerURL: coll?.bannerURL || "",
          address: coll?.address || "",
          cw721address: coll?.cw721address || "",
          collectionNumber: coll?.collectionNumber || ""
        })
      ))
      setColls(tempOptions);
    }
  }, [collections]);

  useEffect(() => {
    if (currentUsr?._id) {
      axios.post(`${config.API_URL}api/collection/getUserCollections`, { limit: 90, userId: currentUsr?._id }, {
        headers:
        {
          "x-access-token": localStorage.getItem("jwtToken")
        }
      }).then((result) => {
        dispatch(changeCollectionList(result.data.data));
      }).catch((err: any) => {
        console.log("error getting collections : ", err);
      });
    }
  }, [currentUsr])

  useEffect(() => {
    if (tradingResult) {
      switch (tradingResult.function) {
        default:
          break;
        case "singleMintOnSale":
          dispatch(changeTradingResult({ function: "", success: false, message: "" }));
          if (tradingResult.success === false) toast.error(tradingResult.message);
          break;
        case "batchMintOnSale":
          dispatch(changeTradingResult({ function: "", success: false, message: "" }));
          if (tradingResult.success === false) toast.error(tradingResult.message);
          break;
      }
    }
  }, [tradingResult])

  const onChangePrice = (e: any) => {
    var inputedPrice = e.target.value;
    if (inputedPrice !== "") {
      let correct = /^([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(inputedPrice);
      if (correct !== true) return;
    }
    setPrice(inputedPrice);
  }

  const onChangeStockAmount = (e: any) => {
    var inputAmount = e.target.value;
    if (inputAmount !== "") {
      let correct = /^([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(inputAmount);
      if (correct !== true) return;
    }
    setStockAmount(Math.ceil(inputAmount) || 1);
  }

  const changeFile = async (event: any) => {
    var file = event.target.files[0];
    if (file == null) return;
    console.log(file);
    if (file.size > 5 * 1024 * 1024) {
      toast.warn("Image file size should be less than 2MB");
      return;
    };
    setSelectedFile(file);
    setSelectedFileName(file.name);
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setLogoImg(reader?.result?.toString() || "");
    };
    reader.onerror = function (error: any) {
      console.log("banner file choosing error : ", error);
    }
  }

  const saveItem = async (params: any) => {
    setWorking(true);
    if (stockAmount > 1) {
      axios({
        method: "post",
        url: `${config.API_URL}api/item/multiple_create`,
        data: params
      })
        .then(async function (response: any) {
          console.log("response = ", response);
          if (response.status === 200) {
            if (sale === true) {
              var aucperiod = (auction === false ? 0 : params.auctionPeriod);
              var price = params.price;
              try {
                // let ret = await batchMintOnSale(
                //   new Web3(globalProvider),
                //   currentUsr?.address || "",
                //   response.data,
                //   aucperiod * 24 * 3600,
                //   price,
                //   0,
                //   currentChainId || 1
                // );
                // if (ret.success === true) {
                //   setWorking(false);
                //   toast.success(<div>{`Successfully Minted ${stockAmount} items. You can see items at `}<span style={{color:"#00f"}} onClick={() =>navigate(`/collectionItems/${params.collectionId}`)}>here</span>.</div>);
                // }
                // else {
                //   setWorking(false);
                //   console.log("Failed in multiple put on sale : "+ ret.message);
                //   toast.error("Failed in multiple token deployment");
                //   return;
                // }
              } catch (err: any) {
                setWorking(false);
                console.log("Failed in multiple minting : " + err);
                toast.error("Failed in multiple minting");
                return;
              }
            }
            setWorking(false);
            toast.success(<div>{`Successfully Created ${stockAmount} items. You can see items at `}<span style={{ color: "#00f" }} onClick={() => navigate(`/collectionItems/${params.collectionId}`)}>here</span>.</div>);
          } else {
            setWorking(false);
            console.log("Failed in multiple uploading : " + response.data.message);
            toast.error("Failed in multiple uploading");
            return;
          }
        })
        .catch(function (error: any) {
          setWorking(false);
          console.log("Failed in multiple uploading : " + error);
          toast.error("Failed in multiple uploading");
        });
    }
    else {
      axios({
        method: "post",
        url: `${config.API_URL}api/item/create`,
        data: params
      })
        .then(async function (response: any) {
          console.log("response = ", response);
          if (response.status === 200) {
            // if (sale === true) {
              var aucperiod = (auction === false ? 0 : response.data.auctionPeriod);
              var price = response.data.price;
              var newItemId = response.data._id;
              console.log("aucperiod === >", aucperiod);
              console.log("price === >", price);
              console.log("item id === >", newItemId);
              try {
                //------------------ for erc20 -----------------
                // let ret = await singleMintOnSale(
                //   new Web3(globalProvider),
                //   currentUsr?.address || "",
                //   response.data._id,
                //   aucperiod * 24 * 3600 ,
                //   price,
                //   0,
                //   currentChainId || 1
                // );
                // if (ret.success === true) {
                //   setWorking(false);
                //   toast.success(<div>Successfully minted an item. You can see items at <span style={{color:"#00f"}} onClick={() => navigate(`/collectionItems/${params.collectionId}`)}>here</span></div>);
                // }
                // else {
                //   setWorking(false);
                //   console.log("Failed in put on sale : " + ret.message);
                //   toast.error("Failed in token deployment");
                //   return;
                // }
                //-------------upper codes are for erc20-------------------

                console.log("selected collection ===> ", selected);
                let colllectionInfo = await collectionConfig(selected.address);
                console.log("collection config ===> ", colllectionInfo);
                let unusedTokenId = colllectionInfo.unused_token_id;

                const txHash = await mintNFT(currentUsr.address, selected.address, params.itemName, newItemId);
                console.log("Item creating tx: ", txHash);
                if(txHash != -1)
                {
                  //update item with token id
                  await axios.post(`${config.API_URL}api/item/updateTokenId`,
                  {
                    itemId: newItemId,
                    tokenId: unusedTokenId
                  })
                  .then(response =>{
                    setWorking(false);
                    if(response.data.code == 0) toast.success(<div>Successfully created an item. You can see items at <span style={{ color: "#00f" }} onClick={() => navigate(`/collectionItems/${params.collectionId}`)}>here</span></div>);
                    navigate("/page-search");
                  })
                  .catch(error => {
                    setWorking(false);
                  })
                }else {
                  toast.error("Trnasction failed!");
                }
              } catch (err: any) {
                setWorking(false);
                console.log("Failed in single item uploading : ", err);
                toast.error("Failed in single item uploading");
                return;
              }
            // }
            
          } else {
            setWorking(false);
            console.log("Failed in single item uploading : " + response.data.message);
            toast.error("Failed in single item uploading");
          }
        })
        .catch(function (error: any) {
          setWorking(false);
          console.log("Failed in single item uploading : " + error);
          toast.error("Failed in single item uploading");
        });
    }

  }

  const createItem = async () => {
    console.log("createItem 00");
    if (sale) {
      if (Number(price) < 0.00001 || isNaN(Number(price))) {
        toast.error("Invalid price. Price must be equal or higher than 0.00001");
        return;
      } else {
        setPrice(Number(price))
      }
      if ((globalAddress && (currentUsr && currentUsr?.address)) && currentUsr.address.toLowerCase().trim() === globalAddress.toLowerCase().trim()) { }
      else {
        toast.warn("Minting wallet address should be a registered wallet address. Pleast connect a registed wallet when you used on sign up. ");
        return;
      }
    }
    console.log("createItem 00 11 ");
    if (isEmpty(currentUsr)) {
      toast.warn("You have to sign in before doing a trading.");
      return;
    }
    console.log("createItem 11");
    // if (selectedMusicFile == null) { 
    //   console.log("Invalid music file.");
    //   toast.warn("Music file is not selected.");
    //   return;
    // }
    if (selectedFile == null) {
      console.log("Invalid file.");
      toast.warn("Image is not selected.");
      return;
    }
    if (textName === "") {
      toast.error("Item name cannot be empty.");
      return;
    }
    if (isEmpty(selected) || selected.name === "") {
      toast.warn("Please select a collection and try again.");
      return;
    }
    console.log("createItem 22");
    if (stockAmount < 1) {
      toast.warn("Please input a valid stock amount.");
      return;
    }
    if (sale === true) {
      if (walletStatus === false) {
        toast.warn("Please connect your wallet and try again.");
        return;
      }
    }
    console.log("createItem 33");
    setWorking(true);
    var formData = new FormData();
    var uploadedMusicPath = "";
    // formData.append("itemFile", selectedMusicFile);
    // formData.append("authorId", "hch");
    // formData.append("collectionName", selected?.name);
    // await axios({
    //   method: "post",
    //   url: `${config.API_URL}api/utils/upload_file`,
    //   data: formData,
    //   headers: { "Content-Type": "multipart/form-data" },
    // })
    // .then(function (response:any) {
    //   uploadedMusicPath = response.data.path;
    //   toast.info("Music file is uploaded.");
    // })
    // .catch((err:any) => {
    //   console.log("music file uploading error : ", err);
    //   toast.error("Music file uploading failed.");
    //   setWorking(false);
    //   return;
    // });

    formData = new FormData();
    formData.append("itemFile", selectedFile);
    formData.append("authorId", "hch");
    formData.append("collectionName", selected?.name);
    console.log("selectedFile ===> ", selectedFile);

    await axios({
      method: "post",
      url: `${config.API_URL}api/utils/upload_file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(async function (response: any) {
        let paths = [], idx = 0;
        for (idx = 0; idx < stockAmount; idx++) paths.push(response.data.path);
        const params = {
          itemName: textName,
          itemMusicURL: uploadedMusicPath,
          itemLogoURL: response.data.path,
          itemDescription: textDescription,
          collectionId: selected?._id || "",
          creator: currentUsr?._id || "",
          owner: currentUsr?._id || "",
          isSale: 0,
          price: !sale ? 0 : price,
          auctionPeriod: !sale ? 0 : period,
          stockAmount: stockAmount > 1 ? Math.floor(stockAmount) : 1,
          metaData: metaStr,
          mutiPaths: paths,
          timeLength: timeLength,
          stockGroupId: new Date().getTime(),
          chainId: currentChainId || 1
        };
        await saveItem(params);
      })
      .catch(function (error: any) {
        console.log("banner file uploading error : ", error);
        toast.error("Banner file uploading failed.");
        setWorking(false);
      });
  }

  const handlelChangeAuctionEndTime = (value: Date) => {
    if (value) {
      let dl = value.getTime() - Date.now();
      if (dl > 1000 * 60)    // bigger than 60s 
      {
        setAuctionEndTime(value);
        setPeriod(dl);
      }
      else {
        setAuctionEndTime(new Date());
      }
    }
  }

  return (
    <>

      <Helmet>
        <title>Create an item || Rize2Day </title>
      </Helmet>
      <div
        className={`nc-PageUploadItem ${className}`}
        data-nc-id="PageUploadItem"
      >
        <Helmet>
          <title>Create Item(s) || Radioreum NFT Marketplace</title>
        </Helmet>
        <div className="container">
          <div className="max-w-4xl mx-auto my-12 space-y-8 sm:lg:my-16 lg:my-24 sm:space-y-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Create New Item
              </h2>
              <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                You can set preferred display name, create your profile URL and
                manage other personal settings.
              </span>
            </div>
            <div className="w-full border-b-2 border-neutral-100 dark:border-neutral-700"></div>
            <div className="mt-10 space-y-5 md:mt-0 sm:space-y-6 md:sm:space-y-8">
              {/* <div>
              <h3 className="text-lg font-semibold sm:text-2xl">
                Music or video file
              </h3>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                File types supported: MP3, mp4
              </span>
              <div className="mt-5 ">
                <div className="flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-dashed border-neutral-300 dark:border-neutral-6000 rounded-xl">
                  <div className="space-y-1 text-center">
                    <svg
                      className="w-12 h-12 mx-auto text-neutral-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    <div className="flex justify-center text-sm text-center text-neutral-6000 dark:text-neutral-300">
                      <label
                        htmlFor="file-upload"
                        className="relative font-medium rounded-md cursor-pointer text-primary-6000 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a music or video file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".mp3,.MP3,.mp4,.MP4"
                          onChange={changeMusicFile}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">                      
                      {
                        !selectedMusicFile ?
                          "Music Max 10MB, Video Max 20MB"
                          :
                          selectedMusicFileName
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div> */}

              <div>
                <h3 className="text-lg font-semibold sm:text-2xl">
                  Image file
                </h3>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  File types supported: PNG, JPEG
                </span>
                <div className="mt-5 ">
                  <div className="flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-dashed border-neutral-300 dark:border-neutral-6000 rounded-xl">
                    <div className="space-y-1 text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-neutral-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                      <div className="flex justify-center text-sm text-neutral-6000 dark:text-neutral-300">
                        <label
                          htmlFor="file-upload2"
                          className="relative font-medium rounded-md cursor-pointer text-primary-6000 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span className="text-green-500">Upload a image file</span>
                          <input
                            id="file-upload2"
                            name="file-upload2"
                            type="file"
                            className="sr-only"
                            accept=".png,.jpeg,.jpg,.gif,.mp3,.mp4"
                            onChange={changeFile}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {
                          !selectedFile ?
                            "Max 5MB."
                            :
                            selectedFileName
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormItem label="Item Name">
                <Input value={textName} onChange={(e) => setTextName(e.target.value)} />
              </FormItem>

              <FormItem
                label="Description"
                desc={
                  <div>
                    The description will be included on the item's detail page
                    underneath its image.{" "}
                    <span className="text-green-500">Markdown</span> syntax is
                    supported.
                  </div>
                }
              >
                <Textarea rows={6} className="mt-1.5" placeholder="..." value={textDescription} onChange={(event) => {
                  setTextDescription(event.target.value);
                }} />
              </FormItem>

              <div className="w-full border-b-2 border-neutral-100 dark:border-neutral-700"></div>

              <div>
                <Label>Choose collection</Label>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Choose an exiting collection or create a new one. If you don't have any collection please click here to go to <span onClick={() => navigate("/createCollection")} className="text-green-500 cursor-pointer" >create a collection</span>.
                </div>
                <RadioGroup value={selected} onChange={setSelected}>
                  <RadioGroup.Label className="sr-only">
                    Server size
                  </RadioGroup.Label>
                  <div className="flex py-2 space-x-4 overflow-auto customScrollBar">
                    {colls.map((plan, index) => (
                      <RadioGroup.Option
                        key={index}
                        value={plan}
                        className={({ active, checked }) =>
                          `${active
                            ? "ring-2 ring-offset-2 ring-offset-sky-300 ring-white ring-opacity-60"
                            : ""
                          }
                  ${checked
                            ? "bg-teal-600 text-white"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }
                    relative flex-shrink-0 w-44 rounded-xl border border-neutral-200 dark:border-neutral-700 px-6 py-5 cursor-pointer flex focus:outline-none `
                        }
                      >
                        {({ active, checked }) => (
                          <>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <div className="flex items-center justify-between">
                                    <RadioGroup.Description
                                      as="div"
                                      className={"rounded-full w-16"}
                                    >
                                      <NcImage
                                        containerClassName="aspect-w-1 aspect-h-1 rounded-full overflow-hidden"
                                        src={`${config.API_URL}uploads/${plan?.bannerURL || ""}`}
                                      />
                                    </RadioGroup.Description>
                                    {checked && (
                                      <div className="flex-shrink-0 text-white">
                                        <CheckIcon className="w-6 h-6" />
                                      </div>
                                    )}
                                  </div>
                                  <RadioGroup.Label
                                    as="p"
                                    className={`font-semibold mt-3  ${checked ? "text-white" : ""
                                      }`}
                                  >
                                    {plan?.name || ""}
                                  </RadioGroup.Label>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* <MySwitch label={"Put on sale"} desc={"Please enter the price and stock amount that shows how many copies of this item you want to sell "} onChange={setSale} /> */}
              {
                sale === true &&
                <>
                  <FormItem label={`Enter your price($100)`} className="text-sm" >
                    <Input value={price || 0} onChange={onChangePrice} />
                  </FormItem>
                  <FormItem label="Enter your stock amount" className="text-sm" >
                    <Input value={stockAmount || 1} onChange={onChangeStockAmount} />
                  </FormItem>
                </>
              }
              {/* <MySwitch
                label={"Put it on auction"}
                desc={"Please input expiration date amd time of auction"}
                onChange={setAuction}
              /> */}
              {
                sale === true && auction === true &&
                <FormItem label="Enter your auction end time" className="text-sm" >
                  {/* //  <DateTimePicker 
                  //   value={auctionEndTime ||  new Date()}
                  //   onChange={(newValue:any) => {
                  //     handlelChangeAuctionEndTime(newValue);
                  //   }}
                  //   format="dd/MM/yyyy hh:mm a"
                  // />  */}
                  <select className="w-full border rounded-xl" value={period} onChange={(event) => { setPeriod((event as any).target.value) }} placeholder="select auction time">
                    <option value={0.000694}>1 min</option>
                    <option value={0.00347}>5 min</option>
                    <option value={0.00694}>10 min</option>
                    <option value={7}>7 days</option>
                    <option value={10}>10 days</option>
                    <option value={30}>1 month</option>
                  </select>
                </FormItem>
              }
              <div className="flex flex-col pt-2 space-x-0 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 ">
                <ButtonPrimary className="flex-1" onClick={() => { createItem() }}>Create an Item</ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={working}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </>
  );
};

function CheckIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PageUploadItem;
