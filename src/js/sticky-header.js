(() => {
  console.log("StickyHeader script loaded");

  window.Skyforest = window.Skyforest || {};

  window.Skyforest.StickyHeader = {
    injectCSS: () => {
      if (document.getElementById("sticky-header-style")) return;

      const css = `
        #skyforest-sticky-header {
          position: fixed !important;
          top: var(--promo-height, 0px); /* offset by promo banner if present */
          left: 0;
          right: 0;
          z-index: 10000 !important;
          background: #ffffff !important;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
        }

        body {
          padding-top: calc(var(--promo-height, 0px) + var(--nav-height, 0px));
        }
      `;

      const styleEl = document.createElement("style");
      styleEl.id = "sticky-header-style";
      styleEl.textContent = css;
      document.head.appendChild(styleEl);

      console.log("✅ StickyHeader CSS injected");
    },

    applySticky: (nav) => {
      if (!nav) return;

      // Already processed?
      if (nav.id === "skyforest-sticky-header") return;

      // Remove Houfy’s sticky-related classes
      nav.classList.remove("navbar-static-top", "houfy-default-navbar", "hweb-navbar");

      // Force our ID
      nav.id = "skyforest-sticky-header";

      // Calculate nav height and set CSS var
      const navHeight = nav.offsetHeight;
      document.documentElement.style.setProperty("--nav-height", `${navHeight}px`);

      console.log("✅ StickyHeader applied, height =", navHeight);
    },

    observeForNav: () => {
      const observer = new MutationObserver(() => {
        const nav = document.querySelector(
          "#skyforest-sticky-header, .navbar.navbar-static-top, .houfy-default-navbar, .hweb-navbar"
        );
        if (nav) {
          window.Skyforest.StickyHeader.applySticky(nav);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      console.log("👀 StickyHeader observer running");
    },

    init: () => {
      window.Skyforest.StickyHeader.injectCSS();

      // Try immediately
      const nav = document.querySelector(
        ".navbar.navbar-static-top, .houfy-default-navbar, .hweb-navbar"
      );
      if (nav) {
        window.Skyforest.StickyHeader.applySticky(nav);
      }

      // Watch for Houfy replacing nav
      window.Skyforest.StickyHeader.observeForNav();

      console.log("✅ StickyHeader initialized");
    }
  };

  // Auto-init on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    window.Skyforest.StickyHeader.init();
  });
})();
