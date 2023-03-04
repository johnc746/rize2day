import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';
import { MySound } from './MySound';

const WallPaper = styled('div')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  overflow: 'hidden',
  background: 'linear-gradient(rgb(255, 38, 142) 0%, rgb(255, 105, 79) 100%)',
  transition: 'all 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s',
  '&:before': {
    content: '""',
    width: '140%',
    height: '140%',
    position: 'absolute',
    top: '-40%',
    right: '-50%',
    background:
      'radial-gradient(at center center, rgb(62, 79, 249) 0%, rgba(62, 79, 249, 0) 64%)',
  },
  '&:after': {
    content: '""',
    width: '140%',
    height: '140%',
    position: 'absolute',
    bottom: '-50%',
    left: '-30%',
    background:
      'radial-gradient(at center center, rgb(247, 237, 225) 0%, rgba(247, 237, 225, 0) 70%)',
    transform: 'rotate(30deg)',
  },
});

const Widget = styled('div')(({ theme }) => ({
  padding: 16,
  borderRadius: 16,
  width: 343,
  maxWidth: '100%',
  margin: 'auto',
  position: 'relative',
  zIndex: 1,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
  backdropFilter: 'blur(40px)',
}));

const CoverImage = styled('div')({
  width: 100,
  height: 100,
  objectFit: 'cover',
  overflow: 'hidden',
  flexShrink: 0,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%',
  },
});

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

const EqualizerTitle = { 'lowpass': 32, 'highpass': 64, 'bandpass': 128, 'lowshelf': 256, 'highshelf': 512, 'peaking': 1024 };
const EqualizerTypes = { 'lowpass': 50, 'highpass': 50, 'bandpass': 50, 'lowshelf': 50, 'highshelf': 50, 'peaking': 50 };

