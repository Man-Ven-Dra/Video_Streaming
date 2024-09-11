import VideoPlayer from "./VideoPlayer"
import { useEffect, useRef } from 'react'

function App() {
  const playerRef = useRef(null);
  const videoLink = "http://localhost:4000/uploads/videos/9cb1231d-dc55-4c6c-9d69-bce26519e19a/index.m3u8";

  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL"
      }
    ]
  }

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return(
    <div>
      <div>
        <h1>Video player</h1>
      </div>
      <VideoPlayer
        options={videoPlayerOptions}
        onReady={handlePlayerReady}
      />
    </div>
  )
}

export default App
