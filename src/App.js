import React, { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame, extend, useLoader } from '@react-three/fiber';
import { Html, useProgress, useGLTF, useFBX } from '@react-three/drei';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, SelectiveBloom } from '@react-three/postprocessing'
import { BlurPass, Resizer, KernelSize } from 'postprocessing'

import Controls from './Controls';


import Model from './Main'

function LanternOfDae ({x, y, z, url}) {
  const {scene} = new ColladaLoader(url);
  // ColladaExporter
  return scene ? <group position={[x,y,z]} scale={0.005}>
    <primitive object={scene}/>
  </group> : null
}

function LanternOfObj ({x, y, z, url}) {
  // const materials = useLoader(MTLLoader, mtlUrl)
  const object = useLoader(OBJLoader, url, loader => {
    // materials.preload()
    // loader.setMaterials(materials)
  })
  return <primitive position={[x,y,z]} scale={0.005} object={object} />
}



export function LanternOfGLTF ({x, y, z, url}) {
  const {scene} = useGLTF(url);
  const copiedScene = useMemo(() => scene.clone(), [scene])
  console.log(copiedScene)

  return copiedScene ? <group position={[x,y,z]} scale={0.005}>
    <primitive object={copiedScene}/>
  </group> : null
}

function LanternOfFBX ({x, y, z, url}) {
  const {scene} = useFBX(url);
  
  return scene ? <group position={[x,y,z]} scale={0.005}>
    <primitive object={scene}/>
  </group> : null
}


function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress} % loaded</Html>
}



function Sphere({ geometry, x, y, z, s }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.position.x = x + Math.sin((state.clock.getElapsedTime() * s) / 2)
    ref.current.position.y = y + Math.sin((state.clock.getElapsedTime() * s) / 2)
    ref.current.position.z = z + Math.sin((state.clock.getElapsedTime() * s) / 2)
  })
  return (
    <mesh ref={ref} position={[x, y, z]} scale={[s, s, s]} geometry={geometry}>
      <meshStandardMaterial color="hotpink" roughness={1} />
    </mesh>
  )
}

function RandomSpheres() {
  const [geometry] = useState(() => new THREE.SphereGeometry(1, 32, 32), [])
  const data = useMemo(() => {
    return new Array(15).fill().map((_, i) => ({
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 100 - 50,
      s: Math.random() + 10,
    }))
  }, [])
  return data.map((props, i) => <Sphere key={i} {...props} geometry={geometry} />)
}

const path = './Skybox/nightsky_';
const images = ['lf', 'rt', 'up', 'dn', 'ft', 'bk'];
const ext = '.png';
const imagePaths = images.map(img => path + img + ext);

export const useSkybox = () => {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.CubeTextureLoader()
    const mat = loader.load(imagePaths)
    scene.background = mat
    scene.environment = mat
  }, [scene])

  return null
}



// export function Bloom({ children, f }) {
//   const { gl, camera, size } = useThree()
//   const [scene, setScene] = useState()
//   const composer = useRef()
//   useEffect(() => void scene && composer.current.setSize(size.width, size.height), [size])
//   useFrame(() => scene && composer.current.render(), 1)
//   useFrame(({render}) => render && render.setClearColor( 0xffffff, 0 ));

//   return (
//     <>
//       <scene ref={setScene}>{children}</scene>
//       <effectComposer ref={composer} size args={[gl]}>
//         <renderPass attachArray="passes" scene={scene} camera={camera} />
//         <unrealBloomPass intensity={5} attachArray="passes" args={[undefined, f, 1, 0]} />
//         {/*
//           constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
//           resolution: Vector2;
//           strength: number;
//           radius: number;
//           threshold: number;
//           clearColor: Color;
//           renderTargetsHorizontal: WebGLRenderTarget[];
//           renderTargetsVertical: WebGLRenderTarget[];
//           nMips: number;
//           renderTargetBright: WebGLRenderTarget;
//           highPassUniforms: object;
//           materialHighPassFilter: ShaderMaterial;
//           separableBlurMaterials: ShaderMaterial[];
//           compositeMaterial: ShaderMaterial;
//           bloomTintColors: Vector3[];
//           copyUniforms: object;
//           materialCopy: ShaderMaterial;
//           oldClearColor: Color;
//           oldClearAlpha: number;
//           basic: MeshBasicMaterial;
//           fsQuad: object;

//           dispose(): void;
//           getSeperableBlurMaterial(): ShaderMaterial;
//           getCompositeMaterial(): ShaderMaterial;
//         */}
//       </effectComposer>
//     </>
//   )
// }


export function SelectiveEffects({lightsRefs, meshRefs}){

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
  )
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
  )
}



export function Main({ children }) {
  const scene = useRef()
  const { gl, camera } = useThree()
  useFrame(() => {
    gl.autoClear = false
    gl.clearDepth();
    gl.render(scene.current, camera)
  }, 2)
  return (
    <scene ref={scene}>
      {children}
    </scene>
  )
}
function Scene() {
  useSkybox();
  return null;
}

export default function App (){
  

  return(
    <>
      <Model />
      <div style={{position:'absolute', width: "100%", height: "100%"}}>
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
};
