// SPDX-License-Identifier: 0BSD

const path = require("path");
const fs = require("fs-extra");
const execa = require("execa");
const { DateTime } = require("luxon");
const jsbeautify = require("js-beautify");
const htmlmin = require("html-minifier");

module.exports = config => {
  config.setDataDeepMerge(true);

  config.addPassthroughCopy("src/assets/image");
  config.addPassthroughCopy("src/assets/font");

  // Override the default `url` filter
  config.addFilter("url", url => {
    if (url === "/") return "/";
    if (url.endsWith("/")) return url.slice(0, -1);
    if (url.endsWith("/index.html")) {
      const sliced = url.slice(0, -"/index.html".length);
      if (sliced === "") return "/";
      return "/";
    }
    return url;
  });

  const formatDate = (date, format) => {
    if (typeof date === "string") {
      return DateTime.fromISO(date, { zone: "UTC" }).toFormat(format);
    }
    if (date instanceof Date) {
      return DateTime.fromJSDate(date, { zone: "UTC" }).toFormat(format);
    }
    throw new Error("invalid date, expected string or Date", date);
  };

  config.addFilter("htmlDate", date => formatDate(date, "yyyy-LL-dd"));

  config.addFilter("readableDate", date => formatDate(date, "dd LLL yyyy"));

  config.addFilter("formatDate", (date, format) => formatDate(date, format));

  const iconPaths = [
    "src/assets/icon",
    "node_modules/@fortawesome/fontawesome-free/svgs/brands",
    "node_modules/@fortawesome/fontawesome-free/svgs/solid",
    "node_modules/@fortawesome/fontawesome-free/svgs/regular",
  ];

  config.addShortcode("icon", id => {
    for (let dir of iconPaths) {
      try {
        const icon = fs.readFileSync(path.resolve(__dirname, dir, `${id}.svg`), { encoding: "utf8" });
        if (icon) return `<span class="Icon">${icon}</span>`;
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
    }

    throw new Error(`could not find icon '${id}'`);
  });

  // Fake markdown-it library that's actually Pandoc
  // TODO: Work on 11ty so you can change template engines
  config.setLibrary("md", {
    set() { /* no-op, not implementing settings */ },
    render(input) {
      const { stdout, stderr } = execa.sync("pandoc", [
        "--from=markdown",
        "--to=html5",
        "--no-highlight",
        "--filter=pandoc-citeproc",
        "--filter=./scripts/pandoc-shiki.js",
      ], { input });

      if (stderr) {
        console.log(`[pandoc] ${stderr}`);
      }

      return stdout;
    },
  });

  // HTML fixer-upper transform. Remove cruft, then beautify. Means I don't have
  // to care about whitespace control in templates.
  config.addTransform("html-beautify", (content, outputPath) => {
    if (outputPath.endsWith(".html")) {
      const cleaned = htmlmin.minify(content, {
        removeComments: true
      });

      return jsbeautify.html_beautify(cleaned, {
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 0,
      });
    }

    return content;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "public",
    },
    passthroughFileCopy: true,
    dataTemplateEngine: "njk",
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    templateFormats: [
      // Real templates
      "html", "md", "njk", "11ty.js",
      // Content
      "jpg", "png",
    ],
  };
};
