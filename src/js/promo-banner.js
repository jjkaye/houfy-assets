(() => {
  console.log("PromoBanner script loaded");

  window.Skyforest = window.Skyforest || {};

  window.Skyforest.PromoBanner = {
    variants: [
      { id: "summer-50", message: "🔥 Winter weekends are 50% booked", cta: "CHECK AVAILABILITY", url: "/book" },
      { id: "fall-deals", message: "🍂 Fall escapes from $130/night", cta: "EXPLORE DATES", url: "/book" },
      { id: "direct-save", message: "💸 Save 15% when you book direct", cta: "SEE RATES", url: "/book" }
    ],

    currentIndex: 0,
    interval: null,

    injectCSS: () => {
      if (document.getElementById("promo-banner-style")) return;

      const css = `
        #promo-banner {
          background: #6b6f2a;
          color: white;
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          text-align: center;
          padding: 12px 20px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10001;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        #promo-banner .promo-text,
        #promo-banner .promo-cta {
          transition: opacity 0.4s ease-in-out;
        }
        #promo-banner .promo-text { font-weight: 400; }
        #promo-banner .promo-cta {
          font-weight: 700;
          text-transform: uppercase;
          color: #fff;
          text-decoration: underline;
          cursor: pointer;
        }
        #promo-banner .promo-cta:hover { opacity: 0.85; }
        @media (max-width: 600px) {
          #promo-banner { flex-direction: column; gap: 0px; }
          #promo-banner .promo-cta { display: block; }
        }
      `;

      const styleEl = document.createElement("style");
      styleEl.id = "promo-banner-style";
      styleEl.textContent = css;
      document.head.appendChild(styleEl);

      console.log("✅ PromoBanner CSS injected");
    },

    waitForStickyNav: (callback, retries = 20) => {
      const nav = document.getElementById("skyforest-sticky-header");
      if (nav) {
        callback(nav);
      } else if (retries > 0) {
        setTimeout(() => window.Skyforest.PromoBanner.waitForStickyNav(callback, retries - 1), 300);
      } else {
        console.warn("⚠️ Sticky nav not found, falling back to <body> prepend");
        callback(null);
      }
    },

    showVariant: (index, banner, nav) => {
      const variant = window.Skyforest.PromoBanner.variants[index];
      banner.dataset.variant = variant.id;

      const textEl = banner.querySelector(".promo-text");
      const ctaEl = banner.querySelector(".promo-cta");

      // fade out
      textEl.style.opacity = 0;
      ctaEl.style.opacity = 0;

      setTimeout(() => {
        textEl.textContent = variant.message;
        ctaEl.textContent = variant.cta;
        ctaEl.href = variant.url;

        // GA tracking
        ctaEl.onclick = () => {
          if (typeof gtag === "function") {
            gtag("event", "promo_banner_click", {
              promo_variant: variant.id,
              promo_message: variant.message,
              promo_cta: variant.cta,
              promo_url: variant.url
            });
          }
          console.log(`📊 GA Event fired: promo_banner_click [${variant.id}]`);
        };

        // fade in
        textEl.style.opacity = 1;
        ctaEl.style.opacity = 1;

        // recalc offsets
        const bannerHeight = banner.offsetHeight;
        document.documentElement.style.setProperty("--promo-height", `${bannerHeight}px`);
        if (nav) {
          nav.style.top = `${bannerHeight}px`;
          const navHeight = nav.offsetHeight;
          document.documentElement.style.setProperty("--nav-height", `${navHeight}px`);
        }
      }, 300);
    },

    init: () => {
      window.Skyforest.PromoBanner.injectCSS();

      window.Skyforest.PromoBanner.waitForStickyNav((nav) => {
        const banner = document.createElement("div");
        banner.id = "promo-banner";
        banner.innerHTML = `
          <span class="promo-text"></span>
          <a class="promo-cta"></a>
        `;

        if (nav && nav.parentNode) {
          nav.parentNode.insertBefore(banner, nav);
        } else {
          document.body.prepend(banner);
        }

        // Show first variant
        window.Skyforest.PromoBanner.showVariant(0, banner, nav);

        // Rotate every 5s
        window.Skyforest.PromoBanner.interval = setInterval(() => {
          window.Skyforest.PromoBanner.currentIndex =
            (window.Skyforest.PromoBanner.currentIndex + 1) %
            window.Skyforest.PromoBanner.variants.length;
          window.Skyforest.PromoBanner.showVariant(
            window.Skyforest.PromoBanner.currentIndex,
            banner,
            nav
          );
        }, 5000);

        console.log("✅ PromoBanner initialized");
      });
    }
  };

  // Auto-init on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    window.Skyforest.PromoBanner.init();
  });
})();
