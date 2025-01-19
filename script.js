const video = document.getElementById("camera");
const captureButton = document.getElementById("capture");
const switchButton = document.getElementById("switch-camera");
const previewButton = document.getElementById("preview");
const backButton = document.getElementById("back-button");
const gallery = document.getElementById("gallery");
const previewContainer = document.querySelector(".preview-container");
const cameraContainer = document.querySelector(".camera-container");

let currentStream;
let usingFrontCamera = true;

// Initialize images from local storage
let images = JSON.parse(localStorage.getItem("capturedImages")) || [];

// Update gallery and preview button on load
function initializeApp() {
  images.forEach((imageUrl) => addToGallery(imageUrl));
  if (images.length > 0) updatePreviewButton(images[images.length - 1]);
}

// Switch camera
async function switchCamera() {
  usingFrontCamera = !usingFrontCamera;
  await startCamera();
}

// Start camera stream
async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }
  try {
    const constraints = {
      video: {
        facingMode: usingFrontCamera ? "user" : "environment",
      },
    };
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

// Capture image
function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageUrl = canvas.toDataURL("image/png"); // Convert to Base64
  images.push(imageUrl);
  localStorage.setItem("capturedImages", JSON.stringify(images)); // Save to local storage
  updatePreviewButton(imageUrl); // Update preview button
  addToGallery(imageUrl); // Add image to gallery
}

// Update the preview button with the latest image
function updatePreviewButton(imageUrl) {
  previewButton.style.backgroundImage = `url(${imageUrl})`;
}

// Add image to the gallery
function addToGallery(imageUrl) {
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("preview-image");

  const img = document.createElement("img");
  img.src = imageUrl;
  imageContainer.appendChild(img);

  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download";
  downloadButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "captured-image.png";
    link.click();
  });
  imageContainer.appendChild(downloadButton);

  gallery.appendChild(imageContainer);
}

// Clear all images
function clearAllImages() {
  images = [];
  localStorage.removeItem("capturedImages"); // Remove from local storage
  gallery.innerHTML = ""; // Clear gallery
  previewButton.style.backgroundImage = ""; // Reset preview button
}

// Show preview
function showPreview() {
  cameraContainer.style.display = "none";
  previewContainer.style.display = "block";
}

// Hide preview and go back to camera
function hidePreview() {
  previewContainer.style.display = "none";
  cameraContainer.style.display = "block";
}

// Event listeners
captureButton.addEventListener("click", captureImage);
switchButton.addEventListener("click", switchCamera);
previewButton.addEventListener("click", showPreview);
backButton.addEventListener("click", hidePreview);

// Initialize the app on load
initializeApp();

// Add clear all functionality
document.getElementById("clear-all").addEventListener("click", clearAllImages);

// Initialize camera on load
startCamera();
