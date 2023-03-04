import React from "react";
import SectionHowItWork from "components/SectionHowItWork/SectionHowItWork";
import BackgroundSection from "components/BackgroundSection/BackgroundSection";
import SectionGridAuthorBox from "components/SectionGridAuthorBox/SectionGridAuthorBox";
import SectionBecomeAnAuthor from "components/SectionBecomeAnAuthor/SectionBecomeAnAuthor";
import SectionSliderCollections2 from "components/SectionSliderCollections2";
import SectionSliderCategories from "components/SectionSliderCategories/SectionSliderCategories";
import SectionLargeSlider from "./SectionLargeSlider";
import { Helmet } from "react-helmet";

function PageHome3() {
  return (
    <>
      <Helmet>
        <title>Home || Rize2Day </title>
      </Helmet>


      <div className="nc-PageHome3 relative overflow-hidden">
        <div className="container relative space-y-24 mb-24 lg:space-y-32 lg:mb-32">

          <div className="relative py-10 lg:py-12">
            <BackgroundSection />
            <SectionBecomeAnAuthor />
            <SectionHowItWork />
          </div>

          <SectionLargeSlider />

          <div className="relative py-10 lg:py-12">
            <BackgroundSection />
            <SectionSliderCollections2 />
          </div>

          <SectionGridAuthorBox
            sectionStyle="style2"
            data={Array.from("11111111")}
            boxCard="box4"
          />

          <div className="relative py-10 lg:py-12">
            <BackgroundSection />
            <SectionSliderCategories />
          </div>


        </div>
      </div>
    </>
  );
}

export default PageHome3;
