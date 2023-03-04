import React, { FC, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import BackgroundSection from "components/BackgroundSection/BackgroundSection";
import Pagination from "shared/Pagination/Pagination";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import SectionSliderCollections from "components/SectionSliderCollections";
import SectionBecomeAnAuthor from "components/SectionBecomeAnAuthor/SectionBecomeAnAuthor";
import HeaderFilterSearchPage from "components/HeaderFilterSearchPage";
import Input from "shared/Input/Input";
import ButtonCircle from "shared/Button/ButtonCircle";
import CardNFT from "components/CardNFT";
import SectionSliderCategories from "components/SectionSliderCategories/SectionSliderCategories";
import axios from "axios";
import { config } from "app/config";
import { isEmpty } from "app/methods";


const navLinks = [
  { value: 0, text: "All items" },
  { value: 1, text: "Art" },
  { value: 2, text: "Game" },
  { value: 3, text: "Sports" },
  { value: 4, text: "Photography" }
];
const dateOptions = [
  { value: 0, text: "Newest" },
  { value: 1, text: "Oldest" },
  { value: 2, text: "Price: Low to High" },
  { value: 3, text: "Price: High to Low" },
  { value: 4, text: "Most Like" },
  { value: 5, text: "Least Like" }
];
const priceOptions = [{ value: 0, text: "Highest price" }, { value: 1, text: "The lowest price" }];
const likesOptions = [{ value: 0, text: "Most liked" }, { value: 1, text: "Least liked" }];
const creatorOptions = [{ value: 0, text: "All" }, { value: 1, text: "Verified only" }];
const statusOptions = [{ value: 0, text: "All" }, { value: 1, text: "On Sale" }, { value: 2, text: "On Auction" }];


export interface PageSearchProps {
  className?: string;
}

const PageSearch: FC<PageSearchProps> = ({ className = "" }) => {

  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");

  const [date, setDate] = useState(0);
  const [likes, setLikes] = useState(0);
  const [creator, setCreator] = useState(0);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState(0);
  const [range, setRange] = useState([0, 100000]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [reSearch, setResearch] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState({});
  const [metadatas, setMetaDatas] = useState([]);
  const [checked, setChecked] = React.useState([]);
  const [collections, setCollections] = useState([]);
  const [viewNoMore, setViewNoMore] = useState(false);

  useEffect(() => {    
    onResetFilter();
  }, [])

  useEffect(() => {
    getCollectionList(true);
  }, [date, activeIndex, price, likes, creator, range, reSearch, selectedCollection, checked, status, priceMin, priceMax])

  const onSearch = () => {
    setResearch(!reSearch);
  }

  useEffect(() => {
    if (selectedCollection) {
      axios.post(`${config.API_URL}api/collection/get_collection_metadatas`, { id: (selectedCollection as any)._id })
        .then((result) => {
          console.log("result:", result.data.data[0].metaData);
          if (result.data.data[0].metaData) {
            setMetaDatas(result.data.data[0].metaData);
          } else {
            setMetaDatas([]);
          }
        }).catch(() => {
        });
    } else {
      setMetaDatas([]);
    }

  }, [selectedCollection])

  const getCollectionList = (reStart) => {
    var param = {
      start: reStart ? 0 : collections.length,
      last: reStart ? 8 : collections.length + 8,
      date: dateOptions[date].value,
      category: navLinks[activeIndex].value,
      status: statusOptions[status].value
    };
    // if (visible) {
    (param as any).price = priceOptions[price].value;
    (param as any).likes = likesOptions[likes].value;
    (param as any).creator = creatorOptions[creator].value;
    // (param as any).range = range;

    (param as any).range = [range[0], range[1]];
    (param as any).search = search;
    (param as any).sortmode = dateOptions[date].value;
    // }
    // if (selectedCollection) {
    //   (param as any).collection_id = (selectedCollection as any)._id;
    //   (param as any).metadata = checked;
    // }

    console.log("param ===>  ", param);
    axios.post(`${config.API_URL}api/collection/onsearch`, param)
      .then((result) => {
        var list = [];
        for (var i = 0; i < result.data.list.length; i++) {
          var item = result.data.list[i].item_info;
          item.users = [{ avatar: result.data.list[i].creator_info.avatar }];
          list.push(item);
        }
        if(isEmpty(list))
        {
          setViewNoMore(true);
          setTimeout(() => {
            setViewNoMore(false)
          }, 2500);              
        }
        console.log("list ===> ", list);
        if (reStart) {
          setCollections(list);
        } else {
          setCollections((collections) => {
            return collections.concat(list);
          });
        }
      }).catch(() => {
      });
  }

  const onLoadMore = () => {
    console.log("onLoadMore() 00");
    getCollectionList(false);
  }


  const handleToggle = (object) => () => {
    const currentIndex = checked.indexOf(object);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(object);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const onResetFilter = () => {
    setDate(0);
    setLikes(0);
    setCreator(0);
    setStatus(0);
    setPrice(0);
    setSearch("");
    setRange([0, 100000]);
    setResearch(false);
    // setSelectedCollection({});
    setMetaDatas([]);
    setChecked([]);
    setPriceMax("");
    setPriceMin("");
    console.log("onResetFilter() 11");
  }

  const onChangeSearch = (event) => {
    setSearch(event.target.value);
    onSearch();
  }

  const handlePrice = (type, event) => {
    var pattern = /[^0-9.]/g;
    var result = event.target.value.match(pattern);
    if (!result && !isNaN(event.target.value)) {
      if (type == "min") {
        setPriceMin(event.target.value);
      } else if (type == "max") {
        setPriceMax(event.target.value);
      }
    }
  }

  return (
    <div className={`nc-PageSearch  ${className}`} data-nc-id="PageSearch">
      <Helmet>
        <title>Marketplace || Rize2Day </title>
      </Helmet>

      {/* <div
        className={`nc-HeadBackgroundCommon h-24 2xl:h-28 top-0 left-0 right-0 w-full bg-primary-50 dark:bg-neutral-800/20 `}
        data-nc-id="HeadBackgroundCommon"
      /> */}
      <div className="container-fluid">
        <header className="max-w-2xl mx-auto -mt-10 flex flex-col lg:-mt-7">
          <form className="relative w-full " method="post">
            <label
              htmlFor="search-input"
              className="text-neutral-500 dark:text-neutral-300"
            >
              <span className="sr-only">Search all icons</span>
              <Input
                className="shadow-lg border-0 dark:border"
                id="search-input"
                type="search"
                placeholder="Type your keywords"
                sizeClass="pl-14 py-5 pr-5 md:pl-16"
                rounded="rounded-full"
              />
              <ButtonCircle
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2"
                size=" w-11 h-11"
                type="submit"
              >
                <i className="las la-arrow-right text-xl"></i>
              </ButtonCircle>
              <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-2xl md:left-6">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 22L20 20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>
          </form>
        </header>
      </div>

      <div className="px-10 py-16 lg:pb-28 lg:pt-20 space-y-16 lg:space-y-28">
        <main>
          <HeaderFilterSearchPage onChangeActiveTab={setActiveIndex}
              onChangeDate={setDate}
              dateValue={date}
              onChangeLikes={setLikes}
              likesValue={likes}
              onChangeCreator={setCreator}
              creatorValue={creator}
              onChangePrice={setPrice}
              priceValue={price}
              onChangeStatus={setStatus}
              statusValue={status}
              onChangeRange={setRange}
              rangeValue={range}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-10 mt-8 lg:mt-10">
            {(collections && collections.length > 0) && collections.map((x, index) => (
              <CardNFT className={"w-[300px]"} item={x} key={index} />
            ))}
          </div>

          <div className=" text-center mt-10 m-10"  >
              <span >&nbsp;{viewNoMore === true && "No more items"}&nbsp;</span>
            </div>

          <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
            <ButtonPrimary
              onClick={() => { onLoadMore() }}
            >Show me more</ButtonPrimary>
          </div>
        </main>

      </div>
    </div>
  );
};

export default PageSearch;
