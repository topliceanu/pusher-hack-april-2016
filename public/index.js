const screen = document.getElementById('screen');

const getWebcamStream = () => {
  const options = {
    video: true,
    permissions: {
      description: 'Please?!'
    }
  }
  //return navigator.mediaDevices.getUserMedia(options);
  //return MediaDevices.getUserMedia(options);
  return new Promise((resolve, reject) => {
    navigator.webkitGetUserMedia(options, resolve, reject);
  });
};

const handleVideo = (videoTag, mediaStream) => {
  videoTag.src = window.URL.createObjectURL(mediaStream);
};

const handleError = (error) => {
  console.log("error:", error);
};

getWebcamStream().then((mediaStream) => {
  handleVideo(screen, mediaStream);
}, handleError);
