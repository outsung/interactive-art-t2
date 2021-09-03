import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box } from "@react-three/drei";

import { makeNoise4D } from "fast-simplex-noise";
import Controls from "../Controls";

function rand(start, end) {
  return Math.floor(Math.random() * (end - start + 1) + start);
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function Scene() {
  const _gridSize = {
    x: 15,
    y: 15,
    z: 15,
  };
  const _increment = 0.08;
  const _offset = {
    x: 0,
    y: 0,
    z: 0,
  };

  const _arrowScale = 1;
  const arrowHelperRefs = useRef(
    Array.from(Array(_gridSize.x)).map((d, x) => {
      return Array.from(Array(_gridSize.y)).map((d, y) => {
        return Array.from(Array(_gridSize.z)).map((d, z) => {
          return null;
        });
      });
    })
  );

  const _amountOfParticles = 1000;
  const _particleScale = 0.6;
  const _particleMoveSpeed = 0.5;
  const _particleRotationSpeed = 0.5;
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
              oldT / 50000
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
    // console.log(particleRef.position, position);
    const arrowHelperRef =
      arrowHelperRefs.current[position.x][position.y][position.z];
    rotationEuler.set(
      arrowHelperRef.rotation.x,
      arrowHelperRef.rotation.y,
      arrowHelperRef.rotation.z
    );

    rotationQuaternion.setFromEuler(rotationEuler);
    particleRef.quaternion.rotateTowards(
      rotationQuaternion,
      _particleRotationSpeed * deltaT
    );

    particleRef.position.x +=
      particleRef.rotation.x * _particleMoveSpeed * deltaT;
    particleRef.position.y +=
      particleRef.rotation.y * _particleMoveSpeed * deltaT;
    particleRef.position.z +=
      particleRef.rotation.z * _particleMoveSpeed * deltaT;

    if (particleRef.position.x < 0) {
      particleRef.position.x = _gridSize.x * _arrowScale;
    }
    if (particleRef.position.y < 0) {
      particleRef.position.y = _gridSize.y * _arrowScale;
    }
    if (particleRef.position.z < 0) {
      particleRef.position.z = _gridSize.z * _arrowScale;
    }
    if (particleRef.position.x > _gridSize.x * _arrowScale) {
      particleRef.position.x = 0;
    }
    if (particleRef.position.y > _gridSize.y * _arrowScale) {
      particleRef.position.y = 0;
    }
    if (particleRef.position.z > _gridSize.z * _arrowScale) {
      particleRef.position.z = 0;
    }
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
  console.log({ _amountOfParticles });

  return (
    <group>
      {Array.from(Array(_amountOfParticles)).map((b, i) => {
        return (
          <Box
            ref={(ref) => (particleRef.current[i] = ref)}
            key={i}
            position={_particlePosition[i]}
            scale={_particleScale}
          >
            <meshBasicMaterial
              transparent={true}
              opacity={0.3}
              attach="material"
              color="#fff"
            />
          </Box>
        );
      })}
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
        <Scene />
        <Controls />
        <gridHelper />
      </Canvas>
    </div>
  );
}
