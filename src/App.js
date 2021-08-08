import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, useProgress, useGLTF } from "@react-three/drei";

// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
// import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import {
  EffectComposer,
  Bloom,
  /*DepthOfField,*/ Noise,
  Vignette,
  SelectiveBloom,
} from "@react-three/postprocessing";
import { /*BlurPass, */ Resizer, KernelSize } from "postprocessing";

import Controls from "./Controls";

import Model from "./Main";

export function LanternOfGLTF({ x, y, z, url }) {
  const { scene } = useGLTF(url);
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  console.log(copiedScene);

  return copiedScene ? (
    <group position={[x, y, z]} scale={0.005}>
      <primitive object={copiedScene} />
    </group>
  ) : null;
}

export function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const path = "./Skybox/nightsky_";
const images = ["lf", "rt", "up", "dn", "ft", "bk"];
const ext = ".png";
const imagePaths = images.map((img) => path + img + ext);

export const useSkybox = () => {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.CubeTextureLoader();
    const mat = loader.load(imagePaths);
    scene.background = mat;
    scene.environment = mat;
  }, [scene]);

  return null;
};

export function SelectiveEffects({ lightsRefs, meshRefs }) {
  return (
    <SelectiveBloom
      lights={lightsRefs} // ⚠️ REQUIRED! all relevant lights
      selection={meshRefs} // selection of objects that will have bloom effect
      selectionLayer={10} // selection layer
      intensity={1.0} // The bloom intensity.
      blurPass={undefined} // A blur pass.
      width={Resizer.AUTO_SIZE} // render width
      height={Resizer.AUTO_SIZE} // render height
      kernelSize={KernelSize.LARGE} // blur kernel size
      luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
      luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
    />
  );
}

export function Effects() {
  // const AO = { samples: 3, luminanceInfluence: 0.6, radius: 2, intensity: 5 }
  return (
    <EffectComposer>
      {/* <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} /> */}
      {/* <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} /> */}
      <Bloom
        intensity={1.0} // The bloom intensity.
        blurPass={undefined} // A blur pass.
        width={Resizer.AUTO_SIZE} // render width
        height={Resizer.AUTO_SIZE} // render height
        kernelSize={KernelSize.LARGE} // blur kernel size
        luminanceThreshold={0} // luminance threshold. Raise this value to mask out darker elements in the scene.
        luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
      />
      <Noise opacity={0.02} />
      <Vignette eskil={false} offset={0.1} />
    </EffectComposer>
  );
}

function Scene() {
  useSkybox();
  return null;
}

export default function App() {
  return (
    <>
      <Model />
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Canvas
          translate={true}
          colorManagement
          shadowMap
          camera={{ position: [-5, 3, 6], fov: 60 }}
        >
          <Scene />
          <Controls />
          <gridHelper />
        </Canvas>
      </div>
    </>
  );
}
