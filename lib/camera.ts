export function getCameraErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Camera failed to start. Please try again.";
  }

  switch (error.name) {
    case "NotAllowedError":
      return "Camera access was blocked. Allow camera permissions in your browser and reload.";
    case "NotFoundError":
      return "No camera was found on this device.";
    case "NotReadableError":
      return "Another app may be using the camera. Close it and try again.";
    case "OverconstrainedError":
      return "This camera does not support the requested settings. Try again.";
    case "SecurityError":
      return "Camera access requires a secure page. Open the app over HTTPS or localhost.";
    case "AbortError":
      return "Camera setup was interrupted. Please try again.";
    default:
      return error.message || "Camera failed to start. Please try again.";
  }
}

export async function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2) return;

  await new Promise<void>((resolve) => {
    const handleReady = () => {
      video.removeEventListener("loadedmetadata", handleReady);
      resolve();
    };

    video.addEventListener("loadedmetadata", handleReady, { once: true });
  });
}