// SPDX-License-Identifer: CC0-1.0
// Written 2019 Lynn Kirby

const fs = require("fs-extra");
const path = require("path");
const process = require("process");
const sharp = require("sharp");

async function main(argv) {
  if (argv.length !== 5) {
    console.log(`Usage: ${name} <pixel width> <CSS color> <output file>`);
    return;
  }

  const width = Number.parseInt(argv[2]);
  const color = argv[3];
  const output = argv[4];
  const svg = await fs.readFile(path.join(__dirname, "logotype.svg"), { encoding: "utf8" });

  // Since Sharp just rasterizes the SVG immediately and doesn't perform any
  // SVG-aware scaling, we have to do it ourselves.
  // TODO: Replace this with a wrapper SVG that embeds the file instead of
  // using magic strings.
  const baseWidth = 310;
  const baseHeight = 56;
  const scale = width <= baseWidth ? 1 : Math.ceil((width / baseWidth) * 1.1);
  const newWidth = baseWidth * scale;
  const newHeight = baseHeight * scale;
  const updatedSVG = svg
    .replace('<g fill="#000000">', `<g fill="${color}" transform="scale(${scale})">`)
    .replace('viewBox="0 0 310 56"', `viewBox="0 0 ${newWidth} ${newHeight}"`);


  await sharp(Buffer.from(updatedSVG, "utf8"))
    .resize(width)
    .png()
    .toFile(output);

  console.log(`Wrote image to ${output}`);
}

main(process.argv).catch(error => console.error(error));
