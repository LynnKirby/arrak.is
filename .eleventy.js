const execa = require("execa");
const { DateTime } = require("luxon");

module.exports = config => {
  config.addPassthroughCopy("src/.well-known");

  config.addFilter("htmlDateString", date => {
    return DateTime.fromJSDate(date).toFormat("yyyy-LL-dd");
  });

  // Fake markdown-it library that's actually Pandoc
  // TODO: Work on 11ty so you can change template engines
  config.setLibrary("md", {
    set() { /* no-op, not implementing settings */ },
    render(input) {
      const { stdout } = execa.sync("pandoc", ["--from=markdown", "--to=html5"], { input });
      return stdout;
    },
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
