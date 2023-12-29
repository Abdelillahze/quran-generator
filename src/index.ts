import makeVideo from "./utils/makeVideo";
import dotenv from "dotenv";

dotenv.config();

setInterval(() => {
  try {
    makeVideo();
  } catch (e) {
    console.log(e);
  }
}, 24 * 3600);
