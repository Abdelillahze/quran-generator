import fs, { readdirSync } from "fs-extra";
import util from "util";
import getBackground from "./getBackground";
import getVerse from "./getVerse";
import Jimp from "jimp";
import editFrame from "./editFrame";
import getVersesSound from "./getVersesSound";
import { UploadVideo } from "./uploadVideo";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

const debug = false;

ffmpeg.setFfmpegPath(ffmpegPath as string);

export default async function makeVideo() {
  try {
    const { verses, surah, reader, readerAr } = await getVerse();
    const start = verses[0].start_time;
    const end = verses[verses.length - 1].end_time;

    const versesDuration = end - start;
    const output = `سورة ${surah.name} (${verses[0].ayah}-${
      verses[verses.length - 1].ayah
    }).mp4`;
    console.log(verses, surah);
    await fs.mkdir("temp");
    await fs.mkdir("temp/raw-frames");
    await fs.mkdir("temp/edited-frames");

    const input = (await getBackground(versesDuration)) as string;
    await getVersesSound(surah.index, reader);

    console.log("decoding");
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .addInput(input)
        .outputOptions([`-t ${versesDuration}ms`])
        .output("temp/raw-frames/%d.png")
        .on("end", () => {
          console.log("rendering");
          resolve();
        })
        .on("error", (err) => {
          console.log(err);
          reject();
        })
        .run();
    });

    const frames = readdirSync(`temp/raw-frames`);

    for (let i = 1; i <= frames.length; i++) {
      let frame: any = await Jimp.read(`temp/raw-frames/${i}.png`);

      frame = await editFrame(frame);

      await frame.writeAsync(`temp/edited-frames/${i}.png`);
    }
    console.log("enconding");

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .addInput(`temp/edited-frames/%d.png`)
        .videoFilters([`setpts=0.825*PTS`])
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputFormat("mp4")
        .addInputOptions([`-start_number 1`])
        .outputOptions([`-r 30`])
        .output(`temp/no-audio.mp4`)
        .on("end", () => {
          console.log("addidng audio");
          resolve();
        })
        .on("error", (err) => {
          console.log(err);
          reject();
        })
        .run();
    });

    // await exec(
    //   `ffmpeg -i ${__dirname}/../../src/raw/edited-frames/%d.png ${__dirname}/../../src/videos/video.mp4`
    // );

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .addInput(`temp/no-audio.mp4`)
        .addInput(`temp/audio.mp3`)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputFormat("mp4")
        .output(`output.mp4`)
        .outputOptions([
          `-map 0:v:0`,
          `-map 1:a:0`,
          `-pix_fmt yuv420p`,
          `-t ${versesDuration}ms`,
        ])
        .on("end", () => {
          console.log("finished");
          resolve();
        })
        .on("error", (err) => {
          console.log(err);
          reject();
        })
        .run();
    });

    // await exec(
    //   `ffmpeg -t ${versesDuration}ms -i ${__dirname}/../../src/videos/video.mp4 -ss ${start}ms -to ${end}ms -i ${__dirname}/../../src/raw/audio.mp3 -map 0:v:0 -map 1:a:0 "${__dirname}/../../src/videos/${output}"`
    // );
    // if (!debug) {
    //   console.log("removing temp files");
    //   await fs.remove(`${__dirname}/../../src/raw`);
    //   await fs.remove(`${__dirname}/../../src/videos/video.mp4`);
    // }

    console.log("start uploading");
    UploadVideo(`سورة ${surah.name}`, output, {
      reader: readerAr,
      start: verses[0].ayah,
      end: verses[verses.length - 1].ayah,
    });
    console.log("completed");
  } catch (err) {
    console.log(err);
    // if (!debug) {
    //   await fs.remove(`${__dirname}/../../src/raw/`);
    // }
  }
}
