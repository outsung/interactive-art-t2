import React, { useRef, useMemo, Suspense, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, useGLTF } from "@react-three/drei";

import { makeNoise4D } from "fast-simplex-noise";
import Controls from "../Controls";
import { Vector3 } from "three";

const LanternOfGLTF = React.forwardRef(({ url }, ref) => {
  const { scene } = useGLTF(process.env.PUBLIC_URL + url);
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  console.log(copiedScene);

  return useMemo(
    () =>
      copiedScene ? (
        <group
          position={[rand(0, 100), rand(0, 100), rand(0, 100)]}
          ref={ref}
          scale={0.005}
        >
          <primitive object={copiedScene} />
        </group>
      ) : null,
    [copiedScene, ref]
  );
});

function rand(start, end) {
  return Math.floor(Math.random() * (end - start + 1) + start);
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function Scene() {
  const _gridSize = {
    x: 20,
    y: 20,
    z: 20,
  };
  const _increment = 0.008;
  const _offset = {
    x: 0,
    y: 0,
    z: 0,
  };

  const _arrowScale = 1.5;
  const arrowHelperRefs = useRef(
    Array.from(Array(_gridSize.x)).map((d, x) => {
      return Array.from(Array(_gridSize.y)).map((d, y) => {
        return Array.from(Array(_gridSize.z)).map((d, z) => {
          return null;
        });
      });
    })
  );

  const _amountOfParticles = 5;
  const _particleScale = 0.5;
  const _particleMoveSpeed = 3.5;
  const _particleRotationSpeed = 0.2;
  const particleRef = useRef(
    Array.from(Array(_amountOfParticles)).map(() => null)
  );
  // const _particleScale = 0.1;
  const _particlePosition = useMemo(
    () =>
      Array.from(Array(_amountOfParticles)).map((d, z) => {
        return new THREE.Vector3(
          rand(0, _gridSize.x * _arrowScale),
          rand(0, _gridSize.y * _arrowScale),
          rand(0, _gridSize.z * _arrowScale)
        );
      }),
    [_gridSize.x, _gridSize.y, _gridSize.z]
  );
  const [rotationEuler, rotationQuaternion] = useMemo(
    () => [new THREE.Euler(0, 0, 0), new THREE.Quaternion(0, 0, 0, 0)],
    []
  );

  const _noise = makeNoise4D();

  const onFrameOfArrowHelper = (oldT) => {
    let xOff = 0;
    for (let x = 0; x < _gridSize.x; x++) {
      let yOff = 0;
      for (let y = 0; y < _gridSize.y; y++) {
        let zOff = 0;
        for (let z = 0; z < _gridSize.z; z++) {
          const noise =
            _noise(
              xOff + _offset.x,
              yOff + _offset.y,
              zOff + _offset.z,
              oldT / 10000
            ) + 1;
          const direction = new THREE.Vector3(
            Math.cos(noise * Math.PI),
            Math.sin(noise * Math.PI),
            Math.cos(noise * Math.PI)
          );

          const normalDirection = direction.normalize();

          arrowHelperRefs.current[x][y][z].setDirection(normalDirection);
          arrowHelperRefs.current[x][y][z].setColor(
            new THREE.Color(
              normalDirection.x,
              normalDirection.y,
              normalDirection.z,
              0.4
            )
          );
          arrowHelperRefs.current[x][y][z].setLength(1);
          zOff += _increment;
        }
        yOff += _increment;
      }
      xOff += _increment;
    }
  };

  const onFrameForParticle = (deltaT) => {
    for (let i = 0; i < _amountOfParticles; i++) {
      applyRotation(particleRef.current[i], deltaT);
    }
  };

  const applyRotation = (particleRef, deltaT) => {
    const position = new THREE.Vector3(
      Math.floor(
        clamp(particleRef.position.x / _arrowScale, 0, _gridSize.x - 1)
      ),
      Math.floor(
        clamp(particleRef.position.y / _arrowScale, 0, _gridSize.y - 1)
      ),
      Math.floor(
        clamp(particleRef.position.z / _arrowScale, 0, _gridSize.z - 1)
      )
    );
    const arrowHelperRef =
      arrowHelperRefs.current[position.x][position.y][position.z];

    const a = new THREE.Vector3(
      arrowHelperRef.rotation.x,
      arrowHelperRef.rotation.y,
      arrowHelperRef.rotation.z
    ).normalize();
    particleRef.rotation.set(
      arrowHelperRef.rotation.x + a.x * _particleRotationSpeed * deltaT,
      arrowHelperRef.rotation.y + a.y * _particleRotationSpeed * deltaT,
      arrowHelperRef.rotation.z + a.z * _particleRotationSpeed * deltaT
    );

    particleRef.translateOnAxis(
      new THREE.Vector3(1, 1, 1).normalize(),
      _particleMoveSpeed * deltaT
    );

    if (particleRef.position.x < 0) {
      particleRef.position.x = _gridSize.x * _arrowScale;
    } else if (particleRef.position.x > _gridSize.x * _arrowScale) {
      particleRef.position.x = 0;
    }

    if (particleRef.position.y < 0) {
      particleRef.position.y = _gridSize.y * _arrowScale;
    } else if (particleRef.position.y > _gridSize.y * _arrowScale) {
      particleRef.position.y = 0;
    }

    if (particleRef.position.z < 0) {
      particleRef.position.z = _gridSize.z * _arrowScale;
    } else if (particleRef.position.z > _gridSize.z * _arrowScale) {
      particleRef.position.z = 0;
    }

    console.log(particleRef.position.y);

    // quaternion

    // console.log({
    //   arrowHelperRef,
    //   particleRef,
    //   a: rotationQuaternion,
    // });
    // rotationQuaternion.set
    return;
  };

  useFrame((state, delta) => {
    // console.log("a");
    // console.log(state.clock.oldTime);
    onFrameOfArrowHelper(state.clock.oldTime);
    onFrameForParticle(delta);
  });
  // console.log({ _amountOfParticles });

  const [Lenterns, setLenterns] = useState(
    Array.from(Array(_amountOfParticles)).map((b, i) => {
      return (
        // <Box position={[0, 0, 0]} scale={1}>
        //   <meshBasicMaterial attach="material" color="#fff" />
        // </Box>
        <LanternOfGLTF
          key={i}
          url="/lantern.glb"
          ref={(ref) => (particleRef.current[i] = ref)}
        />
      );
    })
  );

  return (
    <group>
      {Lenterns}
      {Array.from(Array(_gridSize.x)).map((d, x) => {
        return Array.from(Array(_gridSize.y)).map((d, y) => {
          return Array.from(Array(_gridSize.z)).map((d, z) => {
            return (
              <arrowHelper
                key={`${x}-${y}-${z}`}
                ref={(ref) => (arrowHelperRefs.current[x][y][z] = ref)}
                position={[x * _arrowScale, y * _arrowScale, z * _arrowScale]}
                args={[new THREE.Vector3(0, 0, 0)]}
                // setLength={(5, 1, 1)}
              />
            );
          });
        });
      })}
    </group>
  );
}

export default function Perlin() {
  return (
    <div style={{ position: "absolute", height: "100%", width: "100%" }}>
      <Canvas
        translate={true}
        onCreated={(state) => state.gl.setClearColor(0xffffff, 0)}
        colorManagement
        shadowMap
        camera={{ position: [0, 0, 77], fov: 60 }}
      >
        <Suspense
          fallback={
            <Box position={[0, 0, 0]} scale={1}>
              <meshBasicMaterial attach="material" color="#fff" />
            </Box>
          }
        >
          <pointLight position={[50, 50, 50]} intensity={1.5} />

          <pointLight position={[0, -10, 0]} intensity={1.5} />

          <pointLight position={[0, -10, 0]} intensity={1.5} />

          <Box position={[0, 0, 0]} scale={1}>
            <meshBasicMaterial attach="material" color="#fff" />
          </Box>
          <Scene />
        </Suspense>
        <Controls />
        <gridHelper />
      </Canvas>
    </div>
  );
}
