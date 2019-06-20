// Here we're using the data-pseudofocus attribute as a kind-of CSS selector
// based on whether the iframe is active even when it's the inside
// of the iframe that's active, something that can't be done with CSS
// alone. (i.e. the :active selector doesn't apply when iframe source is active).
const applyPseudoFocus = elem => {
  if (!(elem instanceof HTMLIFrameElement)) {
    console.error("iframe-pseudofocus: element is not HTMLIFrameElement: ", elem);
    return;
  }

  document.addEventListener("focus", () => {
    if (elem.dataset["pseudofocus"]) {
      elem.dataset["pseudofocus"] = false;
    }
  });

  document.addEventListener("blur", () => {
    if (document.activeElement === elem) {
      elem.dataset["pseudofocus"] = true;
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.getElementsByTagName("iframe");
  for (let i = 0; i < elements.length; ++i) {
    applyPseudoFocus(elements[i]);
  }
});
