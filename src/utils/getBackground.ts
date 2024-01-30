import axios from "axios";
import { createWriteStream, writeFile } from "fs";
import ytdl from "ytdl-core";

export default async function getBackground(duration: number) {
  try {
    const res = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=PLl61xCzMxdd1cLkKlbAFktCXUu6ORnZzM&key=${process.env.API_KEY}`
    );
    const videos = await res.data?.items;
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoId = randomVideo.snippet.resourceId.videoId;
    const videoInfo = await ytdl.getInfo(
      `https://youtube.com/watch?v=${videoId}`
    );
    const url = ytdl.chooseFormat(videoInfo.formats, {
      quality: "highest",
    }).url;
    const videoLength =
      +videoInfo.player_response.videoDetails.lengthSeconds * 1000;

    console.log(duration, videoLength, url);
    if (duration > videoLength) {
      return getBackground(duration);
    } else {
      return url;
    }
  } catch (err) {
    console.log(err);
  }
}
