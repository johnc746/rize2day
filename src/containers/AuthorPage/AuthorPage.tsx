import React, { FC, Fragment, useEffect, useState, useReducer } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import BackgroundSection from "components/BackgroundSection/BackgroundSection";
import NcImage from "shared/NcImage/NcImage";
import CardNFT from "components/CardNFT";
import Pagination from "shared/Pagination/Pagination";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import authorBanner from "images/nfts/authorBanner.png";
import { nftsImgs } from "contains/fakeData";
import NftMoreDropdown from "components/NftMoreDropdown";
import ButtonDropDownShare from "components/ButtonDropDownShare";
import SectionBecomeAnAuthor from "components/SectionBecomeAnAuthor/SectionBecomeAnAuthor";
import SocialsList from "shared/SocialsList/SocialsList";
import FollowButton from "components/FollowButton";
import VerifyIcon from "components/VerifyIcon";
import { Tab } from "@headlessui/react";
import CardAuthorBox3 from "components/CardAuthorBox3/CardAuthorBox3";
import EffectListBox, { NFT_EFFECT } from "components/EffectListBox";
import SectionGridAuthorBox from "components/SectionGridAuthorBox/SectionGridAuthorBox";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeDetailedUserInfo,
  selectCurrentUser,
  changeOtherUserInfo,
  selectOtherUser
} from "app/reducers/auth.reducers";
import {
  changeFollow,
  changeFollowList,
  changeFollowingList,
  selectFollowingList,
  selectFollowList,
  changeIsExists
} from "app/reducers/flollow.reducers";
import { config } from "app/config";
import facebook from "images/socials/facebook.svg";
import twitter from "images/socials/twitter.svg";
import telegram from "images/socials/telegram.svg";
import { SocialType } from "shared/SocialsShare/SocialsShare";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { isEmpty } from "app/methods";
import { changeItemsList, changeItemsListOfAUser, selectItemsOfAUser } from "app/reducers/nft.reducers";

import { toast } from "react-toastify";
import CardNFTVideo from "components/CardNFTVideo";
import { io } from "socket.io-client";
import { MySound } from "shared/MusicSetting/MySound";
import ViewListBox, { VIEW_MODE } from "components/ViewListBox";
import SortableExplorer from "./Sortable.jsx";

var socket = io(`${config.socketUrl}`);

export interface AuthorPageProps {
  className?: string;
}

export interface UserItemFetchingParams {
  start?: number,
  last?: number,
  activeindex?: number
}

