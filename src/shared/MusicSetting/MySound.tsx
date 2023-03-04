// import React from 'react';
// import { render } from 'react-dom';
// import Sound, { pluginFactory } from 'react-hifi';

// interface MyNodeProps {
//   value: number;
// }

// interface Plugin<Props, Node = AudioNode | AudioNode[]> {
//   createNode(audioContext: AudioContext, props: Props): Node;
//   updateNode?(node: Node, props: Props): void;
//   shouldNotUpdate?(prevProps: MyNodeProps, nextProps: MyNodeProps): boolean;
// }

// const myCustomPlugin: Plugin<MyNodeProps, GainNode> = {
//   createNode(ctx: AudioContext, props: MyNodeProps) {
//     return ctx.createGain();
//   },
//   updateNode(node, props: MyNodeProps) {
//     node.gain.value = props.value;
//   },
//   shouldNotUpdate(prevProps: MyNodeProps, nextProps: MyNodeProps) {
//     return prevProps.value === nextProps.value;
//   },
// }

// const MyNode = pluginFactory<MyNodeProps, GainNode>(myCustomPlugin);
// const MySound = () => {
// return (
//   <Sound url="http://foo/bar.mp3">
//     <MyNode value={0.5} />
//   </Sound>);
// };

// export default MySound;


// import React, { useRef } from "react"
// import AudioVisualizer from "@tiagotrindade/audio-visualizer"

// function MySound() {
//   const audio = useRef()

//   return (
//     <>
//       <audio ref={audio} src="..." />

//       <AudioVisualizer audio={audio} style={{ width: 100, height: 100 }} />
//     </>
//   )
// };

// import React from 'react';
// import ReactDOM from 'react-dom';
// import { SpectrumVisualizer, SpectrumVisualizerTheme } from 'react-audio-visualizers';

// function MySound() {
//   return (
//     <SpectrumVisualizer
//         audio="/assets/test.mp3"
//         theme={SpectrumVisualizerTheme.radialSquaredBars}
//         colors={['#009688', '#26a69a']}
//         iconsColor="#26a69a"
//         backgroundColor="white"
//         showMainActionIcon
//         showLoaderIcon
//         highFrequency={8000}
//     />
//   );
// }


import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import sound1 from '../../assets/sound1.mp3';
import sound2 from '../../assets/sound2.mp3';
import sound3 from '../../assets/sound3.mp3';
import sound4 from '../../assets/sound4.mp3';

import Sound, {
  Volume,
  Stereo,
  Equalizer,
  BiQuadFilter,
} from 'react-hifi';

interface BiQuadPluginProps {
  value: number;
  freq: number;
  q?: number;
  type: 'lowpass' | 'highpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking' | 'notch' | 'allpass';
}

enum SoundStatus {
  PAUSED = "PAUSED",
  PLAYING = "PLAYING",
  STOPPED = "STOPPED"
}

export const MySound = ({ update, status }) => {

  const [volume, setVolume] = useState(50);
  const [selFreq, setSelFreq] = useState(32);
  const [selValue, setSelValue] = useState(50);
  const [selType, setSelType] = useState();
  const [stream, setStream] = useState(sound1);
  useEffect(() => {
    try {
      let localData = JSON.parse(localStorage.getItem("musicSelData"));
      console.log(">>>>>>>>>>>>>>>>>>>>getMusicSelData from LocalStorage", update, localData);
      if (localData) {
        localData.volume && setVolume(localData.volume);
        localData.selFreq && setSelFreq(localData.selFreq);
        localData.selValue && setSelValue(localData.selValue);
        localData.selType && setSelType(localData.selType);
      }
    }
    catch (e) {
      console.log(e);
    }
    console.log(">>>>>>>>>>>>sound musicSelData", volume, selFreq, selValue, selType);
  }, [update]);

  useEffect(() => {
    const min = 1;
    const max = 4;
    const rand = Math.round(min + Math.random() * (max - min));

    if (rand == 1)
      setStream(sound1);
    else if (rand == 2)
      setStream(sound2);
    else if (rand == 3)
      setStream(sound3);
    else if (rand == 4)
      setStream(sound4);
  }
    , []);

  return (
    <Sound url={stream} playStatus={status ? SoundStatus.PLAYING : SoundStatus.PAUSED}
      onLoad={(event) => {
        console.log(">>>>>>>>>>sound onLoad", event);
      }}

      onFinishedPlaying={(event) => {
        console.log(">>>>>>>>>>sound onFinishedPlaying", event);
      }}

      onPlaying={(OnPlayingArgs) => {
        console.log(">>>>>>>>>>sound onPlaying", OnPlayingArgs);
      }}

      onLoading={(event) => {
        console.log(">>>>>>>>>>sound onLoading", event);
      }}

      onError={(err) => {
        console.log(">>>>>>>>>>sound onError", err);
      }}
    >
      <Volume value={volume} />
      <BiQuadFilter value={selValue} type={selType} freq={selValue} />
      {/* <Equalizer data={myEqualizeData} /> */}
    </Sound>
  )
};
