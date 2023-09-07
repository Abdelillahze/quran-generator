import axios from "axios";
import { createWriteStream, writeFile } from "fs";
import ytdl from "ytdl-core";

export default async function getBackground() {
  try {
    const res = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=PLl61xCzMxdd1cLkKlbAFktCXUu6ORnZzM&key=${process.env.API_KEY}`
    );
    const videos = await res.data?.items;
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoId = randomVideo.snippet.resourceId.videoId;
    const video = await ytdl.getBasicInfo(
      `https://youtube.com/watch?v=${videoId}`
    );
    // const videoLength =
    //   +video.player_response.videoDetails.lengthSeconds * 1000;
    // const start = videoLength - long;
    return await new Promise((resolve: any): void => {
      // wait
      ytdl(`https://youtube.com/watch?v=${videoId}`)
        .pipe(createWriteStream("src/raw/video.mp4"))
        .on("close", () => {
          resolve();
        });
    });
  } catch (err) {
    console.log(err);
  }
}
