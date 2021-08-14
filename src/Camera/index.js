import React, { useState, useRef, useEffect, useCallback } from "react";

import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs";
import * as cocoSSD from "@tensorflow-models/coco-ssd";

import Socket from "../utils/socket";

export default function Camera() {
  const [model, setModel] = useState(null);
  const animationFrameRef = useRef(null);
  const [isDetected, setIsDetected] = useState(false);
  const [detectionArea, setDetectionArea] = useState({
    x: 300,
    y: 300,
    width: 50,
    height: 50,
  });
  const video = useRef(null);
  const canvas = useRef(null);

  const webcamInit = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: "user" },
      })
      .then((stream) => {
        video.current.srcObject = stream;
        video.current.onloadedmetadata = () => {
          video.current.play();
        };
      });
  }, []);

  const renderPredictions = useCallback(
    (predictions) => {
      const ctx = canvas.current.getContext("2d");
      canvas.current.width = video.current.videoWidth;
      canvas.current.height = video.current.videoHeight;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Fonts
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.drawImage(
        video.current,
        0,
        0,
        video.current.videoWidth,
        video.current.videoHeight
      );

      let check = false;

      ctx.strokeStyle = "green";
      ctx.lineWidth = 3;
      // Draw the bounding
      ctx.strokeRect(
        detectionArea.x,
        detectionArea.y,
        detectionArea.width,
        detectionArea.height
      );

      predictions.forEach((prediction) => {
        // Bounding boxes's coordinates and sizes
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        // Bounding box style
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 2;
        // Draw the bounding
        ctx.strokeRect(x, y, width, height);

        // Label background
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

        if (prediction.class === "person") {
          const res = rectCollisionDetection(
            {
              x,
              y,
              width,
              height,
            },
            detectionArea
          );

          if (res) check = true;
        }
      });

      setIsDetected(check);

      predictions.forEach((prediction) => {
        // Write prediction class names
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      });
    },
    [detectionArea]
  );

  const detectFrame = useCallback(
    (video, model) => {
      model.detect(video).then((predictions) => {
        renderPredictions(predictions);
        animationFrameRef.current &&
          cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(() => {
          detectFrame(video, model);
        });
      });
    },
    [renderPredictions]
  );

  const rectCollisionDetection = (rect1, rect2) => {
    if (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (Socket.instance) {
      Socket.instance.emit("animationStart");
    }
  }, [isDetected]);

  useEffect(() => {
    if (model) {
      detectFrame(video.current, model);
    }
  }, [model, detectFrame]);

  useEffect(() => {
    webcamInit();
  }, [webcamInit]);

  return (
    <div
      style={{
        width: window.innerWidth,
        height: window.innerHeight,
        textAlign: "center",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#333",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      >
        <h1 style={{ color: "#fff" }}>사람 인식</h1>
        <p style={{ color: "#fff" }}>초록 범위에 사람이 들어오면 알 수 있음!</p>
      </div>
      <video
        style={{ display: "none" }}
        onLoadedData={async () => {
          const m = await cocoSSD.load({});
          setModel(m);
        }}
        ref={(ref) => (video.current = ref)}
      />

      <canvas
        style={{ border: isDetected ? "5px solid red" : "5px solid #fff" }}
        ref={(ref) => (canvas.current = ref)}
      />
      <div style={{ color: "#fff", marginLeft: "16px" }}>
        <div>
          x :
          <input
            type="number"
            onChange={(e) =>
              setDetectionArea((prev) => ({ ...prev, x: e.target.value }))
            }
            value={detectionArea.x}
          />
        </div>
        <div>
          y :
          <input
            type="number"
            onChange={(e) =>
              setDetectionArea((prev) => ({ ...prev, y: e.target.value }))
            }
            value={detectionArea.y}
          />
        </div>
        <div>
          w :
          <input
            type="number"
            onChange={(e) =>
              setDetectionArea((prev) => ({ ...prev, width: e.target.value }))
            }
            value={detectionArea.width}
          />
        </div>
        <div>
          h :
          <input
            type="number"
            onChange={(e) =>
              setDetectionArea((prev) => ({ ...prev, height: e.target.value }))
            }
            value={detectionArea.height}
          />
        </div>
      </div>
    </div>
  );
}
