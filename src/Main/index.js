import React, { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
// import { Stars } from '@react-three/drei';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';

import Controls from '../Controls';

import { useSpring, a, useSpringRef, useChain } from "@react-spring/three";

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
              // x = -50 ~ 50, y = -30 ~ 30, z = -100 ~ 10
              Array.from(new Array(count)).map(() => {
                return <LanternOfGLTF x={Math.floor(Math.random() * 100)} y={Math.floor(Math.random() * 30)} z={Math.floor(Math.random() * 100 - 50)} url="./lantern.glb"/>
              })
            }
          </AnimationBox>
          <pointLight position={[0, -4, 10]} intensity={1.5} />
          <MainLentern setCount={setCount} x={-4} y={-2} z={52} />
            
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

function easeInSine(x) {
  return 1 - Math.cos((x * Math.PI) / 2);
}
function easeOutSine(x) {
  return Math.sin((x * Math.PI) / 2);
}
function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function MainLentern ({ setCount, x, y, z }) {
  const [isClick, setIsClick] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const ref = useRef();
  const closeTimeoutRef = useRef();

  const checkPoint1 = useSpringRef();
  const { lenternPosition1, cameraPosition1 } = useSpring({
    lenternPosition1: isClick ? [30, 27, -5] : [0, 0, 0],
    cameraPosition1: isClick ? [20, 23, 0] : [0, 0, 0],
    config: { duration: 7000, easing: easeInSine },
    ref: checkPoint1,
  });

  const checkPoint2 = useSpringRef();
  const { lenternPosition2, cameraPosition2, cameraLookAt2 } = useSpring({
    lenternPosition2: isClick ? [15, 12, -15] : [0, 0, 0],
    cameraPosition2: isClick ? [2, 5, 0] : [0, 0, 0],
    cameraLookAt2: isClick ? [0, 3, 0] : [0, 0, 0],
    config: { duration: 5000 },
    ref: checkPoint2,
  });
  

  const checkPoint3 = useSpringRef();
  const { lenternPosition3, cameraPosition3, cameraLookAt3 } = useSpring({
    lenternPosition3: isClick ? [19, 14, -20] : [0, 0, 0],
    cameraPosition3: isClick ? [0, 0, 0] : [0, 0, 0],
    cameraLookAt3: isClick ? [0, 2, 0] : [0, 0, 0],
    config: { duration: 5000, easeOutSine },
    ref: checkPoint3,
  });

  const checkPoint4 = useSpringRef();
  const { cameraPosition4, cameraLookAt4 } = useSpring({
    cameraPosition4: isClick ? [-22, -28, 0] : [0, 0, 0],
    cameraLookAt4: isClick ? [0, -5, 0] : [0, 0, 0],
    config: { duration: 7000, easing: easeOutSine },
    ref: checkPoint4,
  });

  // x : 30 + 15 + 19 = 64
  // y : 27 + 12 + 14 = 53
  // z : -5 + -15 + -20 = 40
  const checkPoint5 = useSpringRef();
  const { lenternPosition5 } = useSpring({
    lenternPosition5: isClick ? [-64, -58, 30] : [0, 0, 0],
    config: { duration: 1 },
    ref: checkPoint5,
  });

  const checkPoint6 = useSpringRef();
  const { lenternPosition6 } = useSpring({
    lenternPosition6: isClick ? [0, 5, 10] : [0, 0, 0],
    config: { duration: 5000, easing: easeInOutSine },
    ref: checkPoint6,
  });
  
  useChain([checkPoint1, checkPoint2, checkPoint3, checkPoint4, checkPoint5, checkPoint6], [0, 7, 12, 19, 22, 24]);
  
  useFrame((state) => {
    // x =  y={-2} z={52
    const [l_x1, l_y1, l_z1] = lenternPosition1.get();
    const [l_x2, l_y2, l_z2] = lenternPosition2.get();
    const [l_x3, l_y3, l_z3] = lenternPosition3.get();
    const [l_x5, l_y5, l_z5] = lenternPosition5.get();
    const [l_x6, l_y6, l_z6] = lenternPosition6.get();
    
    const [c_x1, c_y1, c_z1] = cameraPosition1.get();
    const [c_x2, c_y2, c_z2] = cameraPosition2.get();
    const [c_x3, c_y3, c_z3] = cameraPosition3.get();
    const [c_x4, c_y4, c_z4] = cameraPosition4.get();
    

    const [cl_x2, cl_y2, cl_z2] = cameraLookAt2.get();
    const [cl_x3, cl_y3, cl_z3] = cameraLookAt3.get();
    const [cl_x4, cl_y4, cl_z4] = cameraLookAt4.get();

    const cameraX = c_x1 + c_x2 + c_x3 + c_x4;
    const cameraY = c_y1 + c_y2 + c_y3 + c_y4;
    state.camera.lookAt(new THREE.Vector3(cameraX, cameraY + cl_y2 + cl_y3 + cl_y4, 0));
    state.camera.position.x = cameraX;
    state.camera.position.y = cameraY;

    ref.current.position.x = l_x1 + l_x2 + l_x3 + l_x5 + l_x6;
    ref.current.position.y = l_y1 + l_y2 + l_y3 + l_y5 + l_y6;
    ref.current.position.z = l_z1 + l_z2 + l_z3 + l_z5 + l_z6;
  });

  useEffect(() => () => {
    closeTimeoutRef.current && closeTimeoutRef.current();
  })


  return (
    <mesh ref={ref} onClick={() => {
      // setIntensity(intensity + 0.1);
      // setCount(prev => prev + 1);
      setIsClick(true);
      closeTimeoutRef.current = setTimeout(() => {
        setIsClick(false);
      }, 30000)
    }}>
      {/* <pointLight distance={10} position={[ x, y - 2.5, z + 1]} intensity={intensity} /> */}
      <pointLight distance={10} position={[ x, y + 5, z + 9]} intensity={intensity} />
      <pointLight position={[ x, y - 2.5, z + 3]} intensity={0.6} />
      {useMemo(() => <LanternOfGLTF x={x} y={y} z={z} url="./lantern.glb"/>, [])}
    </mesh>
  )
}