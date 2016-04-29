const CHUNK_INTERVAL = 1000;
const DELAY = 10 * 1000;

const screen = document.getElementById('screen');

const getWebcamStream = () => {
  const options = {
    video: true,
    permissions: {
      description: 'Please?!'
    }
  }
  return new Promise((resolve, reject) => {
    navigator.webkitGetUserMedia(options, resolve, reject);
  });
};

const recordAndPlay = (mediaRecorder) => {
  const blobs = [];
  let stopped = false;

  mediaRecorder.start(CHUNK_INTERVAL);
  mediaRecorder.ondataavailable = (event) => {
    blobs.push(event.data);
    if (stopped === true) {
      let megaBlob = new Blob(blobs, {type: 'video/webm'});
      screen.src = window.URL.createObjectURL(megaBlob);
      recordAndPlay(mediaRecorder);
      dispatch(megaBlob);
    }
  };

  setTimeout(() => {
    mediaRecorder.stop();
    stopped = true;
  }, DELAY);
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

// Change Filters.
document.getElementById('filter').addEventListener('change', (event) => {
  screen.style.webkitFilter = `url(#${event.target.value})`;
});

// WebRTC config.
const dataChannel = new DataChannel();
dataChannel.userid = Math.floor(Math.random() * 100000);

// Pusher Setup.
const pusher = new Pusher('71d7257356f3239c0f33', {
  cluster: 'eu',
  encrypted: true
});
pusher.log = console.log.bind(console);

let socketId = null;

// WebRTC Signaling.
pusher.connection.bind('state_change', (states) => {
  switch (states.current) {
    case 'connected':
      socketId = pusher.connection.socket_id;
      break;
    case 'disconnected':
    case 'failed':
    case 'unavailable':
      break;
  }
});

dataChannel.openSignalingChannel = (config) => {
  const channel = config.channel || this.channel || 'default-channel'; // !?!?
  const socket = {
    channel: channel,
    send: (message) => {
      const request = new Request('/message', {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({
          socketId: socketId,
          channel: channel,
          message: message
        })
      });

      fetch(request).catch((error) => {
        console.log('error:', error);
      });
    }
  };

  const pusherChannel = pusher.subscribe(channel);
  pusherChannel.bind('pusher:subscription_succeeded', () => {
    if (config.callback) {
      config.callback(socket);
    }
  });
  pusherChannel.bind('message', (message) => {
    config.onmessage(message);
  });
};

// WebRTC Communication
const mainChannel = 'main-channel';

if (window.location.hash === '#server') {
  dataChannel.open(mainChannel);
}
dataChannel.connect(mainChannel);

dataChannel.onopen = (userId) => {
  console.log('A new user joined', userId);
};
dataChannel.onmessage = (message, userId) => {
  console.log('onmessage: ', message, userId);
}

const dispatch = (blob) => {
  dataChannel.send(blob, mainChannel);
};
