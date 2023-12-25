import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";

import { Backdrop, ContactShadows, Environment } from "@react-three/drei";
import AudioRecorder from "../Whisper/WhisperComponent";
import { Emotion } from "@/shared/types";
import {
  animateMouth,
  resetToNeutral,
  animateBlink,
  thinkDown,
  bounceUp,
  bounceDown,
} from "./animations";
import Whiteboard from "../Whiteboard/whiteboard";
import NavbarLoggedIn from "../Navbar/navbarLoggedIn";

const Robot = () => {
  const [emotion, setEmotion] = useState<Emotion>(Emotion.Neutral);

  const [drawCommands, setDrawCommands] = useState<any>({});
  //AUDIO
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const analyser = useRef<any>(null);
  const dataArray = useRef<any>([]);
  const bufferLength = useRef<any>();
  const source = useRef<any>();
  const [audioPlayComplete, setIsAudioPlayComplete] = useState<boolean | null>(
    null
  );

  // const audioPlayComplete = useRef<boolean | null>(null);

  const robotRightEyelidBottom = useRef<any>();
  const robotRightEyelidTop = useRef<any>();
  const robotLeftEyelidTop = useRef<any>();
  const robotLeftEyelidBottom = useRef<any>();
  const robotMouthTop = useRef<any>();
  const robotMouthBottom = useRef<any>();
  const robotMouth = useRef<any>();

  //animation management
  const isAnimating = useRef<boolean>(false);

  const blinkIntervalRef = useRef<any>(null);

  const emotionRef = useRef<Emotion>(emotion);

  const gltf = useLoader(GLTFLoader, "./final.glb");
  const robotRef = useRef<any>(gltf.scene);
  // Set the scale of the robot
  const scale = 2;

  const processAudio = () => {
    return new Promise<void>(async (resolve) => {
      if (audioBuffer) {
        // Connect analyser to the audio context
        source.current = audioContext.createBufferSource();
        source.current.buffer = audioBuffer;
        analyser.current = audioContext.createAnalyser();
        source.current.connect(analyser.current);
        analyser.current.connect(audioContext.destination);
        source.current.start();
        analyser.current.fftSize = 32;
        bufferLength.current = analyser.current.frequencyBinCount;
        dataArray.current = new Uint8Array(bufferLength.current);

        robotRef.current.rotation.x = 0;

        await animateMouth(
          robotMouthTop.current,
          robotMouthBottom.current,
          emotion,
          dataArray.current,
          source.current,
          robotLeftEyelidBottom.current,
          robotRightEyelidBottom.current,
          robotLeftEyelidTop.current,
          robotRightEyelidTop.current,
          analyser.current,
          robotRef.current
        );

        setIsAudioPlayComplete(true);
        robotRef.current.rotation.x = 0;
        resolve();
      }
    });
  };

  const animate = async () => {
    robotRef.current = robotRef.current;
    robotRightEyelidBottom.current = robotRef.current.children[5];
    robotRightEyelidTop.current = robotRef.current.children[4];
    robotLeftEyelidTop.current = robotRef.current.children[3];
    robotLeftEyelidBottom.current = robotRef.current.children[2];
    robotMouthTop.current = robotRef.current.children[6];
    robotMouthBottom.current = robotRef.current.children[10];
    robotMouth.current = robotRef.current.children[9];

    await resetToNeutral(
      robotRightEyelidBottom.current,
      robotRightEyelidTop.current,
      robotLeftEyelidTop.current,
      robotLeftEyelidBottom.current
    );

    isAnimating.current = false;

    clearInterval(blinkIntervalRef.current);
    blinkIntervalRef.current = null;

    if (emotion == Emotion.Neutral) {
      robotMouth.current.position.y = -0.17;
      await resetToNeutral(
        robotRightEyelidBottom.current,
        robotRightEyelidTop.current,
        robotLeftEyelidTop.current,
        robotLeftEyelidBottom.current
      );

      if (blinkIntervalRef.current == null) {
        blinkIntervalRef.current = setInterval(async function () {
          isAnimating.current = true;

          await animateBlink(
            robotRightEyelidBottom.current,
            robotRightEyelidTop.current,
            robotLeftEyelidBottom.current,
            robotLeftEyelidTop.current
          );
        }, 3000);
      }
      return;
    }

    if (emotion == Emotion.Sad) {
      robotMouth.current.position.y = -0.285;

      await processAudio();
      setTimeout(function () {
        setEmotion(Emotion.Neutral);
      }, 1000);
      return;
    }
    if (emotion == Emotion.Happy) {
      await processAudio();
      setTimeout(function () {
        setEmotion(Emotion.Neutral);
      }, 1000);

      return;
    }
    if (emotion == Emotion.Think) {
      await thinkDown(
        robotRightEyelidBottom.current,
        robotRightEyelidTop.current,
        robotLeftEyelidBottom.current,
        robotLeftEyelidTop.current,
        robotRef.current
      );

      animateBounce();
    }
  };

  const animateBounce = async () => {
    await bounceUp(robotRef.current);

    await bounceDown(robotRef.current);

    console.log(emotionRef.current);
    if (emotionRef.current == Emotion.Think) {
      requestAnimationFrame(animateBounce);
    } else {
      return;
    }
  };

  useEffect(() => {
    emotionRef.current = emotion;
    console.log("animating");
    animate();
    return () => {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    };
  }, [audioBuffer, emotion]);

  return (
    <div className="w-full flex justify-center relative">
      <Canvas shadows style={{ width: "100vw", height: "100vh" }}>
        {/* <color attach="background" args={["#d3d3d3"]} /> */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[-10, 0, -5]} intensity={1} color="red" />
        <directionalLight
          position={[-1, -2, -5]}
          intensity={0.5}
          color="#0c8cbf"
        />
        <spotLight
          position={[5, 0, 5]}
          intensity={2.5}
          penumbra={1}
          angle={0.35}
          castShadow
          color="#0c8cbf"
        />

        <primitive
          object={gltf.scene as any}
          ref={robotRef}
          scale={[scale, scale, scale]}
          animations={gltf.animations}
          position={[0, 0, -2]}
          castShadow
          receiveShadow
        />

        {/* Floor */}
        <Backdrop
          floor={2}
          receiveShadow
          position={[0, -2, -3]}
          scale={[50, 20, 4]}
        >
          <meshStandardMaterial color="#A0C6CE" envMapIntensity={0.5} />
        </Backdrop>
        <ContactShadows position={[0, -2, 0]} scale={5} blur={1.5} far={1} />
        <Environment preset="city" />
      </Canvas>

      <div className="absolute bottom-0">
        <AudioRecorder
          setEmotion={setEmotion}
          setAudioBuffer={setAudioBuffer}
          setDrawCommands={setDrawCommands}
          audioPlayComplete={audioPlayComplete}
          setIsAudioPlayComplete={setIsAudioPlayComplete}
        />
      </div>

      <Whiteboard drawCommands={drawCommands} />
      <div className="absolute top-0 w-full">
        <NavbarLoggedIn />
      </div>
    </div>
  );
};

export default Robot;
