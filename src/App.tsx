import React, { useState, useEffect } from "react";
import { useCookies, CookiesProvider } from "react-cookie";
import MyRouter from "routers/index";
import { io } from 'socket.io-client';
import { changeSystemTime } from "app/reducers/bid.reducers";
import { config } from "app/config";
import { useAppDispatch } from "app/hooks";

import "swiper/css";

export const socket = io(`${config.socketUrl}`);

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    socket.on("ServerTime", (data:any) => {
      // console.log("ServerTime ===> ", data)
      // dispatch(changeSystemTime(data));      
     })
  }, []);

  const [currentTheme, setCurrentTheme] = useState({
    backgroundColor: "#ffffffff",
    backgroundImage: "",
    blurMode: false,
    selectedUploadedImageIndex: -1,
    uploadedImages: [],
  });

  const [cookies, setCookie] = useCookies(["updateThemeFlag"]);

  useEffect(() => {
    const theme = JSON.parse(localStorage.getItem("website-theme"));
    console.log("MyApp useEffect log - 1 : ", theme);
    //      setCookie("updateThemeFlag", theme);
    if (theme && theme !== currentTheme) {
      setCurrentTheme(theme);
    }
  }, []);

  useEffect(() => {
    console.log("Cookies", cookies);
    if (cookies.updateThemeFlag != undefined) {
      const theme = JSON.parse(localStorage.getItem("website-theme"));
      console.log("MyApp useEffect log - 1 : ", theme);
      //      setCookie("updateThemeFlag", theme);
      if (theme && theme !== currentTheme) {
        setCurrentTheme(theme);
      }
    }
  }, [cookies]);
  return (
    <div className="bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
      <MyRouter />
    </div>
  );
}

export default App;
