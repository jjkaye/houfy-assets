(() => {
  console.log("PromoBanner script initiated");

  window.Skyforest = window.Skyforest || {};

  function injectCSS() {
    const css = `
      /* Promo Banner */
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

      #promo-banner .promo-text {
        font-weight: 400;
      }

      #promo-banner .promo-cta {
        font-weight: 700;
        text-transform: uppercase;
        color: #fff;
        text-decoration: underline;
        cursor: pointer;
      }

      #promo-banner .promo-cta:hover {
        opacity: 0.85;
      }

      @media (max-width: 600px) {
        #promo-banner {
          flex-direction: column;
          gap: 0px;
        }
        #promo-banner .promo-cta {
          display: block;
        }
      }

      /* Sticky nav */
      #skyforest-sticky-header {
        position: fixed !important;
        left: 0;
        right: 0;
        z-index: 10000;
        background: #ffffff !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      /* Push page content below both banner + nav */
      body {
        padding-top: calc(var(--promo-height, 0px) + var(--nav-height, 0px));
      }
    `;

    if (!document.getElementById("promo-banner-style")) {
      const styleEl = document.createElement("style");
      styleEl.id = "promo-banner-style";
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
      console.log("✅ PromoBanner CSS injected");
    }
  }

  function waitForStickyNav(callback, retries = 20) {
    const nav = document.getElementById("skyforest-sticky-header");
    if (nav) {
      callback(nav);
    } else if (retries > 0) {
      setTimeout(() => waitForStickyNav(callback, retries - 1), 300);
    } else {
      console.warn("⚠️ Sticky nav not found, falling back to <body> prepend");
      callback(null);
    }
  }

  function initPromoBanner(nav) {
    const variants = [
      { id: "summer-50", message: "🔥 Winter weekends are 50% booked", cta: "CHECK AVAILABILITY", url: "/book" },
      { id: "fall-deals", message: "🍂 Fall escapes from $130/night", cta: "EXPLORE DATES", url: "/book" },
      { id: "direct-save", message: "💸 Save 15% when you book direct", cta: "SEE RATES", url: "/book" }
    ];

    let currentIndex = 0;

    // Banner shell
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

    const textEl = banner.querySelector(".promo-text");
    const ctaEl = banner.querySelector(".promo-cta");

    function showVariant(index) {
      const variant = variants[index];
      banner.dataset.variant = variant.id;

      // fade out text only
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

        // fade in text
        textEl.style.opacity = 1;
        ctaEl.style.opacity = 1;

        // recalc offsets if height changes
        const bannerHeight = banner.offsetHeight;
        document.documentElement.style.setProperty("--promo-height", `${bannerHeight}px`);
        if (nav) {
          nav.style.top = `${bannerHeight}px`;
          const navHeight = nav.offsetHeight;
          document.documentElement.style.setProperty("--nav-height", `${navHeight}px`);
        }
      }, 300);
    }

    // Start
    showVariant(currentIndex);

    // Rotate every 5s
    setInterval(() => {
      currentIndex = (currentIndex + 1) % variants.length;
      showVariant(currentIndex);
    }, 5000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectCSS();
    waitForStickyNav(initPromoBanner);
  });
})();
