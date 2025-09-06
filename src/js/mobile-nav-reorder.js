(() => {
  console.log("MobileNav script initiated");

  window.Skyforest = window.Skyforest || {};

  function injectCSS() {
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

        /* Center logo properly */
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

        #skyforest-sticky-header nav.houfy-default-navbar a[href*="book"],
        #skyforest-sticky-header nav.houfy-default-navbar button {
          display: none !important;
        }
      }
    `;

    const styleEl = document.createElement("style");
    styleEl.id = "mobile-nav-style";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    console.log("✅ MobileNav CSS injected (centered logo with flex)");
  }

  function removeCSS() {
    const styleEl = document.getElementById("mobile-nav-style");
    if (styleEl) {
      styleEl.remove();
      console.log("🧹 MobileNav CSS removed");
    }
  }

  function arrangeMobileNav() {
    if (window.innerWidth > 768) {
      removeMobileNav();
      removeCSS();
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

    injectCSS();

    // Dynamically match widths (hamburger = book button)
    const toggle = row.querySelector(".navbar-toggle");
    if (toggle && bookBtn) {
      const btnWidth = bookBtn.offsetWidth;
      toggle.style.flex = `0 0 ${btnWidth}px`;
      bookBtn.style.flex = `0 0 ${btnWidth}px`;
    }

    console.log("✅ MobileNav arranged safely: [☰] [Logo] [Book]");
  }

  function removeMobileNav() {
    const bookBtn = document.querySelector("#skyforest-sticky-header .skyforest-book-btn");
    if (bookBtn) {
      bookBtn.remove();
      console.log("🧹 MobileNav Book button removed");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    arrangeMobileNav();

    const observer = new MutationObserver(() => {
      arrangeMobileNav();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.addEventListener("resize", arrangeMobileNav);
})();
