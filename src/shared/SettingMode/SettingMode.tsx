import React, { useEffect, useState } from "react";
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import { Box, Button, Chip, Divider, Drawer, Grid, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'; import { ArrowForward } from "@material-ui/icons";
import { AddPhotoAlternate, ArrowForwardIos, CheckBox, CheckBoxOutlineBlank, CheckBoxOutlineBlankOutlined, ColorizeSharp, RestartAlt } from "@mui/icons-material";
import { ChromePicker } from "react-color";
import { useCookies, CookiesProvider } from "react-cookie";
import rgbHex from "rgb-hex";
import hslHex from 'hsl-to-hex';
import Wallpaper from "../../data/wallpapers.json";



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




// export interface SettingModeProps {
//   className?: string;
// }
// const SettingMode: React.FC<SettingModeProps> = ({ className = "" }) => {
const SettingMode = () => {
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
        <DisplaySettingsIcon sx={{
          width: '28px',
          height: '28px',
        }} />
      </IconButton>
      <Drawer
        anchor="right"
        open={viewSettingDrawer}
        onClose={() => setViewSettingDrawer(false)}
      >
        <Box sx={DRAWER_STYLE}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setViewSettingDrawer(false)}
            >
              <ListItemText
                primary={"Theme Setting"}
                sx={{
                  textTransform: "uppercase",
                  "& span": {
                    fontSize: "18px",
                    fontWeight: "700",
                  },
                }}
              />
              <ListItemIcon
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "right",
                }}
              >
                <ArrowForward />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
          <Divider sx={{
            borderColor: 'gray',
          }} />
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <AddPhotoAlternate />
              </ListItemIcon>
              <ListItemText primary={"Upload image"} />
              <input
                accept="image/*"
                // className={classes.input}
                style={{
                  opacity: 0,
                  position: "absolute",
                  width: "90%",
                }}
                id="contained-button-file"
                // multiple
                type="file"
                onChange={handleUploadClick}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setViewColorSetDrawer(true)}
            >
              <ListItemIcon>
                <ColorizeSharp />
              </ListItemIcon>
              <ListItemText primary={"Set a color"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => upgradeTheme("#ffffffff", "", false, '', -1)}
            >
              <ListItemIcon>
                <RestartAlt />
              </ListItemIcon>
              <ListItemText primary={"Reset to default"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                upgradeTheme(
                  newTheme.backgroundColor,
                  newTheme.backgroundImage,
                  !newTheme.blurMode,
                  '',
                  -1
                )
              }
            >
              <ListItemIcon>
                {newTheme.blurMode ? (
                  <CheckBox />
                ) : (
                  <CheckBoxOutlineBlankOutlined />
                )}
              </ListItemIcon>
              <ListItemText primary={"Blurred"} />
            </ListItemButton>
          </ListItem>
          <ListItem>
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: '28px',
            }}>

              <Divider sx={{
                width: '100%',
                position: 'absolute',
                top: '12px',
                borderColor: 'gray',
              }} />
              <Box sx={{
                position: 'absolute',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <Chip label="Default background"
                  sx={{
                    height: '28px',
                    color: 'white',
                    backgroundColor: '#13131d',
                    '& .MuiChip-label': {
                      fontSize: '11px',
                    }

                  }} />
              </Box>
            </Box>
          </ListItem>
          <Grid
            container
            spacing={1}
            sx={{
              padding: "10px",
            }}
          >
            {Wallpaper?.length > 0 &&
              Wallpaper.map((item) => (
                <Grid item xs={4}>
                  <Button
                    onClick={() =>
                      upgradeTheme(
                        "#ffffffff",
                        item.imageUrl,
                        newTheme.blurMode,
                        '',
                        -1,
                      )
                    }
                    sx={{
                      padding: "0",
                      margin: "0",
                    }}
                  >
                    <img
                      alt=""
                      src={item.thumbnail}
                      style={{
                        border: item.imageUrl === newTheme.backgroundImage ?
                          "3px solid white" : "1px solid gray",
                      }}
                    />
                  </Button>
                </Grid>
              ))}
          </Grid>
          <ListItem>
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: '28px',
            }}>
              <Divider sx={{
                width: '100%',
                position: 'absolute',
                top: '12px',
                borderColor: 'gray'
              }} />
              <Box sx={{
                position: 'absolute',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <Chip label="Uploaded background"
                  sx={{
                    height: '28px',
                    color: 'white',
                    backgroundColor: '#13131d',
                    '& .MuiChip-label': {
                      fontSize: '11px',
                    }

                  }} />
              </Box>
            </Box>
          </ListItem>
          <Grid
            container
            spacing={1}
            sx={{
              padding: "10px",
            }}
          >
            {newTheme.uploadedImages.length > 0 &&
              newTheme.uploadedImages.map((item, index) => (
                <Grid item xs={4}>
                  <Button
                    onClick={() =>
                      upgradeTheme(
                        "#ffffffff",
                        '',
                        newTheme.blurMode,
                        '',
                        index,
                      )
                    }
                    sx={{
                      padding: "0",
                      margin: "0",
                    }}
                  >
                    <img
                      alt=""
                      src={item}
                      style={{
                        border: index === newTheme.selectedUploadedImageIndex ? "3px solid white" : "1px solid gray",
                        width: "70px",
                        height: "70px",
                      }}
                    />
                  </Button>
                </Grid>
              ))}
          </Grid>
        </Box>
      </Drawer>
      <Drawer
        anchor="right"
        open={viewColorSetDrawer}
        onClose={() => setViewColorSetDrawer(false)}
      >
        <Box sx={DRAWER_STYLE}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setViewColorSetDrawer(false)}
            >
              <ListItemText
                primary={"Set a color"}
                sx={{
                  "& span": {
                    fontSize: "18px",
                    fontWeight: "700",
                  },
                }}
              />
              <ListItemIcon
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "right",
                }}
              >
                <ArrowForward />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
          <Divider sx={{
            borderColor: 'gray',
          }} />
          <ListItem>
            <Box className="slider-group"
              sx={{
                width: '100%',
                '& .slider-container': {
                  height: '40px',
                  width: '100%',
                  padding: '10px 0',
                  marginTop: '15px',
                  '& input[type=range]': {
                    width: '100%',
                    '-webkit-appearance': 'none',
                    height: '16px',
                    borderRadius: '8px',
                    border: '1px solid lightgrey',
                    '&:focus': {
                      outline: 'none'
                    },
                  },
                  '& input[type=range]::-webkit-slider-thumb': {
                    boxShadow: '0 1px 1px 1px rgba(0,0,0,.2)',
                    border: '1px solid lightgrey',
                    height: '20px',
                    width: '20px',
                    borderRadius: '50px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    '-webkit-appearance': 'none',
                    marginTop: '0px',
                  },
                  '& input[type=number]': {
                    position: 'absolute',
                    margin: '-5px 0',
                    padding: '0',
                    right: '20px',
                    width: '60px',
                    height: '26px',
                    textAlign: 'center',
                    '&:focus': {
                      outline: 'none'
                    },
                  },
                  '& label': {
                    width: '10%',
                    height: '24px',
                    lineHeight: '12px',
                    textAlign: 'center',
                    textTransform: 'capitalize',
                    '&:first-letter': {
                      // fontWeight: 'bold',
                    },
                  },
                  '& input[type=range], label': {
                    float: 'left',
                  },
                }
              }}>
              <Box className="slider-container">
                <label>hue</label>
                <input type="number" id="number-h" min="0" max="360" step="1"
                  value={newColor.hue}
                  onChange={e => onChangeColor(e.target.value, -1, -1, -1)} />
                <input type="range" id="slider-h" min="0" max="360" step="1"
                  style={{
                    background: '-webkit-linear-gradient(left, rgb(255, 0, 0), rgb(255, 85, 0), rgb(255, 170, 0), rgb(255, 255, 0), rgb(170, 255, 0), rgb(85, 255, 0), rgb(0, 255, 0), rgb(0, 255, 85), rgb(0, 255, 170), rgb(0, 255, 255), rgb(0, 170, 255), rgb(0, 85, 255), rgb(0, 0, 255), rgb(85, 0, 255), rgb(170, 0, 255), rgb(255, 0, 255), rgb(255, 0, 170), rgb(255, 0, 85), rgb(255, 0, 0))',
                  }}
                  value={newColor.hue}
                  onChange={e => onChangeColor(e.target.value, -1, -1, -1)} />
              </Box>
              <Box className="slider-container">
                <label>saturation</label>
                <input type="number" id="number-s" min="0" max="100" step="1"
                  value={newColor.saturation}
                  onChange={e => onChangeColor(-1, e.target.value, -1, -1)} />
                <input type="range" id="slider-s" min="0" max="100" step="1"
                  style={{
                    background: `-webkit-linear-gradient(left, rgb(128, 128, 128), hsl(${newColor.hue}, 100%, 50%))`,
                  }}
                  value={newColor.saturation}
                  onChange={e => onChangeColor(-1, e.target.value, -1, -1)} />
              </Box>
              <Box className="slider-container">
                <label>lightness</label>
                <input type="number" id="number-l" min="0" max="100" step="1"
                  value={newColor.lightness}
                  onChange={e => onChangeColor(-1, -1, e.target.value, -1)} />
                <input type="range" id="slider-l" min="0" max="100" step="1"
                  style={{
                    background: `-webkit-linear-gradient(left, rgb(0, 0, 0), hsl(${newColor.hue}, 100%, 50%), rgb(255, 255, 255))`,
                  }}
                  value={newColor.lightness}
                  onChange={e => onChangeColor(-1, -1, e.target.value, -1)} />
              </Box>
              <Box className="slider-container">
                <label>alpha</label>
                <input type="number" id="number-a" min="0" max="1" step="0.05"
                  value={newColor.alpha}
                  onChange={e => onChangeColor(-1, -1, -1, e.target.value)} />
                <input type="range" id="slider-a" min="0" max="1" step="0.05"
                  style={{
                    background: `-webkit-linear-gradient(left, hsla(${newColor.hue}, 100%, 50%, 0), hsl(${newColor.hue}, 100%, 50%))`,
                  }}
                  value={newColor.alpha}
                  onChange={e => onChangeColor(-1, -1, -1, e.target.value)} />
              </Box>
            </Box>
            {/* <ChromePicker
              color={colorPickerColor}
              onChangeComplete={(c) =>
                setColorPickerColor(
                  "#" +
                  rgbHex(
                    c.rgb.r,
                    c.rgb.g,
                    c.rgb.b,
                    c.rgb.a
                  )
                )
              }
            /> */}
          </ListItem>
          <ListItem>
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: '50px',
              border: '1px solid gray',
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'url(./images/bg/bg-transparent.jpg)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: colorPickerColor,
                }}
              />
            </Box>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() =>
                upgradeTheme(colorPickerColor, "", false, '', -1)
              }
              sx={{
                border: "1px solid white",
              }}
            >
              <ListItemText
                primary={"Use this color"}
                sx={{
                  textAlign: "center",
                }}
              />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer >
    </Box >
  );
};

export default SettingMode;
