interface verse {
  ayah: number;
  polygon: string;
  start_time: number;
  end_time: number;
  x: string;
  y: string;
  page: string;
  text?: string;
}

export default async function getVerseTiming(verses: verse[]) {
  const result = [];
  let randomVerse = Math.floor(Math.random() * verses.length);
  const limit = 6_000_0;
  let versesLong = 0;
  while (versesLong < limit) {
    const verse = verses[randomVerse];
    const verseLong = verse.end_time - verse.start_time;

    versesLong += verseLong;
    if (versesLong > limit) {
      break;
    }
    result.push(verse);
    if (randomVerse + 1 < verses.length) {
      randomVerse++;
    } else {
      break;
    }
  }

  if (result.length === 0 || versesLong < 25_000) {
    return getVerseTiming(verses);
  }

  return result;
}
