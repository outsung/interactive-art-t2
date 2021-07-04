import React, { Suspense, useRef, useState, useMemo } from 'react';
// import * as THREE from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
// import { Stars } from '@react-three/drei';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';

import Controls from '../Controls';

import { useSpring, a } from "@react-spring/three";

import { LanternOfGLTF, Effects, useSkybox } from '../App'

export const Background = () => {
  const texture = useLoader(TextureLoader, './background.jpg');
  
  return (
    <mesh>
      <planeGeometry attach="geometry" args={[1440 / 10, 718 / 10]} />
      {texture && <meshBasicMaterial attach="material" map={texture} />}
    </mesh>
  );
};

// function FloatingBox() {
//     const ref = useRef()
//     // const props = useSpring({
//     //     position: expand ? [1.4, 1.4, 1.4] : [1, 1, 1],
//     // });
//     const props = useSpring({
//         loop: { reverse: true },
//         from: -1,
//         to: 1,
//         config: { duration: 2500 }
//       });
//     useFrame(() => {
//         ref.current.position.y = Math.sin(props)
//     })
//     return  <a.mesh
//         ref={ref}
//     >
//         <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
//         <a.meshStandardMaterial roughness={0.5} attach="material" />
//     </a.mesh>
//     // return <group ref={ref}>{children}</group>
// }




function AnimationBox({ d, t, children }) {
    const ref = useRef();
    // create a common spring that will be used later to interpolate other values
    const { springXZ } = useSpring({
      from: { springXZ: -1 },
      to: { springXZ: 1 },
      loop: { reverse: true },
      config: {
        duration: t / 3 * 2,
        
        // friction: 10,
        // tension: 6,
        // frequency: 4,
        // mass: 0
      }
    });
    const { springY } = useSpring({
        from: { springY: -1 },
        to: { springY: 1 },
        loop: { reverse: true },
        config: {
          duration: t,
          
          // friction: 10,
          // tension: 6,
          // frequency: 4,
          // mass: 0
        }
    });
    // interpolate values from commong spring
    // const positionXZ = spring.to([0, 1], [-0.1, 0.1]);
    
    useFrame(() => {
      ref.current.position.z = Math.cos(springXZ.get()) * d / 2;
      ref.current.position.x = Math.sin(springXZ.get()) * d / 2;
      ref.current.position.y = Math.sin(springY.get()) * d;
    });

    return (
      // using a from react-spring will animate our component
      <a.group ref={ref}>
        {children}
      </a.group>
    );
  }

// function MainBox(){
//     const mesh = useRef();
//     // useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));
//     const [expand, setExpand] = useState(false);
    

//     return (
//         <a.go  />
//     );
// }


function Scene() {
  const [count, setCount] = useState(3);
  
  useSkybox();
  
  return (
    <>
      <pointLight position={[0, -10, 0]} intensity={1.5} />
      <Effects />
      <Suspense fallback={<></>}>

        {/* <Bloom f={3}> */}
          <AnimationBox  t={3000} d={0.1}>
            {
              // x = -50 ~ 50, y = -30 ~ 30, z = 5 ~ 1
              Array.from(new Array(count)).map(() => {
                return <LanternOfGLTF x={Math.floor(Math.random() * 100 - 50)} y={Math.floor(Math.random() * 30)} z={Math.floor(Math.random() * 10 + 1)} url="./lantern.glb"/>
              })
            }
          </AnimationBox>
          <pointLight position={[0, -4, 10]} intensity={1.5} />
          <MainLentern setCount={setCount} x={0} y={-1.5} z={52} />
            
        {/* </Bloom> */}
      </Suspense>
    </>
  )
}


export default function Main (){
  return(
    <div style={{position:'absolute', width: "100%", height: "100%", zIndex: 100}}>
      <Canvas
        translate={true}
        onCreated={state => state.gl.setClearColor( 0xffffff, 0)}
        colorManagement
        shadowMap
        camera={{ position: [0, 0, 60], fov: 60 }}
      >
        <Scene />
        <Controls />
        <gridHelper />
      </Canvas>
    </div>
  );    
};

function MainLentern ({ setCount, x, y, z }) {
  const [intensity, setIntensity] = useState(0);
  
  return (
    <mesh onClick={() => {
      setIntensity(intensity + 0.1);
      setCount(prev => prev + 1);
      console.log("click");
    }}>
      {/* <pointLight distance={10} position={[ x, y - 2.5, z + 1]} intensity={intensity} /> */}
      <pointLight distance={10} position={[ x, y + 5, z + 9]} intensity={intensity} />
      <pointLight position={[ x, y - 2.5, z + 3]} intensity={0.6} />
      {useMemo(() => <LanternOfGLTF x={0} y={-1.5} z={52} url="./lantern.glb"/>, [])}
    </mesh>
  )
}