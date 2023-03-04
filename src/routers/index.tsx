import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Page } from "./types";
import ScrollToTop from "./ScrollToTop";
import Footer from "shared/Footer/Footer";
import Page404 from "containers/Page404/Page404";
import AuthorPage from "containers/AuthorPage/AuthorPage";
import AccountPage from "containers/AccountPage/AccountPage";
import PageContact from "containers/PageContact/PageContact";
import PageAbout from "containers/PageAbout/PageAbout";
import PageSignUp from "containers/PageSignUp/PageSignUp";
import PageLogin from "containers/PageLogin/PageLogin";
import PageSubcription from "containers/PageSubcription/PageSubcription";
import BlogPage from "containers/BlogPage/BlogPage";
import BlogSingle from "containers/BlogPage/BlogSingle";
import SiteHeader from "containers/SiteHeader";
import NftDetailPage from "containers/NftDetailPage/NftDetailPage";
import PageCollection from "containers/PageCollection";
import PageSearch from "containers/PageSearch";
import PageUploadItem from "containers/PageUploadItem";
import PageConnectWallet from "containers/PageConnectWallet";
import PageHome3 from "containers/PageHome/PageHome3";
import PageMessage from "containers/PageMessage/PageMessage";
import Airdrop from "containers/Airdrop";
import Admin from "containers/Admin";
import CollectionList from "containers/Collections/collectionList";
import CreateCollection from "containers/Collections/createCollection";
import ItemsOfCollection from "containers/Collections/ItemsOfCollection";
import CollectionsOfCategory from "containers/Collections/collectionsOfCategory";
import { SigningCosmWasmProvider } from "../app/cosmwasm.js";

export const pages: Page[] = [
  { path: "/", component: PageHome3 },
  { path: "/#", component: PageHome3 },
  { path: "/nft-detail/:tokenId", component: NftDetailPage },
  { path: "/page-collection", component: PageCollection },
  { path: "/page-search", component: PageSearch },
  { path: "/page-author/:userId/:viewMode", component: AuthorPage },
  { path: "/account", component: AccountPage },
  { path: "/page-upload-item", component: PageUploadItem },
  { path: "/connect-wallet", component: PageConnectWallet },
  { path: "/blog", component: BlogPage },
  { path: "/blog-single", component: BlogSingle },
  { path: "/contact", component: PageContact },
  { path: "/about", component: PageAbout },
  { path: "/signup", component: PageSignUp },
  { path: "/login", component: PageLogin },
  { path: "/subscription", component: PageSubcription },
  { path: "/message/:userId", component: PageMessage },
  { path: "/message", component: PageMessage },
  { path: "/airdrop", component: Airdrop },
  { path: "/admin", component: Admin },
  { path: "/collectionList", component: CollectionList },
  { path: "/collectionsOfCategory/:category", component: CollectionsOfCategory },
  { path: "/collectionItems/:collectionId", component: ItemsOfCollection },
  { path: "/createCollection", component: CreateCollection },
];

const MyRoutes = () => {
  return (
    <BrowserRouter
      basename={process.env.NODE_ENV === "production" ? "" : ""}
    >      
      <SigningCosmWasmProvider>
      <ScrollToTop />
      <SiteHeader />
      <Routes>
        {pages.map(({ component, path }) => {
          const Component = component;
          return <Route key={path} element={<Component />} path={path} />;
        })}
        <Route element={<Page404 />} />
      </Routes>
      <Footer />
      </SigningCosmWasmProvider>
    </BrowserRouter>
  );
};

export default MyRoutes;
