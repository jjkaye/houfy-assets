(() => {
  console.log("MobileNav script loaded");

  window.Skyforest = window.Skyforest || {};
  window.Skyforest.MobileNav = {
    injectCSS: () => {
      if (document.getElementById("mobile-nav-style")) return;

      const css = `
        @media (max-width: 768px) {
          #skyforest-sticky-header .mobile-nav-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100%;
            padding: 0px 12px;
          }

          #skyforest-sticky-header .navbar-toggle,
          #skyforest-sticky-header .navbar-brand {
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Center logo */
          #skyforest-sticky-header .navbar-brand {
            flex: 1;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
          }

          #skyforest-sticky-header .navbar-brand img {
            max-height: 28px;
            width: auto;
            margin: 0 auto;
          }

          #skyforest-sticky-header .skyforest-book-btn {
            background: #ffb81c;
            color: #000;
            font-weight: 700;
            text-transform: uppercase;
            padding: 6px 12px;
            border: 2px solid #000;
            font-size: 14px;
            border-radius: 2px;
            text-align: center;
            white-space: nowrap;
          }

          #skyforest-sticky-header .skyforest-book-btn:hover {
            background: #e6a600;
          }

          /* Remove Houfy's duplicate Book */
          #skyforest-sticky-header nav.houfy-default-navbar a[href*="book"],
          #skyforest-sticky-header nav.houfy-default-navbar button {
            display: none !important;
          }

          /* Fix dropdown so it overlays instead of pushing */
          #skyforest-sticky-header #hnavbar {
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            background-color: #ffffff !important;
            z-index: 99999 !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
            padding: 16px !important;

            /* Hidden by default */
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            transition: opacity 0.3s ease-in-out;
          }

          /* Shown when Houfy applies collapse/show classes */
          #skyforest-sticky-header #hnavbar.in,
          #skyforest-sticky-header #hnavbar.show {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        }
      `;

      const styleEl = document.createElement("style");
      styleEl.id = "mobile-nav-style";
      styleEl.textContent = css;
      document.head.appendChild(styleEl);

      console.log("✅ MobileNav CSS injected");
    },

    removeCSS: () => {
      const styleEl = document.getElementById("mobile-nav-style");
      if (styleEl) {
        styleEl.remove();
        console.log("🧹 MobileNav CSS removed");
      }
    },

    arrange: () => {
      if (window.innerWidth > 768) {
        window.Skyforest.MobileNav.remove();
        window.Skyforest.MobileNav.removeCSS();
        return;
      }

      const container = document.querySelector("#skyforest-sticky-header .container");
      if (!container) {
        console.warn("⚠️ MobileNav: container not found yet");
        return;
      }

      let row = container.querySelector(".mobile-nav-row");
      if (!row) {
        row = document.createElement("div");
        row.className = "mobile-nav-row";

        const brand = container.querySelector(".navbar-brand");
        const toggle = container.querySelector(".navbar-toggle");

        if (brand && toggle) {
          row.appendChild(toggle);
          row.appendChild(brand);
          container.insertBefore(row, container.firstChild);
        }
      }

      let bookBtn = row.querySelector(".skyforest-book-btn");
      if (!bookBtn) {
        bookBtn = document.createElement("a");
        bookBtn.className = "skyforest-book-btn";
        bookBtn.href = "/book";
        bookBtn.innerText = "Book";

        bookBtn.addEventListener("click", () => {
          if (typeof gtag === "function") {
            gtag("event", "header_book_click", {
              location: "mobile_nav",
              element: "book_button",
              url: bookBtn.href
            });
          }
          console.log("📊 GA Event fired: header_book_click (mobile_nav)");
        });

        row.appendChild(bookBtn);
      }

      window.Skyforest.MobileNav.injectCSS();

      // Match hamburger and book widths
      const toggle = row.querySelector(".navbar-toggle");
      if (toggle && bookBtn) {
        const btnWidth = bookBtn.offsetWidth;
        toggle.style.flex = `0 0 ${btnWidth}px`;
        bookBtn.style.flex = `0 0 ${btnWidth}px`;
      }

      console.log("✅ MobileNav arranged safely: [☰] [Logo] [Book]");
    },

    remove: () => {
      const bookBtn = document.querySelector("#skyforest-sticky-header .skyforest-book-btn");
      if (bookBtn) {
        bookBtn.remove();
        console.log("🧹 MobileNav Book button removed");
      }
    },

    init: () => {
      console.log("🚀 MobileNav.init called");

      window.Skyforest.MobileNav.arrange();

      const observer = new MutationObserver(() => {
        window.Skyforest.MobileNav.arrange();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      window.addEventListener("resize", window.Skyforest.MobileNav.arrange);
    }
  };

  // Auto-init
  // Auto-init on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    window.Skyforest.MobileNav.init();
  });
})();
