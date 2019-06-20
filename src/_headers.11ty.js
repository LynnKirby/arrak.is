// SPDX-License-Identifier: 0BSD
// Written 2019 Lynn Kirby
//
// Generate Netlify _headers file from frontmatter.


module.exports = class {
  data() {
    return {
      permalink: "_headers",
      eleventyExcludeFromCollections: true,
    };
  }

  render({ collections }) {
    return collections.all.flatMap(page => {
      let headers = page.data.headers;

      if (headers === null || headers === undefined) return [];

      if (typeof headers !== "object") {
        throw new Error(`${page.inputPath}: expected "headers" to be an object`);
      }

      const headerStrings = Object.keys(headers).flatMap(key => {
        let values = headers[key];

        if (typeof values === "string") {
          values = [values];
        }

        if (!Array.isArray(values)) {
          throw new Error(`${page.inputPath}: expected header value to be a string or array`);
        }

        return values.map(value => `  ${key}: ${value}\n`);
      });

      return `${page.url}\n${headerStrings}`;
    }).join("\n");
  }
};
