// SPDX-License-Identifier: CC0-1.0
// Written 2019 Lynn Kirby
//
// Generate Netlify _redirects file based on redirects specified in frontmatter.

module.exports = class {
  data() {
    return {
      permalink: "_redirects",
      excludeFromSitemap: true,
    };
  }

  render({ collections }) {
    return collections.all.flatMap(page => {
      let redirects = page.data.redirect;
      const to = page.url;

      if (redirects === null || redirects === undefined) return [];

      if (typeof redirects === "string") {
        redirects = [redirects];
      }

      if (!Array.isArray(redirects)) {
        throw new Error(`${page.inputPath}: expected "redirect" to be a string or array`);
      }

      return redirects.flatMap(from => {
        if (!from.startsWith("/")) {
          throw new Error(`${page.inputPath}: only absolute URL redirects implemented`);
        }

        return `${from} ${to}`;
      });
    }).join("\n");
  }
};
