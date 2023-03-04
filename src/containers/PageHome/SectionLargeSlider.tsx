import CardLarge1 from "components/CardLarge1/CardLarge1";
import { config } from "app/config";
import { nftsLargeImgs } from "contains/fakeData";
import { FC, useState, useEffect } from "react";
import { io } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from "app/hooks";
import { changeBannerItemsOnAuction, selectBannerItemsOnAuction, selectDetailOfAnItem, selectCOREPrice } from "app/reducers/nft.reducers";
import { selectCurrentChainId, selectCurrentUser, selectCurrentWallet, selectGlobalProvider, selectWalletStatus } from "app/reducers/auth.reducers";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isEmpty } from "app/methods";
import axios from "axios";

var socket = io(`${config.socketUrl}`);

export interface SectionLargeSliderProps {
  className?: string;
}

const SectionLargeSlider: FC<SectionLargeSliderProps> = ({
  className = "",
}) => {
  const [indexActive, setIndexActive] = useState(0);
  const dispatch = useAppDispatch();  
  const globalBannerItemsOnAuction = useAppSelector(selectBannerItemsOnAuction);
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    getPopularItems();
  }, []);

  const getPopularItems = () => {
    axios.post(
      `${config.API_URL}api/item/getPopularItems`,
      {
        limit: 10
      }
    ).then((response) => {
      console.log("getPopularItems() response.data.data ===> ", response.data.data);
      setItems(response.data.data || []);
    })
    .catch((error) => {
      console.log("getPopularItems() error ===> ", error);
    })
  }

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= 2 ) {
        return 0;
      }
      return state + 1;
    });
  };

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return 2;
      }
      return state - 1;
    });
  };
 
  const getNftBannerList = async (limit: number) => {
    await axios.post(`${config.API_URL}api/item/get_banner_list`, { limit: limit }, {
        headers:
        {
            "x-access-token": localStorage.getItem("jwtToken")
        }
    }).then((result) => {        
        dispatch(changeBannerItemsOnAuction(result.data.data || []));
    }).catch(() => {

    });
  }

  useEffect(() => {
    socket.on("UpdateStatus", data => {
      getNftBannerList(100);
    });    
    getNftBannerList(100);
  }, []);
 
  return (
      <div className={`nc-SectionLargeSlider relative ${className}`}>
      {
        (items && items.length>0) && 
        items.map((item, index) =>
          indexActive === index ? (
            <CardLarge1
              item={item}
              key={index}
              isShowing
              featuredImgUrl={nftsLargeImgs[index]}
              onClickNext={handleClickNext}
              onClickPrev={handleClickPrev}
            />
          ) : null
        )
      }
      </div>
  );
};

export default SectionLargeSlider;
