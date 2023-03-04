import React, { useEffect, useState } from "react";
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { Box, Button, Chip, Divider, Drawer, Grid, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'; import { ArrowForward } from "@material-ui/icons";
import { AddPhotoAlternate, ArrowForwardIos, CheckBox, CheckBoxOutlineBlank, CheckBoxOutlineBlankOutlined, ColorizeSharp, RestartAlt } from "@mui/icons-material";
import { ChromePicker } from "react-color";
import { useCookies, CookiesProvider } from "react-cookie";
import rgbHex from "rgb-hex";
import hslHex from 'hsl-to-hex';
import Wallpaper from "../../data/wallpapers.json";
import {MySound} from "./MySound"
import MusicPanel from "./MusicPanel"

const DRAWER_STYLE = {
  width: "250px",
  height: "100vh",
  borderLeft: "1px solid gray",
  backgroundColor: '#13131d',
  color: '#6b7280',
  "& .MuiSvgIcon-root": {
    color: '#6b7280',
    width: "24px",
    height: "24px",
  },
  "& span": {
    fontSize: "16px",
  },
};




// export interface MusicSettingProps {
//   className?: string;
// }
// const MusicSetting: React.FC<MusicSettingProps> = ({ className = "" }) => {
const MusicSetting = () => {
  const [cookies, setCookie] = useCookies(["updateThemeFlag"]);

  const [viewSettingDrawer, setViewSettingDrawer] = useState(false);
  const [viewColorSetDrawer, setViewColorSetDrawer] = useState(false);

  const [newTheme, setNewTheme] = useState({
    backgroundColor: "#ffffffff",
    backgroundImage: "",
    blurMode: false,
    selectedUploadedImageIndex: -1,
    uploadedImages: [],
  });
  const [updateValue, setUpdateValue] = useState(false);

  const [colorPickerColor, setColorPickerColor] = useState("#ffffffff");
  const [blurMode, setBlurMode] = useState(false);
  const [uploadImageList, setImageList] = useState([]);

  const [newColor, setNewColor] = useState({
    hue: 0,
    saturation: 100,
    lightness: 50,
    alpha: 1,
  })

  const onChangeColor = (hue, saturation, lightness, alpha) => {
    setNewColor({
      hue: parseInt(hue === -1 ? newColor.hue : hue),
      saturation: parseInt(saturation === -1 ? newColor.saturation : saturation),
      lightness: parseInt(lightness === -1 ? newColor.lightness : lightness),
      alpha: parseFloat(alpha === -1 ? newColor.alpha : alpha),
    });

    console.log('onChangeColor log - 1: ',
      hslHex(
        parseInt(hue === -1 ? newColor.hue : hue),
        parseInt(saturation === -1 ? newColor.saturation : saturation),
        parseInt(lightness === -1 ? newColor.lightness : lightness),
      )
      +
      Math.floor(parseFloat(alpha === -1 ? newColor.alpha : alpha) * 255).toString(16)
    );

    setColorPickerColor(
      hslHex(
        parseInt(hue === -1 ? newColor.hue : hue),
        parseInt(saturation === -1 ? newColor.saturation : saturation),
        parseInt(lightness === -1 ? newColor.lightness : lightness),
      )
      +
      Math.floor(parseFloat(alpha === -1 ? newColor.alpha : alpha) * 255).toString(16)
    );
  }

  useEffect(() => {
    const theme = JSON.parse(localStorage.getItem("website-theme"));
    if (theme) {
      setColorPickerColor(theme.backgroundColor);
      setBlurMode(theme.blurMode);
      setNewTheme({
        backgroundColor: theme.backgroundColor,
        backgroundImage: theme.backgroundImage,
        blurMode: theme.blurMode,
        selectedUploadedImageIndex: theme.selectedUploadedImageIndex,
        uploadedImages: theme.uploadedImages,
      });
    }
  }, []);

  const upgradeTheme = async (
    backgroundColor_u,
    backgroundImage_u,
    blurMode_u,
    newUploadImage_u,
    selectUploadImageIndex_u,
  ) => {
    try {
      let tempUploadedImages = newTheme.uploadedImages;
      let newSelectIndex = selectUploadImageIndex_u;
      if (newUploadImage_u !== '') {
        tempUploadedImages.push(newUploadImage_u);
        newSelectIndex = tempUploadedImages.length - 1;
      }

      const tempTheme = {
        backgroundColor: backgroundColor_u,
        backgroundImage: backgroundImage_u,
        blurMode: blurMode_u,
        selectedUploadedImageIndex: newSelectIndex,
        uploadedImages: tempUploadedImages,
      };

      localStorage.setItem("website-theme", JSON.stringify(tempTheme));
      setCookie(
        "updateThemeFlag",
        cookies.updateThemeFlag == "false" ? "true" : "false"
      );
      setNewTheme(tempTheme);
      setUpdateValue(!updateValue);
    } catch (e) {
      console.log(">>>>>>>>>>>>Exception", e);
    }
  };

  const handleUploadClick = (event) => {
    try {
      var file = event.target.files[0];
      const reader = new FileReader();
      var url = reader.readAsDataURL(file);

      reader.onloadend = function (e) {
        var image = new Image();
        //Set the Base64 string return from FileReader as source.
        image.src = e.target.result.toString();

        //Validate the File Height and Width.
        // image.onload = function () {
        //   // var height = this.height;
        //   // var width = this.width;
        //   // // if (height > 100 || width > 100)
        //   // console.log(height, width);
        // };

        let tempImageList = [...uploadImageList];
        if (!tempImageList.find((item) => item == image.src))
          tempImageList.push(image.src);
        setImageList(tempImageList);

        upgradeTheme(
          newTheme.backgroundColor,
          '',
          newTheme.blurMode,
          image.src,
          0,
        );
        //console.log(">>>>>>>>>image", image.src, e.target);
      };
    } catch (e) {
      console.log(">>>>>>>>>>>>>Exception", e);
    }
  };

  return (
    <Box>
      <IconButton
        onClick={() => setViewSettingDrawer(true)}
        sx={{
          color: '#6b7280',
          width: '48px',
          height: '48px',
        }}
      >
        <QueueMusicIcon sx={{
          width: '28px',
          height: '28px',
        }} />
      </IconButton>
      <Drawer
        anchor="right"
        open={viewSettingDrawer}
        onClose={() => setViewSettingDrawer(false)}
      ><Box>
          {/* <MySound status={SoundStatus.PLAYING}/> */}
          <MusicPanel/>
        </Box>
      </Drawer>

    </Box >
  );
};

export default MusicSetting;
