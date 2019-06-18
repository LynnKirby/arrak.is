#!/usr/bin/env node
// SPDX-License-Identifier: 0BSD
// Written 2019 Lynn Kirby
//
// Pandoc filter that highlights code blocks using Shiki:
// https://github.com/octref/shiki

const shiki = require("shiki");
const { languages } = require("shiki-languages");
const pandoc = require("pandoc-filter");
const { RawBlock } = pandoc;

// A map of aliases to the proper language ID
const langAliasMap = new Map(languages.flatMap(lang => {
  const aliases = lang.aliases.map(a => [a, lang.id]);

  return [
    ...aliases,
    [lang.id, lang.id]
  ];
}));

const theme = shiki.getTheme("light_vs");
const highlighterPromise = shiki.getHighlighter({ theme });

pandoc.toJSONFilterAsync(async (type, value) => {
  if (type !== "CodeBlock") return;

  // Weird destructuring going on here ¯\_(ツ)_/¯
  const [[,[alias]], code] = value;
  const lang = langAliasMap.get(alias);

  if (!lang) {
    throw new Error(`"Cannot syntax highlight unknown language ${alias}`);
  }

  const highlighter = await highlighterPromise;
  const html = codeToHtml(highlighter, code, lang);
	return RawBlock("html", html);
});

// Below functions are adapted from shiki/src/renderer.ts
// SPDX-License-Identifier: MIT
function codeToHtml(highlighter, code, lang) {
  const lines = highlighter.codeToThemedTokens(code, lang);

  let html = "";
  html += `<pre style="background-color: ${theme.bg}">`;
  html += `<code class="language-${lang}">`;

  lines.forEach(l => {
    if (l.length === 0) {
      html += `\n`;
    } else {
      l.forEach(token => {
        html += `<span style="color: ${token.color}">${escapeHtml(token.content)}</span>`
      });
      html += `\n`;
    }
  });
  html = html.replace(/\n*$/, "") // Get rid of final new lines
  html += `</code></pre>`

  return html;
}

function escapeHtml(html) {
  return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
