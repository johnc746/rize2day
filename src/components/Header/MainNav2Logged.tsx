import React, { FC, useEffect, useState } from "react";
import Logo from "shared/Logo/Logo";
import MenuBar from "shared/MenuBar/MenuBar";
import SwitchDarkMode from "shared/SwitchDarkMode/SwitchDarkMode";
import SettingMode from "shared/SettingMode/SettingMode";
import MusicSetting from "shared/MusicSetting/MusicSetting";
import Message from "shared/Message/Message";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import Input from "shared/Input/Input";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Navigation from "shared/Navigation/Navigation";
import { useSigningClient } from "app/cosmwasm";
import Nav from "shared/Nav/Nav";
import NavItem from "shared/NavItem/NavItem";
import axios from "axios";
import { toast } from 'react-toastify';
import jwt_decode from "jwt-decode";
import md5 from "md5";
import { config } from "app/config.js"
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeChainId,
  changeWalletAddress,
  changeGlobalProvider,
  selectCurrentWallet,
  selectCurrentChainId,
  changeWalletStatus,
  changeAuthor
} from 'app/reducers/auth.reducers';
import { selectCurrentUser, selectWalletStatus } from "app/reducers/auth.reducers";
import { isEmpty } from "app/methods";

var socket = io(`${config.socketUrl}`);

export interface MainNav2LoggedProps { }

const MainNav2Logged: FC<MainNav2LoggedProps> = () => {

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { client, signingClient, loadClient, connectWallet, disconnect, walletAddress, getConfig }: any = useSigningClient();
  const globalAddress = useAppSelector(selectCurrentWallet);
  const globalChainId = useAppSelector(selectCurrentChainId);
  const [isOpen, setIsOpen] = useState(true);
  const [tabActive, setTabActive] = useState(0);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const user = useAppSelector(selectCurrentUser);
  const walletStatus = useAppSelector(selectWalletStatus);

  useEffect(() => {
    console.log("walletAddress  ===> ", walletAddress);
    if (isEmpty(walletAddress) == false) {
      dispatch(changeWalletStatus(true));
      localStorage.setItem('address', walletAddress);
      const params = { address: "", password: "" };
      params.address = walletAddress;
      params.password = md5(walletAddress);
      Login(params);
    } else {
      dispatch(changeWalletStatus(false));
    }
  }, [walletAddress]);


  const Login = (params: any) => {
    axios({
      method: "post",
      url: `${config.baseUrl}users/login`,
      data: params
    })
      .then(function (response) {
        console.log(" Login() response.data ==> ", response.data);
        if (response.data.code === 0) {
          //set the token to sessionStroage   
          const token = response.data.token;
          localStorage.setItem("jwtToken", response.data.token);
          const decoded = jwt_decode(token);
          console.log(" Login() decoded ==> ", decoded);
          dispatch(changeWalletAddress(params.address));
          dispatch(changeAuthor((decoded as any)._doc));
          navigate("/");
        }
        else {
          dispatch(changeWalletAddress(""));
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  useEffect(() => {
    setTimeout(() => {
      if (!client) {
        loadClient();
        setCount1(count1 + 1);
      }
    }, 500);
  }, [count1, client, loadClient])

  useEffect(() => {
    setTimeout(() => {
      if (!signingClient) {
        connectWallet();

        setCount2(count2 + 1);
      }
    }, 500);
  }, [count2, signingClient, connectWallet])

  // const loadWeb3 = async () => {
  // const timer1 = setInterval(() => {
  //   if (!client) {
  //     console.log(">>>> LoadClient 1")
  //     loadClient()
  //   } else {
  //     clearInterval(timer1);
  //     console.log(">>>> LoadClient 2")
  //   }
  // }, 500);

  // let account = localStorage.getItem('address');
  // if (account) {
  //   const timer2 = setInterval(() => {
  //     if (!signingClient) {
  //       console.log(">>>> Connect Wallet 1")
  //       connectWallet()
  //     } else {
  //       clearInterval(timer2)
  //       console.log(">>>> Clear Wallet 2")
  //     }
  //   }, 500)
  // }
  // }

  const authenticate = async () => {
    await connectWallet();
  }

  const unauthenticate = async () => {
    localStorage.removeItem("address");
    await disconnect();
    dispatch({ type: "LOGIN_OUT" });
    dispatch(changeWalletAddress(""));
    dispatch(changeAuthor({}));
  }

  useEffect(() => {
    (async () => {
      if (client) {
        const res = await getConfig();
        console.log(">>>> Config >>>", res)
      }
    })();
  }, [client])

  return (
    <div className={`nc-MainNav2Logged relative z-10 ${"onTop "}`}>
      <div className="px-10 py-5 relative flex justify-between items-center space-x-4 xl:space-x-8">
        <div className="flex justify-start flex-grow items-center space-x-3 sm:space-x-8 lg:space-x-10">
          <Logo />
          <ul
            className="sm:space-x-2 relative flex w-full overflow-x-auto text-md md:text-base hiddenScrollba cursor-pointer
            "
          >
            <li
              className={tabActive === 0 ? "text-green-400 px-5 py-2 font-medium text-[18px]" : "text-green-400 px-5 py-2 hover:text-green-300"}
              onClick={() => { setTabActive(0); navigate("/"); }}
            >
              <span>Home</span>
            </li>
            <li
              className={tabActive === 1 ? "text-green-400 px-5 py-2 font-medium text-[18px]" : "text-green-400 px-5 py-2 hover:text-green-300"}
              onClick={() => { setTabActive(1); navigate("/page-search"); }}
            >
              <span>Marketplace</span>
            </li>
            <li
              className={tabActive === 1 ? "text-green-400 px-5 py-2 font-medium text-[18px]" : "text-green-400 px-5 py-2 hover:text-green-300"}
              onClick={() => { setTabActive(1); navigate("/blog"); }}
            >
              <span>Blog</span>
            </li>
          </ul>
        </div>
        <div className="flex-shrink-0 flex items-center justify-end text-neutral-700 dark:text-neutral-100 space-x-1">
          <div className="hidden items-center xl:flex space-x-2">
            {/* <Navigation /> */}
            <div></div>
            {
              (isEmpty(walletAddress) == false && walletStatus == true) ? (
                <ButtonPrimary
                  onClick={() => { navigate("/page-upload-item") }}
                  sizeClass="px-4 py-2 sm:px-5"
                >
                  Create
                </ButtonPrimary>
              ) : (
                <ButtonPrimary
                  onClick={() => { authenticate() }}
                  sizeClass="px-4 py-2 sm:px-5"
                >
                  Wallet connect
                </ButtonPrimary>
              )}
            <div className="hidden sm:block h-6 border-l border-neutral-300 dark:border-neutral-6000"></div>
            <div className="flex">
              <SwitchDarkMode />
              {/* <NotifyDropdown /> */}
              {!isEmpty(user) && (
                <Message />
              )}
            </div>
            <div><SettingMode /></div>
            <div><MusicSetting /></div>
            <AvatarDropdown />
          </div>
          <div className="flex items-center space-x-3 xl:hidden">
            {/* <NotifyDropdown /> */}
            {!isEmpty(user) && (
              <Message />
            )}
            <AvatarDropdown />
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav2Logged;
