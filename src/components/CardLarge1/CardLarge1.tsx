import React, { FC, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NextPrev from "shared/NextPrev/NextPrev";
import NcImage from "shared/NcImage/NcImage";
import Avatar from "shared/Avatar/Avatar";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import LikeButton from "components/LikeButton";
import ItemTypeVideoIcon from "components/ItemTypeVideoIcon";
import { nftsLargeImgs } from "contains/fakeData";
import TimeCountDown from "./TimeCountDown";
import collectionPng from "images/nfts/collection.png";
import VerifyIcon from "components/VerifyIcon";
import { useNavigate } from "react-router-dom";
import { config } from "app/config";
import { useAppSelector } from "app/hooks";
import { selectDetailOfAnItem, selectCOREPrice } from "app/reducers/nft.reducers";
import { selectCurrentChainId, selectCurrentUser, selectCurrentWallet, selectGlobalProvider, selectWalletStatus } from "app/reducers/auth.reducers";
import { isEmpty } from "app/methods";
import { toast } from "react-toastify";
import { selectSystemTime } from "app/reducers/bid.reducers";
// import { acceptOrEndBid, destroySale, getBalanceOf, placeBid } from "InteractWithSmartContract/interact";
import Modal from "../../components/Modal";
import Bid from "../../containers/NftDetailPage/Bid";
import Accept from "../../containers/NftDetailPage/Accept";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import axios from "axios";

export interface CardLarge1Props {
  className?: string;
  onClickNext?: () => void;
  onClickPrev?: () => void;
  isShowing?: boolean;
  featuredImgUrl?: string;
  item?: any;
}

const CardLarge1: FC<CardLarge1Props> = ({
  className = "",
  isShowing = true,
  onClickNext = () => { },
  onClickPrev = () => { },
  featuredImgUrl = nftsLargeImgs[0],
  item
}) => {
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [consideringItem, setConsideringItem] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const currentUsr = useAppSelector(selectCurrentUser);
  const globalCOREPrice = useAppSelector(selectCOREPrice);
  const [processing, setProcessing] = useState(false);
  const globalAccount = useAppSelector(selectCurrentWallet);
  const globalChainId = useAppSelector(selectCurrentChainId);
  const walletStatus = useAppSelector(selectWalletStatus);
  const globalProvider = useAppSelector(selectGlobalProvider);
  const curTime = useAppSelector(selectSystemTime);
  const [timeLeft, setTimeLeft] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setConsideringItem(item || {});

    console.log("collection logo ===> ", item);
  }, [item])

  const randomTitle = [
    "Walking On Air ",
    "Amazing Nature",
    "Beautiful NFT",
    "Lovely NFT",
    "Wolf Face #1",
  ];

  const checkWalletAddrAndChainId = async () => {
    if (isEmpty(currentUsr) === true) {
      toast.warn("You have to sign in before doing a trading.");
      return false;
    }
    if (walletStatus === false) {
      toast.warn("Please connect and unlock your wallet.");
      return false;
    }
    if (globalAccount && currentUsr && currentUsr.address && globalAccount.toLowerCase() !== currentUsr.address.toLowerCase()) {
      toast.warn("Wallet addresses are not equal. Please check current wallet to your registered wallet.");
      return false;
    }
    return true;
  }

  const isVideo = (item: any) => {
    return item?.musicURL?.toLowerCase().includes("mp4") ? true : false;
  }

  const getLeftDuration = (created: number, period: number, curTime: number) => {

    var createdTime = (new Date(created)).getTime();
    var diff = createdTime + period * 24 * 3600 * 1000 - curTime;
    return diff = diff / 1000;
  }

  const onBid = async (bidPrice: number) => {
    setVisibleModalBid(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }

    if (getLeftDuration((consideringItem as any)?.auctionStarted, (consideringItem as any)?.auctionPeriod, Date.now()) <= 12) {
      setTimeout(() => {
        setProcessing(false);
      }, 15000)
    }
    // let result = await placeBid(new Web3(globalProvider), currentUsr?.address, (consideringItem as any)?._id, Number(bidPrice), (consideringItem as any)?.chainId || 1);
    // if((result as any).success === true) toast.success((result as any).message);
    // else toast.error((result as any).message);    
    setProcessing(false);
  }

  const removeSale = async () => {
    if ((consideringItem as any)?.owner?._id !== currentUsr?._id) {
      toast.warn("You are not the owner of this nft.");
      return;
    }

    if ((consideringItem as any)?.bids.length > 0 && (consideringItem as any)?.isSale === 2) {
      toast.warn("You cannot remove it from sale because you had one or more bid(s) already.");
      return;
    }

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }

    // let iHaveit;
    // iHaveit = await getBalanceOf(new Web3(globalProvider), currentUsr?.address, (consideringItem as any)?._id, (consideringItem as any)?.chainId || 1);
    // if (iHaveit === 1) {
    //   setProcessing(false);
    //   toast.warn("Your NFT is not on sale.");
    //   return;
    // }
    // if (iHaveit && (iHaveit as any).message) {
    //   toast.warn(`${(iHaveit as any).message}`);
    //   return;
    // }
    // let result = await destroySale(new Web3(globalProvider), currentUsr?.address, (consideringItem as any)?._id, (consideringItem as any)?.chainId || 1);
    // if((result as any).success === true) toast.success((result as any).message);
    // else toast.error((result as any).message);    
    setProcessing(false);
  }

  const onAccept = async () => {
    setVisibleModalAccept(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }

    // let result = await acceptOrEndBid(new Web3(globalProvider), currentUsr?.address, (consideringItem as any)?._id, (consideringItem as any)?.chainId || 1);
    // if((result as any).success === true) toast.success((result as any).message);
    // else toast.error((result as any).message);    
    setProcessing(false);
  }

  const setFavItem = async (target_id: string, user_id: string) => {
    if (isEmpty(target_id) || isEmpty(user_id)) return;
    await axios.post(`${config.API_URL}api/users/set_fav_item`, { target_id: target_id, user_id: user_id }, {
      headers:
      {
        "x-access-token": localStorage.getItem("jwtToken")
      }
    }).then(async (result) => {
      await axios.post(`${config.API_URL}api/item/get_detail`, { id: (consideringItem as any)?._id || "" }, {
        headers:
        {
          "x-access-token": localStorage.getItem("jwtToken")
        }
      }).then((result) => {
        checkIsLiked();
        setRefresh(!refresh);
      }).catch(() => {
      });
    });
  }

  const toggleFav = () => {
    setFavItem((consideringItem as any)?._id, currentUsr?._id || "");
  }

  const checkIsLiked = () => {
    if ((consideringItem as any) && currentUsr) {
      if (!(consideringItem as any).likes) {
        setIsLiked(false);
      }

      var isIn = (consideringItem as any)?.likes?.includes(currentUsr._id) || false;

      setIsLiked(isIn);
    }
  }

  const calculateTimeLeft = (created: number, period: number, curTime: number) => {

    var createdTime = (new Date(created)).getTime();
    let difference = createdTime + period * 24 * 3600 * 1000 - curTime;

    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    setTimeLeft(timeLeft);
    setRefresh(!refresh);
    return timeLeft;
  };

  useEffect(() => {
    calculateTimeLeft((consideringItem as any)?.auctionStarted, (consideringItem as any)?.auctionPeriod, curTime);
  }, [curTime]);


  return (
    <div
      className={`nc-CardLarge1 nc-CardLarge1--hasAnimation relative flex flex-col-reverse lg:flex-row justify-end ${className}`}
    >
      <div className="z-10 w-full -mt-2 lg:absolute lg:left-0 lg:top-1/2 lg:transform lg:-translate-y-1/2 lg:mt-0 sm:px-5 lg:px-0 lg:max-w-lg ">
        <div className="p-4 space-y-3 bg-white shadow-lg nc-CardLarge1__left sm:p-8 xl:py-14 md:px-10 dark:bg-neutral-900 rounded-3xl sm:space-y-8 ">
          <h2 className="text-2xl font-semibold lg:text-3xl 2xl:text-5xl ">
            <div onClick={() => { navigate(`/nft-detail/${(consideringItem as any)?._id || ""}`) }} title="Walking On Air">
              {(consideringItem as any)?.name || ""}
            </div>
          </h2>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-12">
            <div className="flex items-center" onClick={() => navigate(`/page-author/${(consideringItem as any)?.creator?._id || ""}/${(consideringItem as any).owner?.view_mode || 0}`)} >
              <div className="flex-shrink-0 w-10 h-10">
                <Avatar sizeClass="w-10 h-10"
                  imgUrl={(consideringItem as any)?.creator?.avatar ? `${config.API_URL}uploads/${(consideringItem as any)?.creator.avatar}` : ""}
                />
              </div>
              <div className="ml-3">
                <div className="text-xs dark:text-neutral-400">Creator</div>
                <div className="flex items-center text-sm font-semibold">
                  <span>{(consideringItem as any)?.creator?.username || ""}</span>
                  <VerifyIcon />
                </div>
              </div>
            </div>
            <div className="flex items-center" onClick={() => navigate(`/collectionItems/${(consideringItem as any)?.collection_id?._id || ""}`)}>
              <div className="flex-shrink-0 w-10 h-10">
                {
                  <Avatar sizeClass="w-10 h-10"
                    imgUrl={`${config.API_URL}uploads/${(consideringItem as any)?.collection_id?.logoURL || ""}`}
                  />
                }
              </div>
              <div className="ml-3">
                <div className="text-xs dark:text-neutral-400">Collection</div>
                <div className="text-sm font-semibold ">{(consideringItem as any)?.collection_id?.name}</div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="relative flex flex-col items-baseline p-6 border-2 border-green-500 sm:flex-row rounded-xl">
              <span className="block absolute bottom-full translate-y-1.5 py-1 px-1.5 bg-white dark:bg-neutral-900 text-sm text-neutral-500 dark:text-neutral-400 ring ring-offset-0 ring-white dark:ring-neutral-900">
                {
                  (consideringItem as any)?.isSale == 2 ?
                    (consideringItem as any)?.bids && (consideringItem as any).bids.length > 0 ?
                      "Current Bid"
                      :
                      "Start price"
                    :
                    (consideringItem as any)?.isSale == 1 ?
                      "Sale Price"
                      :
                      "Price"
                }
              </span>
              <span className="text-3xl font-semibold text-green-500 xl:text-4xl">
                {
                  (consideringItem as any)?.isSale == 2 ?
                    `${(consideringItem as any).bids && (consideringItem as any).bids.length > 0 ?
                      (consideringItem as any).bids[(consideringItem as any).bids.length - 1].price ?
                        (consideringItem as any).bids[(consideringItem as any).bids.length - 1].price : 0
                      :
                      (consideringItem as any)?.price} RIZE`
                    :
                    `${(consideringItem as any)?.price || 0} RIZE`
                }
              </span>
              <span className="text-lg text-neutral-400 sm:ml-3.5">
                {
                  (consideringItem as any)?.isSale == 2 ?
                    `( ≈ $ ${(consideringItem as any).bids && (consideringItem as any).bids.length > 0 ?
                      (consideringItem as any).bids[(consideringItem as any).bids.length - 1].price ?
                        ((consideringItem as any).bids[(consideringItem as any).bids.length - 1].price * globalCOREPrice)?.toFixed(2) : 0
                      :
                      ((consideringItem as any)?.price * globalCOREPrice)?.toFixed(2) || 0} )`
                    :
                    `( ≈ $ ${((consideringItem as any)?.price * globalCOREPrice)?.toFixed(2) || 0})`
                }
              </span>
            </div>
          </div>

          {
            (consideringItem as any)?.isSale === 2 &&
            <div className="space-y-5">
              <div className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400 ">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.75 13.25C20.75 18.08 16.83 22 12 22C7.17 22 3.25 18.08 3.25 13.25C3.25 8.42 7.17 4.5 12 4.5C16.83 4.5 20.75 8.42 20.75 13.25Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 2H15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="mt-1 leading-none">Auction ending in:</span>
              </div>
              <div className="flex space-x-5 sm:space-x-10">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-semibold sm:text-3xl">
                    {(timeLeft as any)?.days || 0}
                  </span>
                  <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
                    Days
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-semibold sm:text-3xl">
                    {(timeLeft as any)?.hours || 0}
                  </span>
                  <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
                    hours
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-semibold sm:text-3xl">
                    {(timeLeft as any)?.minutes || 0}
                  </span>
                  <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
                    mins
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-semibold sm:text-3xl">
                    {(timeLeft as any)?.seconds || 0}
                  </span>
                  <span className="sm:text-lg text-neutral-500">secs</span>
                </div>
              </div>
            </div>
          }

          <div className="w h-[1px] bg-neutral-100 dark:bg-neutral-700"></div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            {
              (consideringItem as any) && currentUsr && (consideringItem as any).isSale === 2 && (consideringItem as any).owner && (consideringItem as any).owner._id !== currentUsr._id ?
                <ButtonPrimary
                  onClick={() => setVisibleModalBid(true)}
                >
                  Place a bid
                </ButtonPrimary> : <></>
            }
            {
              (consideringItem as any) && currentUsr && (consideringItem as any).isSale === 2 && (consideringItem as any).owner && (consideringItem as any).owner._id === currentUsr._id ?
                (consideringItem as any).bids.length > 0 ?
                  <ButtonPrimary
                    onClick={() => setVisibleModalAccept(true)}
                  >
                    Accept
                  </ButtonPrimary>
                  :
                  <ButtonPrimary
                    onClick={() => removeSale()}
                  >
                    Remove from sale
                  </ButtonPrimary>
                : <></>
            }
            <ButtonSecondary onClick={() => { navigate(`/nft-detail/${(consideringItem as any)?._id}`) }} className="flex-1">
              View item
            </ButtonSecondary>
          </div>
        </div>
        <div className="p-4 sm:pt-8 sm:px-10 ">
          <NextPrev
            btnClassName="w-11 h-11 text-xl"
            onClickNext={onClickNext}
            onClickPrev={onClickPrev}
          />
        </div>
      </div>

      <div className="w-full lg:w-[64%] relative ">
        <div className="nc-CardLarge1__right ">
          <div onClick={() => { navigate(`/nft-detail/${(consideringItem as any)?._id || ""}`) }} >
            <NcImage
              containerClassName="aspect-w-1 aspect-h-1 relative"
              className="absolute inset-0 object-cover rounded-3xl sm:rounded-[40px] border-4 sm:border-[14px] border-white dark:border-neutral-800"
              src={(consideringItem as any)?.logoURL ? `${config.API_URL}uploads/${(consideringItem as any)?.logoURL}` : ""}
              alt={"title"}
            />
          </div>
          {
            isVideo((consideringItem as any)) === true &&
            <ItemTypeVideoIcon className="absolute w-8 h-8 md:w-10 md:h-10 left-3 bottom-3 sm:left-7 sm:bottom-7 " />
          }
          <LikeButton liked={isLiked} count={(consideringItem as any)?.likes ? (consideringItem as any).likes.length : 0} toggleFav={toggleFav} className="absolute right-3 top-3 sm:right-7 sm:top-7" />
        </div>
      </div>

      <Modal
        visible={visibleModalBid}
        onClose={() => setVisibleModalBid(false)}
      >
        <Bid nft={(consideringItem as any)} onOk={onBid} onCancel={() => setVisibleModalBid(false)} />
      </Modal>
      <Modal
        visible={visibleModalAccept}
        onClose={() => setVisibleModalAccept(false)} >
        <Accept onOk={onAccept} onCancel={() => { setVisibleModalAccept(false) }} nft={(consideringItem as any)} />
      </Modal>

      {<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={processing}
      >
        <CircularProgress color="inherit" />
      </Backdrop>}

    </div>
  );
};

export default CardLarge1;
