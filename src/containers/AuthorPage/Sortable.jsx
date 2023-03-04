import CardNFT from "components/CardNFT";
import CardNFTVideo from "components/CardNFTVideo";
import React, { useState, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";

const isVideoItem = (item) => {
  return item?.musicURL?.toLowerCase().includes("mp4") ? true : false;
};

const SortableItem = ({ item, effect }) => {
  return (
    <div className="grid-item">
      {isVideoItem(item) === true ? (
        <CardNFTVideo item={item} hideHeart={true} effect={effect} />
      ) : (
        <CardNFT item={item} hideHeart={true} effect={effect} />
      )}
    </div>
  );
};
const SortableList = ({ view, items, setItems, effect }) => {
  useEffect(() => {
    document.querySelector(".grid-container")?.style.setProperty("--grid-column-count", parseInt(view));
  }, [view]);

  return (
    <ReactSortable
      className="grid-container grid mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 lg:mt-10 select-none"
      list={items}
      setList={setItems}
      delayOnTouchOnly={true}
      animation={200}
      delay={2}
    >
      {items.map((item) => (
        <SortableItem key={item.id} item={item} effect={effect} />
      ))}
    </ReactSortable>
  );
};

const SortableExplorer = ({ view, effect, data }) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (data.length > 0) {
      setItems(data)
    }
  }, [data]);

  return <SortableList effect={effect} view={view} items={items} setItems={setItems} />;
};

export default SortableExplorer;
