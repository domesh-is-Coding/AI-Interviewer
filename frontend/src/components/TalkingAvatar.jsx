// export default function TalkingAvatar({ isSpeaking }) {
//     return (
//       <div style={{ position: "relative", width: 200, height: 200 }}>
//         <img
//           src="/avatar_face.png" // a professional headshot image
//           alt="Interviewer"
//           style={{ width: "100%", height: "100%" }}
//         />
//         <div
//           style={{
//             position: "absolute",
//             bottom: 30,
//             left: "50%",
//             transform: "translateX(-50%)",
//             width: 40,
//             height: isSpeaking ? 20 : 5,
//             backgroundColor: "black",
//             borderRadius: 5,
//             transition: "height 0.2s ease",
//           }}
//         />
//       </div>
//     );
//   }
    



import { useEffect, useRef } from "react";
import React from "react";

const TalkingAvatar = (props) => {
  const { isSpeaking, audioContext, audioStream } = props;
  const mouthRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isSpeaking || !audioContext || !audioStream) {
      // Fall back to simple animation if no audio analysis is available
      const animateSimple = () => {
        if (mouthRef.current) {
          const scale = 1 + Math.sin(Date.now() / 100) * 0.2;
          mouthRef.current.setAttribute("transform", `scale(1, ${scale})`);
        }
        animationFrameRef.current = requestAnimationFrame(animateSimple);
      };

      if (isSpeaking) {
        animationFrameRef.current = requestAnimationFrame(animateSimple);
      } else {
        cancelAnimationFrame(animationFrameRef.current);
        if (mouthRef.current) {
          mouthRef.current.setAttribute("transform", "scale(1, 1)");
        }
      }

      return () => cancelAnimationFrame(animationFrameRef.current);
    }

    // Set up audio analysis for lip sync
    const setupAudioAnalysis = async () => {
      try {
        const source = audioContext.createMediaStreamSource(audioStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        
        const animateLipSync = () => {
          if (!mouthRef.current || !analyserRef.current || !dataArrayRef.current) {
            return;
          }
          
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const average = sum / dataArrayRef.current.length;
          
          // Map volume to mouth scale (adjust these values based on your needs)
          const minScale = 0.8;
          const maxScale = 1.4;
          const scale = minScale + (average / 255) * (maxScale - minScale);
          
          mouthRef.current.setAttribute("transform", `scale(1, ${scale})`);
          
          animationFrameRef.current = requestAnimationFrame(animateLipSync);
        };
        
        animationFrameRef.current = requestAnimationFrame(animateLipSync);
      } catch (error) {
        console.error("Error setting up audio analysis:", error);
      }
    };
    
    setupAudioAnalysis();
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [isSpeaking, audioContext, audioStream]);

  return (
    <>
   

    <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={264}
    height={280}
    {...props}
  >
    <defs>
      <path
        id="a"
        d="M124 144.611V163h4c39.765 0 72 32.235 72 72v9H0v-9c0-39.765 32.235-72 72-72h4v-18.389c-17.237-8.189-29.628-24.924-31.695-44.73C38.48 99.058 34 94.052 34 88V74c0-5.946 4.325-10.882 10-11.834V56c0-30.928 25.072-56 56-56s56 25.072 56 56v6.166c5.675.952 10 5.888 10 11.834v14c0 6.052-4.48 11.058-10.305 11.881-2.067 19.806-14.458 36.541-31.695 44.73Z"
      />
    </defs>
    <g fill="none" fillRule="evenodd">
      <g mask="url(#react-mask-5)">
        <g transform="translate(32 36)">
          <mask id="b" fill="#fff">
            <use xlinkHref="#a" />
          </mask>
          <use xlinkHref="#a" fill="#D0C6AC" />
          <g fill="#EDB98A" mask="url(#b)">
            <path d="M0 0h264v280H0z" />
          </g>
          <path
            fill="#000"
            fillOpacity={0.1}
            d="M156 79v23c0 30.928-25.072 56-56 56s-56-25.072-56-56V79v15c0 30.928 25.072 56 56 56s56-25.072 56-56V79Z"
            mask="url(#b)"
          />
        </g>
        <g transform="translate(0 170)">
          <defs>
            <path
              id="c"
              d="M165.96 29.295c36.976 3.03 66.04 34 66.04 71.757V110H32v-8.948c0-38.1 29.592-69.287 67.045-71.832-.03.373-.045.75-.045 1.128 0 11.863 14.998 21.48 33.5 21.48 18.502 0 33.5-9.617 33.5-21.48 0-.353-.013-.704-.04-1.053Z"
            />
          </defs>
          <mask id="d" fill="#fff">
            <use xlinkHref="#c" />
          </mask>
          <use xlinkHref="#c" fill="#E6E6E6" />
          <g fill="#E6E6E6" mask="url(#d)">
            <path d="M0 0h264v110H0z" />
          </g>
          <g fill="#000" fillOpacity={0.16} mask="url(#d)" opacity={0.6}>
            <ellipse
              cx={40.5}
              cy={27.848}
              rx={39.635}
              ry={26.914}
              transform="translate(92 4)"
            />
          </g>
        </g>
        <g fill="#000">
          <g transform="translate(78 134)">
            <defs>
              <path
                id="e"
                d="M35.118 15.128C36.176 24.62 44.226 32 54 32c9.804 0 17.874-7.426 18.892-16.96.082-.767-.775-2.04-1.85-2.04H37.088c-1.08 0-2.075 1.178-1.97 2.128Z"
              />
            </defs>
            <mask id="f" fill="#fff">
              <use xlinkHref="#e" />
            </mask>
            <use xlinkHref="#e" fillOpacity={0.7} />
            <rect
              width={31}
              height={16}
              x={39}
              y={2}
              fill="#FFF"
              mask="url(#f)"
              rx={5}
            />
            <g fill="#FF4F6D" mask="url(#f)">
              <g transform="translate(38 24)">
                <circle cx={11} cy={11} r={11} />
                <circle cx={21} cy={11} r={11} />
              </g>
            </g>
          </g>
          {/* <path
            fillOpacity={0.16}
            d="M120 130c0 4.418 5.373 8 12 8s12-3.582 12-8"
          /> */}
          <path
  ref={mouthRef}  // Add this line
  fillOpacity={0.16}
  d="M120 130c0 4.418 5.373 8 12 8s12-3.582 12-8"
  transform="scale(1, 1)"  // Add this for initial state
/>
          <g fillOpacity={0.6} transform="translate(76 90)">
            <circle cx={30} cy={22} r={6} />
            <circle cx={82} cy={22} r={6} />
          </g>
          <g fillOpacity={0.6} fillRule="nonzero">
            <path d="M91.63 99.159c3.915-5.51 14.648-8.598 23.893-6.328a2 2 0 0 0 .954-3.884c-10.737-2.637-23.165.94-28.107 7.894a2 2 0 0 0 3.26 2.318ZM172.37 99.159c-3.915-5.51-14.648-8.598-23.893-6.328a2 2 0 0 1-.954-3.884c10.737-2.637 23.165.94 28.108 7.894a2 2 0 0 1-3.26 2.318Z" />
          </g>
        </g>
        <defs>
          <path id="g" d="M0 0h264v280H0z" />
          <path
            id="i"
            d="M222.385 182.806c-5.374 5.712-10.737 9.322-10.554 15.194.317 11.889 43.608 47.051 5.169 69H16.005c-38.439-21.949 4.852-57.111 5.17-69 .182-5.872-5.18-9.482-10.555-15.194C5.247 177.094-.137 169.28.003 155c.941-29.028 31.369-26.412 31.2-46 .169-19-11.39-26.84 0-63C42.84 9.54 72.917.768 116.003.016V0l.5.008.5-.008v.016c43.086.752 73.163 9.523 84.8 45.984 11.388 36.16-.17 44 0 63-.17 19.588 30.258 16.972 31.2 46 .14 14.28-5.245 22.094-10.618 27.806Zm-39.501-87.481c-21.52-11.588-39.994-28.18-52.038-47.023C112.764 73.924 76.53 78.535 51.224 94.68A12.06 12.06 0 0 0 51 97v13c0 6.019 4.43 11.002 10.209 11.867 1.743 20.248 14.26 37.416 31.791 45.744V186h-4c-39.765 0-72 32.235-72 72v9h200v-9c0-39.765-32.235-72-72-72h-4v-18.389c17.53-8.328 30.048-25.496 31.791-45.744C178.57 121.002 183 116.02 183 110V97c0-.568-.04-1.128-.116-1.675Z"
          />
          <path
            id="k"
            d="M222.385 182.806c-5.374 5.712-10.737 9.322-10.554 15.194.317 11.889 43.608 47.051 5.169 69H16.005c-38.439-21.949 4.852-57.111 5.17-69 .182-5.872-5.18-9.482-10.555-15.194C5.247 177.094-.137 169.28.003 155c.941-29.028 31.369-26.412 31.2-46 .169-19-11.39-26.84 0-63C42.84 9.54 72.917.768 116.003.016V0l.5.008.5-.008v.016c43.086.752 73.163 9.523 84.8 45.984 11.388 36.16-.17 44 0 63-.17 19.588 30.258 16.972 31.2 46 .14 14.28-5.245 22.094-10.618 27.806ZM93 186h-4c-39.765 0-72 32.235-72 72v9h200v-9c0-39.765-32.235-72-72-72h-4v-46H93v46Z"
          />
        </defs>
        <mask id="h" fill="#fff">
          <use xlinkHref="#g" />
        </mask>
        <g mask="url(#h)">
          <g transform="translate(15 13)">
            <mask id="j" fill="#fff">
              <use xlinkHref="#i" />
            </mask>
            <use xlinkHref="#i" fill="#314756" />
            <g fill="#4A312C" mask="url(#j)">
              <path d="M0 0h264v280H0z" />
            </g>
          </g>
          <g transform="translate(15 13)">
            <mask id="l" fill="#fff">
              <use xlinkHref="#k" />
            </mask>
            <path
              fill="#000"
              fillOpacity={0.16}
              d="M30.099 115.057c-2.374 3.026-5.57 7.471-5.737 7.137 1.873-2.383 3.013-5.182 2.979-8.758.177-18.101-11.904-25.569 0-60.017.669-1.91 1.766-3.715 3.245-5.414-10.343 34.454.783 42.35.617 60.995.02 2.295-.38 4.285-1.104 6.057Zm172.32-67.052c1.48 1.7 2.577 3.504 3.245 5.414 10.158 29.394 2.852 39.144.6 52.617-.3.805-.069 1.754-.384 2.567-30.673-10.458-58.29-30.043-74.385-52.991-22.784 29.424-73.14 29.761-97.821 55.324.387-.544.754-1.051 1.084-1.49 22.536-29.919 73.489-29.122 96.088-61.144 15.398 24.088 41.818 44.648 71.163 55.625.301-.854.08-1.85.367-2.694 2.108-13.833 8.84-23.926.043-53.228Z"
              mask="url(#l)"
            />
          </g>
          <path
            fill="#FFF"
            fillOpacity={0.1}
            d="M49.758 122.446c22.536-29.919 73.489-29.122 96.088-61.144 15.398 24.088 41.818 44.648 71.163 55.625.301-.854.08-1.85.367-2.694 2.155-14.144 9.144-24.378-.573-55.233-11.637-36.46-41.714-45.232-84.8-45.984l-1-.016c-43.086.768-73.163 9.54-84.8 46-11.39 36.16.169 44 0 63 .032 3.753-1.059 6.691-2.85 9.193.183.402 4.153-5.756 6.405-8.747Z"
          />
          <g transform="translate(61 85)">
            <defs>
              <filter
                id="m"
                width="101.5%"
                height="109.8%"
                x="-.8%"
                y="-2.4%"
                filterUnits="objectBoundingBox"
              >
                <feOffset dy={2} in="SourceAlpha" result="shadowOffsetOuter1" />
                <feColorMatrix
                  in="shadowOffsetOuter1"
                  result="shadowMatrixOuter1"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
                />
                <feMerge>
                  <feMergeNode in="shadowMatrixOuter1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g
              fill="#252C2F"
              fillRule="nonzero"
              filter="url(#m)"
              transform="translate(6 7)"
            >
              <path d="M34 41h-2.758C17.315 41 9 33.336 9 20.5 9 10.127 10.817 0 32.53 0h2.94C57.183 0 59 10.127 59 20.5 59 32.569 48.721 41 34 41ZM32.385 6C13 6 13 12.841 13 21.502 13 28.572 16.116 37 30.97 37H34c12.365 0 21-6.373 21-15.498C55 12.84 55 6 35.615 6h-3.23ZM96 41h-2.758C79.315 41 71 33.336 71 20.5 71 10.127 72.817 0 94.53 0h2.94C119.183 0 121 10.127 121 20.5 121 32.569 110.721 41 96 41ZM94.385 6C75 6 75 12.841 75 21.502 75 28.572 78.12 37 92.97 37H96c12.365 0 21-6.373 21-15.498C117 12.84 117 6 97.615 6h-3.23Z" />
              <path d="M2.955 5.772C3.645 5.096 11.21 0 32.5 0c17.851 0 21.63 1.853 27.35 4.652l.419.207c.398.14 2.431.83 4.81.907a16.998 16.998 0 0 0 4.563-.869C76.17 1.722 82.562 0 97.5 0c21.29 0 28.854 5.096 29.545 5.772 1.634 0 2.955 1.29 2.955 2.885v2.886c0 1.596-1.32 2.886-2.955 2.886 0 0-6.901 0-6.901 2.886 0 2.885-1.962-4.176-1.962-5.772v-2.81c-3.603-1.38-10.054-3.947-20.682-3.947-11.842 0-17.739 2.1-22.798 4.185l.057.137-.003 1.986-2.217 5.35L69.8 15.36c-.244-.097-.772-.27-1.504-.451-2.04-.503-4.137-.656-5.992-.276-.68.14-1.312.35-1.891.633l-2.643 1.29-2.643-5.16.117-2.295.08-.195c-4.362-2.033-8.385-4.12-22.824-4.12-10.628 0-17.078 2.565-20.682 3.944v2.812c0 1.596-2.954 8.657-2.954 5.772 0-2.886-5.91-2.886-5.91-2.886-1.63 0-2.954-1.29-2.954-2.886V8.657c0-1.595 1.324-2.885 2.955-2.885Z" />
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
    </>
    
  );
};

export default TalkingAvatar;