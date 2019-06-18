# arrak.is

This is my homepage, built with cobbled-together scripts instead of a fancy
static site generator. Why? Code is a creative endeavor and I want the code of
my homepage to reflect my own desires and feelings. 

## Source structure

* `scripts` - Build-related scripts. Currently just various Pandoc filters.

* `src` - The actual source of my site.
  * `assets` - Non-template assets that need to be compiled.
  * `content` - Markdown, HTML, and templates.
  * `data` - Raw data used when generating pages.
  * `includes` - Partials, components, etc.
  * `layouts` - Page layouts.
  * `static` - Files copied directly to output.
