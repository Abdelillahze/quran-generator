import axios from "axios";
import getVerseTiming from "./getVerseTiming";

export default async function getVerse() {
  const randomSurah = Math.ceil(Math.random() * 114);
  const res = await axios.get(
    `https://mp3quran.net/api/v3/ayat_timing?surah=${randomSurah}&read=5`
  );
  const surahName = (
    await axios.get("https://mp3quran.net/api/v3/suwar?language=ar")
  ).data.suwar.find((surah: any) => surah.id === randomSurah).name;
  const versesData = await res.data;
  const timedVerses = await getVerseTiming(versesData);
  const verses = await Promise.all(
    timedVerses.map(async (verse) => {
      const res = await axios.get(
        `http://api.alquran.cloud/v1/ayah/${randomSurah}:${verse.ayah}`
      );
      const data = await res.data;

      verse.text = data.data.text;
      return verse;
    })
  );

  return {
    verses,
    surah: { index: randomSurah, name: surahName },
    reader: "balilah",
  };
}
