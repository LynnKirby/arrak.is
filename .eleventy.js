const execa = require("execa");
const { DateTime } = require("luxon");
const jsbeautify = require("js-beautify");
const htmlmin = require("html-minifier");

module.exports = config => {
  config.setDataDeepMerge(true);
  config.addPassthroughCopy("src/.well-known");

  config.addFilter("htmlDateString", date => {
    return DateTime.fromJSDate(date, { zone: "UTC" }).toFormat("yyyy-LL-dd");
  });

  // Fake markdown-it library that's actually Pandoc
  // TODO: Work on 11ty so you can change template engines
  config.setLibrary("md", {
    set() { /* no-op, not implementing settings */ },
    render(input) {
      const { stdout, stderr } = execa.sync("pandoc", [
        "--from=markdown",
        "--to=html5",
        "--filter=pandoc-citeproc",
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
      output: "dist"
    },
    dataTemplateEngine: "njk",
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "md", "njk", "11ty.js"],
  }
};
