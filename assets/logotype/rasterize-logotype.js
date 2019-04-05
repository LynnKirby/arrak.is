// SPDX-License-Identifer: CC0-1.0
// Written 2019 Lynn Kirby

const fs = require("fs-extra");
const path = require("path");
const process = require("process");
const execa = require("execa");

async function rasterize(width, color, outputFile) {
  const svg = await fs.readFile(path.join(__dirname, "logotype.svg"), { encoding: "utf8" });

  const updatedSVG = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <style>
        #logotype {
          fill: ${color};
        }
      </style>
      ${svg}
    </svg>
  `;

  await execa("inkscape", [
    "--file", "-",
    "--export-png", outputFile,
    "--export-width", width,
  ], { input: updatedSVG });

  console.log(`Wrote image to ${outputFile}`);
}

async function main() {
  if (process.argv.length !== 5) {
    console.log(`Usage: ${name} <pixel width> <CSS color> <output file>`);
    return;
  }

  const [node, script, width, color, outputFile] = process.argv;
  await rasterize(Number.parseInt(width), color, outputFile);
}

main().catch(error => console.error(error));
