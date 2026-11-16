// Optional extras. Every page works without this file; it only adds
// (1) the light/dark switch in the header and (2) "Copy" buttons on code blocks.
(function () {
  "use strict";

  var root = document.documentElement;
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  // --- 1. Theme switch ---------------------------------------------------
  // The choice is stored in localStorage under "theme" ("light" or "dark").
  // No stored value means "follow the system". The small script in <head>
  // (templates/base.html) applies a stored choice before the page is drawn.

  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }

  function currentTheme() {
    return root.dataset.theme || (systemDark.matches ? "dark" : "light");
  }

  function applyTheme(theme) {
    // theme is "light", "dark" or null (follow the system).
    if (theme) { root.dataset.theme = theme; } else { delete root.dataset.theme; }
    // Syntax colours live in two stylesheets; enable the matching one.
    var light = document.getElementById("code-light");
    var dark = document.getElementById("code-dark");
    if (light && dark) {
      light.media = theme ? (theme === "light" ? "all" : "not all") : "(prefers-color-scheme: light)";
      dark.media = theme ? (theme === "dark" ? "all" : "not all") : "(prefers-color-scheme: dark)";
    }
  }

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    var label = function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      toggle.setAttribute("aria-label", "Switch to " + next + " theme");
      toggle.title = "Switch to " + next + " theme";
    };
    toggle.hidden = false;
    label();
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      // Choosing what the system already prefers clears the override, so the
      // site goes back to following the system setting.
      var store = next === (systemDark.matches ? "dark" : "light") ? null : next;
      try {
        if (store) { localStorage.setItem("theme", store); } else { localStorage.removeItem("theme"); }
      } catch (e) { /* private mode: the choice lasts for this page only */ }
      applyTheme(store);
      label();
    });
    systemDark.addEventListener("change", label);
  }

  // --- 2. Copy buttons on code blocks ------------------------------------

  if (navigator.clipboard) {
    document.querySelectorAll(".prose pre").forEach(function (pre) {
      var wrap = document.createElement("div");
      wrap.className = "code-wrap";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "copy-button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code to clipboard");
      wrap.appendChild(button);

      button.addEventListener("click", function () {
        // Copy the code without line numbers.
        var clone = pre.cloneNode(true);
        clone.querySelectorAll(".giallo-ln").forEach(function (n) { n.remove(); });
        navigator.clipboard.writeText(clone.textContent.replace(/\n$/, "")).then(function () {
          button.textContent = "Copied";
          setTimeout(function () { button.textContent = "Copy"; }, 1500);
        }, function () {
          button.textContent = "Failed";
          setTimeout(function () { button.textContent = "Copy"; }, 1500);
        });
      });
    });
  }
})();