const AuthorPage: FC<AuthorPageProps> = ({ className = "" }) => {

  const currentUsr = useAppSelector(selectCurrentUser);
  const toUsr = useAppSelector(selectOtherUser);
  const [userSocials, setUerSocials] = useState(Array<SocialType>);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isliked, setIsLiked] = useState(false);
  const [activeIndex, setActiveIndex] = useState(2);
  const [collectedItems, setCollectedItems] = useState([]);
  const [createdItems, setCreatedItems] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  const [detailedPL, setDetailedPlayList] = useState(Array<any>);
  const { userId } = useParams();  //taget_id in making follow
  const [start, setStart] = useState(0);
  const [last, setLast] = useState(1000);
  const [followingAuthors, setFollowingAuthors] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [detailedUserInfo, setDetailedUserInfo] = useState(currentUsr);
  const [effect, setEffect] = useState(NFT_EFFECT.DRAG_VIEW)
  const [effect3D, setEffect3D] = useState(NFT_EFFECT.NO_EFFECT);
  const [viewMode, setViewMode] = useState(VIEW_MODE.PUBLIC);
  const [url, setUrl] = useState("");
  const [pdata, setPData] = useState({});

  useEffect(() => {
    var socs = [];
    if (detailedUserInfo?.facebook) socs.push({
      name: "Facebook",
      icon: facebook,
      href: detailedUserInfo?.facebook
    })
    if (detailedUserInfo?.telegram) socs.push({
      name: "Telegram",
      icon: telegram,
      href: detailedUserInfo?.telegram
    })
    if (detailedUserInfo?.twitter) socs.push({
      name: "Twitter",
      icon: twitter,
      href: detailedUserInfo?.twitter
    })
    setUerSocials(socs);
    setViewMode(currentUsr?.view_mode);
  }, [detailedUserInfo]);

  let [categories] = useState([
    "Collectibles",
    "Created",
    "Liked",
    "Following",
    "Followers"
  ]);

  const getIsExists = (user_id: string, target_id: string) => {
    if (isEmpty(user_id) || isEmpty(target_id)) return;
    axios.post(`${config.API_URL}api/follow/get_isExists`,
      { user_id, target_id }, {
      headers:
      {
        "x-access-token": localStorage.getItem("jwtToken")
      }
    })
      .then((result) => {
        console.log("IS_FOLLOWING_EXISTS : ", result.data.data);
        dispatch(changeIsExists(result.data.data));
        setIsLiked(result.data.data);
      }).catch(() => {

      });
  }

  const toggleFollow = async (my_id: string, target_id: string) => {
    if (isEmpty(my_id) || isEmpty(target_id)) return;
    await axios.post(`${config.API_URL}api/follow/toggle_follow`, { my_id, target_id }, {
      headers:
      {
        "x-access-token": localStorage.getItem("jwtToken")
      }
    }).then((result) => {
      dispatch(changeFollow({ follow_status: true }))
    }).catch(() => {
      dispatch(changeFollow({ follow_status: false }))
    });
  }

  const getDetailedUserInfo = async (userId: string, isForMine = true) => {
    if (isEmpty(userId)) return;
    await axios.post(`${config.API_URL}api/users/findOne`, { userId }, {
      headers:
      {
        "x-access-token": localStorage.getItem("jwtToken")
      }
    }).then((result) => {
      console.log("[getDetailedUserInfo] : ", result.data.data);
      if (isForMine === true) {
        dispatch(changeDetailedUserInfo(result.data.data || []));
      }
      else {
        dispatch(changeOtherUserInfo(result.data.data || []));
      }
      setDetailedUserInfo(result.data.data || {});
    }).catch(() => {
      console.log("Get detailed userInfo failed.");
    });
  }

  const getFollowList = async (user_id: string, limit: number) => {
    if (isEmpty(user_id)) return;
    await axios.post(`${config.API_URL}api/follow/get_follows`,
      { limit: limit, my_id: user_id }, {
      headers:
      {
        "x-access-token": localStorage.getItem("jwtToken")
      }
    })
      .then((result) => {
        console.log("UPDATE_FOLLOW_LIST : ", result.data.data);
        setFollowers(result.data.data || []);
        dispatch(changeFollowList(result.data.data || []));
      }).catch(() => {
      });
  }

  const getFollowingList = async (user_id: string, limit: number) => {
    if (isEmpty(user_id)) return;
    await axios.post(`${config.API_URL}api/follow/get_followings`,
      { limit: limit, my_id: user_id }, {
      headers:
      {
        "x-access-token": localStorage.getItem("jwtToken")
      }
    })
      .then((result) => {
        console.log("UPDATE_FOLLOWing_LIST : ", result.data.data);
        setFollowingAuthors((result.data && result.data.data) ? result.data.data : []);
        dispatch(changeFollowingList((result.data && result.data.data) ? result.data.data : []));
      }).catch(() => {
      });
  }

  const getItemsOfUserByConditions = (params: UserItemFetchingParams, userId: string) => {
    if (isEmpty(userId)) return;

    if (currentUsr._id === userId) {
      setUrl(`${config.API_URL}api/item/get_items_of_user`);
      setPData({ ...params, userId: userId });
      axios.post(`${config.API_URL}api/item/get_items_of_user`,
        { ...params, userId: userId }, {
        headers:
        {
          "x-access-token": localStorage.getItem("jwtToken")
        }
      }).then((result) => {
        if (activeIndex === 1) setCollectedItems((result.data?.data) ? result.data.data : []);
        if (activeIndex === 2) setCreatedItems((result.data?.data) ? result.data.data : []);
        if (activeIndex === 3) setLikedItems((result.data?.data) ? result.data.data : []);
        dispatch(changeItemsListOfAUser((result.data?.data) ? result.data.data : []));
      }).catch((err) => {
        console.log("get_items_of_user : ", err)
      });
    }
    else {
      setUrl(`${config.API_URL}api/item/get_others_nfts`);
      setPData({ fromId: currentUsr._id, toId: userId});
      axios.post(`${config.API_URL}api/item/get_others_nfts`,
        { fromId: currentUsr._id, toId: userId}, {
        headers:
        {
          "x-access-token": localStorage.getItem("jwtToken")
        }
      }).then((result) => {
        if (activeIndex === 1) setCollectedItems((result.data?.data) ? result.data.data : []);
        if (activeIndex === 2) setCreatedItems((result.data?.data) ? result.data.data : []);
        if (activeIndex === 3) setLikedItems((result.data?.data) ? result.data.data : []);
        dispatch(changeItemsListOfAUser((result.data?.data) ? result.data.data : []));
      }).catch((err) => {
        console.log("get_items_of_user : ", err)
      });
    }
  }

  const getUserDetailedPlayHistory = async (userId: string) => {
    if (isEmpty(userId)) return;
    let tempPlayList = [] as Array<any>;
    await axios.post(`${config.API_URL}api/users/findOne`, { userId }, {
      headers:
      {
        "x-access-token": localStorage.getItem("jwtToken")
      }
    }).then((result) => {
      let simplePL = result.data.data.playList || [];
      console.log("simplePL = ", simplePL);
      tempPlayList = simplePL;
      setDetailedPlayList(tempPlayList);
    }).catch((err) => { });

  }

  useEffect(() => {
    getDetailedUserInfo(userId || "", (userId || "") === (currentUsr?._id || ""));
    getFollowList(userId || "", 10);
    getFollowingList(userId || "", 10);
    getIsExists(currentUsr?._id || "", userId || "");
  }, [userId])

  useEffect(() => {
    socket.on("UpdateStatus", (data: any) => {
      console.log(data);
      getDetailedUserInfo(userId || "", (userId || "") === (currentUsr?._id || ""));
      getFollowList(userId || "", 10);
      getFollowingList(userId || "", 10);
      getIsExists(currentUsr?._id || "", userId || "");
    });
  }, []);

  useEffect(() => {
    console.log("activeIndex = ", activeIndex);
    let params = { start: start, last: last, activeindex: activeIndex };
    if (activeIndex >= 1 && activeIndex <= 3 && userId !== undefined) {
      getItemsOfUserByConditions(params, userId ? userId : "");
    }
    if (activeIndex === 4) {
      getFollowList(userId || "", 10)
      setTimeout(() => {
        getFollowList(userId || "", 10)
      }, 1000)
    }
    if (activeIndex === 5) {
      getFollowingList(userId || "", 10)
      setTimeout(() => {
        getFollowList(userId || "", 10)
      }, 1000)
    }
    if (activeIndex === 6) {
      getUserDetailedPlayHistory(userId || "");
    }
  }, [activeIndex, userId])

  const updateFollowings = () => {
    if (isEmpty(userId)) return;
    getFollowList(userId || "", 10)
    getFollowingList(userId || "", 10)
  }

  const toggleFollowing = (targetId: string) => {
    if (isEmpty(targetId) || isEmpty(currentUsr?._id)) {
      toast.warn("Please log in first.");
      return;
    }
    toggleFollow(currentUsr?._id || "", targetId)
  }

  const updateFollows = () => {
    if (isEmpty(userId)) return;
    getFollowList(userId || "", 10)
    getFollowingList(userId || "", 10)
  }

  const isVideoItem = (item: any) => {
    return item?.musicURL?.toLowerCase().includes("mp4") ? true : false;
  }

  const handleMessage = () => {
    if (!isEmpty(currentUsr)) {
      navigate(`/message/${userId}`)
    }
  }

  const onSelectEffect = (v: any) => {
    setEffect3D(v?.code);
    setEffect(v);

    // if (v?.code === NFT_EFFECT.SPHERE_VIEW) {
    //   /* eslint-disable */
    //   $("#sphereView").C3DGallery({ data: dataSphere });
    //   /* eslint-disable */
    // }
  }

  const onSelectViewMode = (v: any) => {
    axios.post(`${config.API_URL}api/users/update`,
      { _id: userId || "", view_mode: v.code })
      .then((result) => {
        if (result.data.code === 0) {
          setViewMode(v);
        }
      }).catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className={`nc-AuthorPage  ${className}`} data-nc-id="AuthorPage">
      <MySound update={true} status={true} />
      <Helmet>
        <title>Creator || Redioreum NFT Marketplace</title>
      </Helmet>

      <div className="w-full">
        <div className="container -mt-2 lg:-mt-3">
          <div className="relative bg-white dark:bg-neutral-900 dark:border dark:border-neutral-700 p-5 lg:p-8 rounded-3xl md:rounded-[40px] shadow-xl flex flex-col md:flex-row">
            <div className="flex-shrink-0 w-32 mt-12 lg:w-44 sm:mt-0">
              <NcImage
                src={
                  `${config.API_URL}uploads/${detailedUserInfo?.avatar}` || ""
                }
                containerClassName="aspect-w-1 aspect-h-1 rounded-3xl overflow-hidden"
              />
            </div>
            <div className="flex-grow pt-5 md:pt-1 md:ml-6 xl:ml-14">
              <div className="max-w-screen-sm ">
                <h2 className="inline-flex items-center text-2xl font-semibold sm:text-3xl lg:text-4xl">
                  <span>{detailedUserInfo?.username || ""}</span>
                  <VerifyIcon
                    className="ml-2"
                    iconClass="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8"
                  />
                </h2>
                {
                  detailedUserInfo?.address?.toLowerCase() === currentUsr?.address?.toLowerCase() &&
                  <div className="flex items-center text-sm font-medium space-x-2.5 mt-2.5 text-green-600 cursor-pointer">
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {detailedUserInfo?.address || " "}
                    </span>
                    <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                      <path
                        d="M18.05 9.19992L17.2333 12.6833C16.5333 15.6916 15.15 16.9083 12.55 16.6583C12.1333 16.6249 11.6833 16.5499 11.2 16.4333L9.79999 16.0999C6.32499 15.2749 5.24999 13.5583 6.06665 10.0749L6.88332 6.58326C7.04999 5.87492 7.24999 5.25826 7.49999 4.74992C8.47499 2.73326 10.1333 2.19159 12.9167 2.84993L14.3083 3.17493C17.8 3.99159 18.8667 5.71659 18.05 9.19992Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.5498 16.6583C12.0331 17.0083 11.3831 17.3 10.5915 17.5583L9.2748 17.9917C5.96646 19.0583 4.2248 18.1667 3.1498 14.8583L2.08313 11.5667C1.01646 8.25833 1.8998 6.50833 5.20813 5.44167L6.5248 5.00833C6.86646 4.9 7.19146 4.80833 7.4998 4.75C7.2498 5.25833 7.0498 5.875 6.88313 6.58333L6.06646 10.075C5.2498 13.5583 6.3248 15.275 9.7998 16.1L11.1998 16.4333C11.6831 16.55 12.1331 16.625 12.5498 16.6583Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                }
                <span className="block mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {detailedUserInfo?.userBio || ""}
                </span>
              </div>
              <div className="mt-4 ">
                <SocialsList socials={userSocials} itemClass="block w-7 h-7" />
              </div>
            </div>
            <div className="absolute flex flex-row-reverse justify-end md:static left-5 top-4 sm:left-auto sm:top-5 sm:right-5 gap-5">
              {/* <NftMoreDropdown
                actions={[
                  {
                    id: "report",
                    name: "Report abuse",
                    icon: "las la-flag",
                  },
                ]}
                containerClassName="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:bg-neutral-800 cursor-pointer"
              /> */}
              {/* <ButtonDropDownShare
                className="flex items-center justify-center w-8 h-8 mx-2 rounded-full cursor-pointer md:w-10 md:h-10 bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:bg-neutral-800"
                panelMenusClass="origin-top-right !-right-5 !w-40 sm:!w-52"
              /> */}

              <FollowButton
                isFollowing={isliked || false}
                fontSize="text-sm md:text-base font-medium"
                sizeClass="px-4 py-1 md:py-2.5 h-8 md:!h-10 sm:px-6 lg:px-8"
                onTogglefollow={toggleFollowing}
                afterExcute={getIsExists}
              />
              {!isEmpty(currentUsr) && (
                <ButtonPrimary
                  className="relative z-10"
                  fontSize="text-sm font-medium"
                  sizeClass="px-4 py-1 md:py-2.5 h-8 md:!h-10 sm:px-6 lg:px-8"
                  onClick={handleMessage}
                >
                  Send Message
                </ButtonPrimary>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-16 lg:pb-28 lg:pt-20 lg:space-y-28">
        <main>
          <Tab.Group>
            <div className="flex flex-col justify-between lg:flex-row ">
              <Tab.List className="flex pb-10 space-x-0 overflow-x-auto sm:space-x-2">
                {
                  categories.map((item, index) => (
                    <Tab key={item} as={Fragment} >
                      {({ selected }) => (
                        <button
                          className={`flex-shrink-0 block font-medium px-4 py-2 text-sm sm:px-6 sm:py-2.5 capitalize rounded-full focus:outline-none ${index === activeIndex - 1
                            ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900"
                            : "text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-100/70 dark:hover:bg-neutral-800"
                            } `}
                          onClick={() => { setActiveIndex(Number(index) + Number(1)) }}
                        >
                          {item}
                        </button>
                      )}
                    </Tab>
                  ))
                }
              </Tab.List>
              {
                (currentUsr?._id !== "" && currentUsr?._id === userId) &&
                <div className="flex items-end justify-end mt-5 lg:mt-0">
                  <ViewListBox onSelected={onSelectViewMode} />
                </div>
              }
              <div className="flex items-end justify-end mt-5 lg:mt-0">
                <EffectListBox onSelected={onSelectEffect} />
              </div>
            </div>
            <Tab.Panels>
              {
                effect3D === NFT_EFFECT.WALK_THROUGH ?
                  (
                    <iframe className="w-full h-[500px] mt-3" src={`http://68.178.206.38:9966?url=${url}&param=${JSON.stringify(pdata)}&upload=${config.API_URL}uploads/`} />
                  ) :
                  effect3D === NFT_EFFECT.SPHERE_VIEW ?
                    (
                      <iframe className="w-full h-[500px] mt-3" src={`http://68.178.206.38:3001?url=${url}&param=${JSON.stringify(pdata)}&upload=${config.API_URL}uploads/`} />
                    ) :
                    effect3D === NFT_EFFECT.DNA_VIEW ?
                      (
                        <iframe className="w-full h-[500px] mt-3" src="" />
                      ) :
                      effect3D === NFT_EFFECT.PYRAMID_VIEW ?
                        (
                          <iframe className="w-full h-[500px] mt-3" src={`http://68.178.206.38:3002?url=${url}&param=${JSON.stringify(pdata)}&upload=${config.API_URL}uploads/`} />
                        ) :
                        effect3D === NFT_EFFECT.DRAG_VIEW ? (
                            <SortableExplorer view={4} data={activeIndex === 1 ? collectedItems : activeIndex === 2 ?createdItems : activeIndex === 3 ? likedItems : []} effect={effect} />
                        )
                          :
                          activeIndex === 1 ? (
                            <>
                              <div className="grid mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 lg:mt-10">
                                {collectedItems && collectedItems.map((x, index) => (
                                  isVideoItem(x) === true ?
                                    <CardNFTVideo key={index} item={x} hideHeart={true} effect={effect} />
                                    :
                                    <CardNFT key={index} item={x} hideHeart={true} effect={effect} />
                                ))}
                              </div>
                              {/* <div className="flex flex-col mt-12 space-y-5 lg:mt-16 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination />
                  <ButtonPrimary loading>Show me more</ButtonPrimary>
                </div> */}
                            </>
                          )
                            :
                            activeIndex === 2 ? (
                              <>
                                <div className="grid mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 lg:mt-10">
                                  {createdItems && createdItems.map((x, index) => (
                                    isVideoItem(x) === true ?
                                      <CardNFTVideo key={index} item={x} hideHeart={true} effect={effect} />
                                      :
                                      <CardNFT key={index} item={x} hideHeart={true} effect={effect} />
                                  ))}
                                </div>
                                {/* <div className="flex flex-col mt-12 space-y-5 lg:mt-16 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination />
                  <ButtonPrimary loading>Show me more</ButtonPrimary>
                </div> */}
                              </>
                            )
                              :
                              activeIndex === 3 ? (
                                <>
                                  <div className="grid mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 lg:mt-10">
                                    {likedItems && likedItems.map((x, index) => (
                                      isVideoItem(x) === true ?
                                        <CardNFTVideo key={index} item={x} hideHeart={true} effect={effect} />
                                        :
                                        <CardNFT key={index} item={x} hideHeart={true} effect={effect} />
                                    ))}
                                  </div>
                                  {/* <div className="flex flex-col mt-12 space-y-5 lg:mt-16 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination />
                  <ButtonPrimary loading>Show me more</ButtonPrimary>
                </div> */}
                                </>
                              )
                                :
                                activeIndex === 4 ? (
                                  <>
                                    <div className="grid gap-8 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:mt-10">
                                      {followingAuthors && followingAuthors.map((x, index) => (
                                        <CardAuthorBox3 following={true} key={index} item={x} onUpdate={updateFollowings} onUnfollow={toggleFollowing} />
                                      ))}
                                    </div>
                                    {/* <div className="flex flex-col mt-12 space-y-5 lg:mt-16 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination />
                  <ButtonPrimary loading>Show me more</ButtonPrimary>
                </div> */}
                                  </>
                                )
                                  :
                                  activeIndex === 5 ? (
                                    <>
                                      <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8 lg:mt-10">
                                        {followers && followers.map((x, index) => (
                                          <CardAuthorBox3 following={false} key={index} item={x} />
                                        ))}
                                      </div>
                                      {/* <div className="flex flex-col mt-12 space-y-5 lg:mt-16 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination />
                  <ButtonPrimary loading>Show me more</ButtonPrimary>
                </div> */}
                                    </>
                                  )
                                    : activeIndex === 6 ? (
                                      <>
                                        <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8 lg:mt-10">
                                          {detailedPL && detailedPL.map((x, index) => (
                                            <p key={index} >
                                              {x.toString()}
                                            </p>
                                          ))}
                                        </div>
                                        {/* <div className="flex flex-col mt-12 space-y-5 lg:mt-16 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination />
                  <ButtonPrimary loading>Show me more</ButtonPrimary>
                </div> */}
                                      </>
                                    )
                                      :
                                      <></>
              }
            </Tab.Panels>
          </Tab.Group>
        </main>

        {/* <SectionBecomeAnAuthor /> */}
      </div>
    </div>
  );
};

export default AuthorPage;
