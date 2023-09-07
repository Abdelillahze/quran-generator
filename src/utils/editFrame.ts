import Jimp from "jimp";

export default async function editFrame(frame: any) {
  const width = frame.bitmap.width;
  const height = frame.bitmap.height;
  frame.scan(
    0,
    0,
    width,
    height,
    function (this: any, x: number, y: number, idx: number) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];

      this.bitmap.data[idx + 0] = red / 3;
      this.bitmap.data[idx + 1] = green / 3;
      this.bitmap.data[idx + 2] = blue / 3;
    }
  );

  return frame;
}
