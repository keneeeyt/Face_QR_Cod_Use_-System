import * as faceapi from "face-api.js";

export const loadModels = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models");
};

export const getFaceDescriptor = async (videoElement: HTMLVideoElement) => {
  const detections = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detections?.descriptor || null;
};

export const drawFace = async (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
  const displaySize = { width: videoElement.width, height: videoElement.height };
  faceapi.matchDimensions(canvasElement, displaySize);

  const detections = await faceapi
    .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  const resizedDetections = faceapi.resizeResults(detections, displaySize);

  const context = canvasElement.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear canvas
  }

  faceapi.draw.drawDetections(canvasElement, resizedDetections);
  faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetections);
};