export default function MusicPlayerSlider() {
  const theme = useTheme();
  const duration = 200; // seconds
  const [position, setPosition] = React.useState(32);
  const [volume, setVolume] = React.useState(30);
  const [paused, setPaused] = React.useState(true);
  const [update, setUpdate] = React.useState(false);
  const [equalizeData, setEqualizeData] = React.useState(EqualizerTypes);
  const [musicSelData, setMusicSelData] = React.useState({ volume: volume });
  const freqDefaultValue = 50;

  function formatDuration(value: number) {
    const minute = Math.floor(value / 60);
    const secondLeft = value - minute * 60;
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }

  const mainIconColor = theme.palette.mode === 'dark' ? '#fff' : '#000';
  const lightIconColor =
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  function valuetext(value: number) {
    return `${value}°C`;
  }

  const handleVolume = (value) => {
    setVolume(value);
    let musicData = { ...musicSelData };
    musicData["volume"] = value;
    setMusicSelData(musicData);

    try {
      let localData = JSON.parse(localStorage.getItem("localData"));
      console.log(">>>>>>>>>>>>>>>>>>>>getEqualizeData from handleVolume", localData);
      if (localData) {
        localData[volume] = value;
        localStorage.setItem("musicSelData", JSON.stringify(localData));
      }
      else {
        let newData = { volume: value };
        localStorage.setItem("musicSelData", JSON.stringify(newData));
        setUpdate(!update);
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  const handleFreq = (key, value, index) => {
    console.log(">>>>>>>>>>>>>>handleFreq");
    let temp = { ...equalizeData };
    temp[key] = value;
    setEqualizeData(temp);
    localStorage.setItem("equalizeData", JSON.stringify(temp));
    let selData = { volume: volume, selFreq: Object.values(EqualizerTitle)[index], selType: key, selValue: value };
    localStorage.setItem("musicSelData", JSON.stringify(selData));
    setUpdate(!update);
  }

  React.useEffect(() => {
    try {
      let localEqualizeData = JSON.parse(localStorage.getItem("equalizeData"));
      console.log(">>>>>>>>>>>>>>>>>>>>getEqualizeData from LocalStorage", localEqualizeData);
      if (localEqualizeData)
        setEqualizeData(localEqualizeData);

      let localData = JSON.parse(localStorage.getItem("musicSelData"));
      console.log(">>>>>>>>>>>>>>>>>>>>getEqualizeData from LocalStorage", localData);
      if (localData)
        setMusicSelData(localData);
    }
    catch (e) {
      console.log(e);
    }
  }, [])

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', marginTop: "20px",  marginRight:"15px"}}>
      <MySound update={update} status={!paused} />
      <Widget>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ ml: 1.5, minWidth: 0 }}>
            {/* <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Music Equalizer Setting
            </Typography> */}
            <Typography noWrap>
              <b>Music Equalizer Setting</b>
            </Typography>
            <Typography noWrap letterSpacing={-0.25}>
              You can test now~
            </Typography>
          </Box>
        </Box>
        {/* <Slider
          aria-label="time-indicator"
          size="small"
          value={position}
          min={0}
          step={1}
          max={duration}
          onChange={(_, value) => setPosition(value as number)}
          sx={{
            color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&:before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0px 0px 0px 8px ${theme.palette.mode === 'dark'
                  ? 'rgb(255 255 255 / 16%)'
                  : 'rgb(0 0 0 / 16%)'
                  }`,
              },
              '&.Mui-active': {
                width: 20,
                height: 20,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
            },
          }}
        /> */}
        {/* <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: -2,
          }}
        >
          <TinyText>{formatDuration(position)}</TinyText>
          <TinyText>-{formatDuration(duration - position)}</TinyText>
        </Box> */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: -1,
          }}
        >
          {/* <IconButton aria-label="previous song">
            <FastRewindRounded fontSize="large" htmlColor={mainIconColor} />
          </IconButton> */}
          <IconButton
            aria-label={paused ? 'play' : 'pause'}
            onClick={() => setPaused(!paused)}
          >
            {paused ? (
              <PlayArrowRounded
                sx={{ fontSize: '3rem' }}
                htmlColor={mainIconColor}
              />
            ) : (
              <PauseRounded sx={{ fontSize: '3rem' }} htmlColor={mainIconColor} />
            )}
          </IconButton>
          {/* <IconButton aria-label="next song">
            <FastForwardRounded fontSize="large" htmlColor={mainIconColor} />
          </IconButton> */}
        </Box>
        <Stack spacing={2} direction="row" sx={{ mb: 1, px: 1 }} alignItems="center">
          <VolumeDownRounded sx={{ width: "40px" }} htmlColor={lightIconColor} />
          <Slider
            aria-label="Volume"
            value={musicSelData.volume}
            onChange={(_, value) => handleVolume(value)}
            sx={{
              color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
                backgroundColor: '#fff',
                '&:before': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                },
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none',
                },
              },
            }}
          />
          <VolumeUpRounded htmlColor={lightIconColor} />
        </Stack>

        <Box
          sx={{
            width: "100%", height: "2px", backgroundColor: "gray", marginBottom: "20px", borderRadius: "10%"
          }}
        />
        {
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: "row",
            }}
          >
            {
              Object.values(EqualizerTitle).map((amount, index) => {
                return (
                  <Stack spacing={1} direction="column" sx={{ mb: 1, px: 1, height: 300 }} alignItems="center">
                    <Slider
                      aria-label="Volume"
                      value={Object.values(equalizeData)[index]}
                      orientation="vertical"
                      getAriaValueText={valuetext}
                      valueLabelDisplay="auto"
                      onChange={(_, value) => handleFreq(Object.keys(EqualizerTitle)[index], value as number, index)}
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
                        '& .MuiSlider-track': {
                          border: 'none',
                        },
                        '& .MuiSlider-thumb': {
                          width: 24,
                          height: 24,
                          backgroundColor: '#fff',
                          '&:before': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                          },
                          '&:hover, &.Mui-focusVisible, &.Mui-active': {
                            boxShadow: 'none',
                          },
                        },
                      }}
                    />
                    <Typography >{amount}</Typography>
                  </Stack>
                );
              })
            }
          </Box>
        }
      </Widget>
      <WallPaper />
    </Box>
  );
}

