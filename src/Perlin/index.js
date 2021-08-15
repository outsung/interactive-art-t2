import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

import { makeNoise3D } from "fast-simplex-noise";
import Controls from "../Controls";
import perlinNoise3d from "perlin-noise-3d";

let a = 1;

function Scene() {
  const _gridSize = {
    x: 10,
    y: 10,
    z: 10,
  };
  const _increment = 6.18;
  const _offset = {
    x: 10,
    y: 10,
    z: 10,
  };

  const arrowHelperRefs = useRef(
    Array.from(Array(_gridSize.x)).map((d, x) => {
      return Array.from(Array(_gridSize.y)).map((d, y) => {
        return Array.from(Array(_gridSize.z)).map((d, z) => {
          return null;
        });
      });
    })
  );
  const _noise = new perlinNoise3d();

  const onFrame = (d) => {
    _noise.noiseSeed(a++);

    let xOff = 0;
    for (let x = 0; x < _gridSize.x; x++) {
      let yOff = 0;
      for (let y = 0; y < _gridSize.y; y++) {
        let zOff = 0;
        for (let z = 0; z < _gridSize.z; z++) {
          const noise = _noise.get(xOff, yOff, zOff) * 1;
          const direction = new THREE.Vector3(
            Math.cos(noise, Math.PI),
            Math.sin(noise, Math.PI),
            Math.cos(noise, Math.PI)
          );

          //   console.log({ ref: arrowHelperRefs.current[x][y][z], direction });

          arrowHelperRefs.current[x][y][z].setDirection(direction);
          arrowHelperRefs.current[x][y][z].setLength(1);
          zOff += _increment;
        }
        yOff += _increment;
      }
      xOff += _increment;
    }
  };

  useFrame((state, delta) => {
    console.log("a");
    // console.log(state.clock.oldTime);
    onFrame(state.clock.oldTime);
  });

  return (
    <group onClick={onFrame}>
      {Array.from(Array(_gridSize.x)).map((d, x) => {
        return Array.from(Array(_gridSize.y)).map((d, y) => {
          return Array.from(Array(_gridSize.z)).map((d, z) => {
            return (
              <arrowHelper
                ref={(ref) => (arrowHelperRefs.current[x][y][z] = ref)}
                position={[x, y, z]}
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
