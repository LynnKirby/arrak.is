# arrak.is

This is my homepage, built with cobbled-together scripts instead of a fancy
static site generator. Why? Code is a creative endeavor and I want the code of
my homepage to reflect my own desires and feelings. 

## Source structure

* `infra` - Web infrastructure. Contains the Terraform configuration for the
`arrak.is` DNS records.

* `scripts` - Build-related scripts. Currently just various Pandoc filters.

* `src` - The actual source of my site.
  * `assets` - Non-template assets that need to be compiled.
  * `content` - Markdown, HTML, and templates.
  * `data` - Raw data used when generating pages.
  * `includes` - Partials, components, etc.
  * `layouts` - Page layouts.
  * `static` - Files copied directly to output.

## How it builds

1. Gulp:

    * copies the `static` directory
    * builds styles and such in `assets`

2. Eleventy compiles templates in `content` using `data`, `layouts`, and
   `includes`.

3. Gulp again. Post-processing of the already built files:

    * Purge CSS of unused styles, inline critical styles.
    * Inline resources marked with `inline` attribute.
    * Enhance `<link rel=preload>` tags by replicating them as headers in the
      Netlify `_headers` file, enabling HTTP/2 server push for those assets.
