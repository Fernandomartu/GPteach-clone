import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";

import { Backdrop, ContactShadows, Environment } from "@react-three/drei";

import CreateAccount from "./createAccount";
import Navbar from "../Navbar/navbar";
import Login from "./login";

type Props = {
  setView: (value: string) => void;
  view: string | undefined;
};

const Robot = ({ setView, view }: Props) => {
  const gltf = useLoader(GLTFLoader, "./final.glb");
  const robotRef = useRef<any>(gltf.scene);
  // Set the scale of the robot
  const scale = 2;

  useEffect(() => {}, []);

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
          <meshStandardMaterial color="#A0C6CE" envMapIntensity={0.4} />
        </Backdrop>
        <ContactShadows position={[0, -2, 0]} scale={5} blur={1.5} far={1} />
        <Environment preset="city" />
      </Canvas>

      <div className="absolute top-0 w-full">
        <Navbar setView={setView} />
      </div>
      {view == "create" && (
        <div className="absolute top-60">
          <CreateAccount setView={setView} />
        </div>
      )}
      {view == "login" && (
        <div className="absolute top-60">
          <Login />
        </div>
      )}
    </div>
  );
};

export default Robot;
