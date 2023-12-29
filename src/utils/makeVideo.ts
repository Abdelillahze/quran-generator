import fs, { readdirSync } from "fs-extra";
import util from "util";
import getBackground from "./getBackground";
import getVerse from "./getVerse";
import Jimp from "jimp";
import editFrame from "./editFrame";
import getVersesSound from "./getVersesSound";
const { UploadVideo } = require("./uploadVideo");

const debug = false;
const exec = util.promisify(require("child_process").exec);

export default async function makeVideo() {
  try {
    const input = "video.mp4";

    const { verses, surah, reader, readerAr } = await getVerse();
    const start = verses[0].start_time;
    const end = verses[verses.length - 1].end_time;

    const versesLength = end - start;
    const output = `سورة ${surah.name} (${verses[0].ayah}-${
      verses[verses.length - 1].ayah
    }).mp4`;
    console.log(verses, surah);
    await fs.mkdir(`${__dirname}/../../src/raw`);
    await fs.mkdir(`${__dirname}/../../src/raw/frames`);
    await fs.mkdir(`${__dirname}/../../src/raw/edited-frames`);

    await getBackground();
    await getVersesSound(surah.index, reader);
    console.log("decoding");
    await exec(
      `ffmpeg -i ${__dirname}/../../src/raw/${input} ${__dirname}/../../src/raw/frames/%d.png`
    );
    console.log("rendering");

    const frames = readdirSync(`${__dirname}/../../src/raw/frames`);

    for (let i = 1; i <= frames.length; i++) {
      let frame: any = await Jimp.read(
        `${__dirname}/../../src/raw/frames/${i}.png`
      );

      frame = await editFrame(frame);

      await frame.writeAsync(
        `${__dirname}/../../src/raw/edited-frames/${i}.png`
      );
    }
    console.log("enconding");

    await exec(
      `ffmpeg -i ${__dirname}/../../src/raw/edited-frames/%d.png ${__dirname}/../../src/videos/video.mp4`
    );

    await exec(
      `ffmpeg -t ${versesLength}ms -i ${__dirname}/../../src/videos/video.mp4 -ss ${start}ms -to ${end}ms -i ${__dirname}/../../src/raw/audio.mp3 -map 0:v:0 -map 1:a:0 "${__dirname}/../../src/videos/${output}"`
    );
    if (!debug) {
      console.log("removing temp files");
      await fs.remove(`${__dirname}/../../src/raw`);
      await fs.remove(`${__dirname}/../../src/videos/video.mp4`);
    }

    console.log("start uploading");
    UploadVideo(`سورة ${surah.name}`, output, {
      reader: readerAr,
      start: verses[0].ayah,
      end: verses[verses.length - 1].ayah,
    });
    console.log("completed");
  } catch (err) {
    console.log(err);
    if (!debug) {
      await fs.remove(`${__dirname}/../../src/raw/`);
    }
  }
}
