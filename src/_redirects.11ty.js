module.exports = class {
  data() {
    return {
      permalink: "_redirects",
      excludeFromSitemap: true,
    };
  }

  render({ collections }) {
    return collections.all.flatMap(page => {
      const from = page.data.redirect;
      const to = page.url;

      if (typeof from !== "string") return [];

      if (!from.startsWith("/")) {
        throw new Error(`${page.inputPath}: only absolute URL redirects implemented`);
      }

      return `${from} ${to}`;
    }).join("\n");
  }
};
