// SPDX-License-Identifier: CC0-1.0
// Written 2019 Lynn Kirby

// This script generates a CSS file for Pandoc syntax highlighting, similar to
// what it writes by default into standalone HTML files
//
// Usage:
//
//   pandoc --print-highlight-style=STYLE > STYLE.theme
//   node pandoc-highlight-theme-to-css.js STYLE.theme > STYLE.css

const fs = require("fs");
const process = require("process");

const styleNameToClass = {
  Alert: "al",
  Annotation: "an",
  Attribute: "at",
  BaseN: "bn",
  BuiltIn: "bu",
  ControlFlow: "cf",
  Char: "ch",
  Constant: "cn",
  Comment: "co",
  CommentVar: "cv",
  Documentation: "do",
  DataType: "dt",
  DecVal: "dv",
  Error: "er",
  Extension: "ex",
  Float: "fl",
  Function: "fu",
  Import: "im",
  Information: "in",
  Keyword: "kw",
  Operator: "op",
  Other: "ot",
  Preprocessor: "pp",
  RegionMarker: "re",
  SpecialChar: "sc",
  SpecialString: "sc",
  String: "st",
  Variable: "va",
  VerbatimString: "vs",
  Warning: "wa",
};

const theme = JSON.parse(fs.readFileSync(process.argv[2]));

for (let styleName of Object.keys(theme["text-styles"])) {
  const style = theme["text-styles"][styleName];
  console.log(`/* ${styleName} */`);
  console.log(`code span.${styleNameToClass[styleName]} {`);
  if (style["text-color"])       console.log(`  color: ${style["text-color"]};`);
  if (style["background-color"]) console.log(`  background-color: ${style["background-color"]};`);
  if (style["bold"])             console.log(`  font-weight: bold;`);
  if (style["italic"])           console.log(`  font-style: italic;`);
  if (style["underline"])        console.log(`  text-decoration: underline;`);
  console.log(`}`);
}

console.log("pre.numberSource a.sourceLine::before {");
if (theme["line-number-color"])            console.log(`  color: ${theme["line-number-color"]};`)
if (theme["line-number-background-color"]) console.log(`  background-color: ${theme["line-number-background-color"]};`)
console.log("}")

console.log("div.sourceCode {");
if (theme["text-color"])       console.log(`  color: ${theme["text-color"]};`)
if (theme["background-color"]) console.log(`  background-color: ${theme["background-color"]};`)
console.log("}")
