import React, { useEffect, useState } from "react";
import cn from "classnames";
import Icon from "../../components/Icon";
import styles from "./Profile.module.sass";
import Card from "../../components/Card";
import Slider from "react-slick";
import { config } from "app/config.js";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { isEmpty } from "app/methods";
import { useAppDispatch, useAppSelector } from "app/hooks";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import { changeDetailedCollection, selectDetailedCollection } from "app/reducers/collection.reducers";
import CardNFT from "components/CardNFT";
import CardNFTMusic from "components/CardNFTMusic";
import CardNFTVideo from "components/CardNFTVideo";
import styled from "@emotion/styled";
import { selectCurrentChainId, selectCurrentUser } from "app/reducers/auth.reducers";
import { Helmet } from "react-helmet";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const ItemsOfCollection = () => {
  const collection = useAppSelector(selectDetailedCollection);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUsr = useAppSelector(selectCurrentUser);
  const currentChainId = useAppSelector(selectCurrentChainId);

  const [items, setItems] = useState([]);
  const [start, setStart] = useState(0);
  const [last, setLast] = useState(8);
  // const collectionId = useSelector(state => state.collection.consideringId);
  const { collectionId } = useParams();
  const [viewNoMore, setViewNoMore] = useState(false);

  console.log("collectionId = ", collectionId);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: (
      <SlickArrow>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 100000,
        settings: "unslick",
      },
    ],
  };

  useEffect(() => {
    console.log("[useEffect] collectionId = ", collectionId);
    axios.post(`${config.API_URL}api/collection/detail`, { id: collectionId }, {
      headers:
      {
        "x-access-token": localStorage.getItem("jwtToken")
      }
    }).then((result) => {
      dispatch(changeDetailedCollection(result.data.data));
    }).catch(() => {

    });

  }, [collectionId]);

  useEffect(() => {
    setStart(0);
    setLast(8);
    itemsOfCollectionList();
  }, [])

  const onLoadMore = () => {
    itemsOfCollectionList();
  }

  useEffect(() => {
    setItems(items)
  }, [last, start])

  const isVideoItem = (item) => {
    return item?.musicURL?.toLowerCase().includes("mp4") ? true : false;
  }

  const itemsOfCollectionList = () => {
    var params = { start: start, last: last, date: 0, colId: collectionId };

    console.log("start:", start, "last:", last);

    axios.post(`${config.API_URL}api/item/get_items_of_collection`, params).then((result) => {
      console.log("result.data.data = ", result.data.data);
      if (isEmpty(result.data.data)) {
        setViewNoMore(true);
        setTimeout(() => {
          setViewNoMore(false)
        }, 2500);
      }
      if (start === 0) {
        setItems(result.data.data);
      } else {
        let curItems = items;
        let moreItems = [], i;
        moreItems = result.data.data;
        if (moreItems.length > 0)
          for (i = 0; i < moreItems.length; i++) curItems.push(moreItems[i]);
        setItems(curItems);
      }
      setStart(last);
      setLast(last + 8);
    }).catch(() => {

    });
  }

  return (
    <>
      <Helmet>
        <title>Detailt Collection || Rize2Day </title>
      </Helmet>
      <div
        style={{
          width: "100%",
          marginLeft: "0",
          marginBottom: "2rem"
        }}
      >
        <div style={{
          width: "100%",
          position: "relative",
          height: "300px"
        }}>
          {collection && collection.bannerURL !== "" && <img style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
            id="BannerImg" src={`${config.API_URL}uploads/${collection.bannerURL}`} alt="Banner" />}
          <div className={styles.logoImg} style={{
            border: "2px solid rgb(204, 204, 204)",
            borderRadius: "50%",
            width: "10rem",
            height: "10rem",
            position: "absolute",
            left: "50%",
            top: "100%",
            marginLeft: "-5rem",
            marginTop: "-5rem"
          }}>
            <div className={styles.logoImg} >
              {collection && collection.logoURL !== "" &&
                <img id="avatarImg" src={`${config.API_URL}uploads/${collection.logoURL}`} alt="Avatar" />}
            </div>
          </div>
        </div>
      </div>
      <div className="container" >
        <div className={styles.collectionName} style={{ marginTop: "6rem", textAlign: "center" }}>{collection && collection.name}</div>
        <div className={styles.createdBy} style={{ marginTop: "1rem", textAlign: "center" }}>
          {
            collection && collection.owner &&
            <>
              <span>Created by </span>
              <span onClick={() => navigate(`/profile/${collection.owner._id}`)}>{`${collection.owner.username}`}</span>
            </>
          }
        </div>
        <div className={styles.collectionFloorPrice} style={{ textAlign: "center" }} >
          {/* {(collection && collection.price) ? 
                 "floor price : "+collection.price + (chains[currentChainId || 1]?.currency || "RIZE") :
                 "floor price : 0 " + (chains[currentChainId || 1]?.currency || "RIZE")
                } */}
        </div>
        <div className={styles.collectionDescription} style={{ textAlign: "center" }} >
          {collection && collection.description}
        </div>
        <div className="flex justify-end py-2">
          {
            currentUsr && currentUsr?._id === collection?.owner?._id &&
            <ButtonPrimary onClick={() => { navigate("/page-upload-item"); }} >
              Create
            </ButtonPrimary>
          }
        </div>
        {
          (items !== undefined && items !== null && items.length > 0) ?
            <div align="center">
              <div id="sliderWrapper" className={styles.list}>
                <Slider
                  className={cn("discover-slider", styles.slider)}
                  {...settings}
                >
                  {
                    (items && items.length > 0) &&
                      items ? items.map((x, index) => (
                        isVideoItem(x) === true ?
                          <CardNFTVideo className={""} item={x} key={index} />
                          :
                          <CardNFT className={"w-[300px]"} item={x} key={index} />
                      )) : <></>}
                </Slider>
              </div>
              <span style={{ marginTop: "2rem" }} >&nbsp;{viewNoMore === true && "No more items"}&nbsp;</span>
              <div className={styles.btns} align="center" style={{
                marginTop: "1rem",
                marginBottom: "5rem"
              }}>
                <button className={cn("button-stroke button-small", styles.btns)} onClick={() => { onLoadMore() }}>
                  <span>Load more</span>
                </button>
              </div>
            </div>
            :
            <h3 className="px-3 py-2">No items</h3>
        }
      </div>
    </>
  );
}

export default ItemsOfCollection;