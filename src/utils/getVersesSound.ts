import http from "https";
import { createWriteStream } from "fs";

export default async function getVersesSound(surah: number, reader: string) {
  const file = createWriteStream("temp/audio.mp3");
  return await new Promise((resolve: any, reject: any) => {
    try {
      http.get(
        `https://server6.mp3quran.net/${reader}/${
          surah < 10 ? `00${surah}` : surah < 100 ? `0${surah}` : surah
        }.mp3`,
        (response: any) => {
          response.pipe(file);
          file.on("finish", () => {
            resolve();
          });
        }
      );
    } catch (err) {
      console.log(err);
      reject();
    }
  });
}
