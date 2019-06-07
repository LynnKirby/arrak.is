// SPDX-License-Identifier: CC0-1.0
// Written 2019 Lynn Kirby
//
// Generate Netlify _headers file to preload the files specified in frontmatter.

module.exports = class {
  data() {
    return {
      permalink: "_headers",
      excludeFromSitemap: true,
    };
  }

  render({ collections }) {
    return collections.all.flatMap(page => {
      let preload = page.data.preload;

      if (preload === null || preload === undefined) return [];

      if (typeof preload === "string") {
        preload = [preload];
      }

      if (!Array.isArray(preload)) {
        throw new Error(`${page.inputPath}: expected "preload" to be a string or array`);
      }

      return preload.flatMap(file => {
        if (!file.startsWith("/")) {
          throw new Error(`${page.inputPath}: only absolute URL preload implemented`);
        }

        let type;

        if (/\.(png|jpe?g|gif|webp|svg)$/.test(file)) {
          type = "image";
        }

        if (!type) {
          throw new Error(`${page.inputPath}: unknown preload file type "${file}"`);
        }

        return `${page.url}\n  Link: <${file}>; rel=preload; as=${type}`;
      });
    }).join("\n");
  }
};
