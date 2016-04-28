const INTERVAL = 1000;

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

const recordAndPlay = (mediaRecorder) => {
  const blobs = [];
  let stopped = false;

  mediaRecorder.start(1000);
  mediaRecorder.ondataavailable = (event) => {
    blobs.push(event.data);
    if (stopped === true) {
      let megaBlob = new Blob(blobs, {type: 'video/webm'});
      screen.src = window.URL.createObjectURL(megaBlob);
      recordAndPlay(mediaRecorder);
    }
  };

  setTimeout(() => {
    mediaRecorder.stop();
    stopped = true;
  }, 10000);
};

const handleVideo = (mediaStream) => {
  const opts = {mimeType: 'video/webm', bitsPerSecond: 100000}
  const mediaRecorder = new MediaRecorder(mediaStream, opts);

  recordAndPlay(mediaRecorder);
};

const handleError = (error) => {
  console.log("error:", error);
};

getWebcamStream().then(handleVideo, handleError);
