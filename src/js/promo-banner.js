(() => {
  // Ensure namespace
  window.Skyforest = window.Skyforest || {};

  window.Skyforest.PromoBanner = {
    variants: [
      {
        id: "summer-50",
        message: "🔥 Winter weekends are 50% booked",
        cta: "CHECK AVAILABILITY",
        url: "/book"
      },
      {
        id: "fall-deals",
        message: "🍂 Fall escapes from $130/night",
        cta: "EXPLORE DATES",
        url: "/book"
      },
      {
        id: "direct-save",
        message: "💸 Save 15% when you book direct",
        cta: "SEE DEALS",
        url: "/book"
      }
    ],

    init: () => {
      document.addEventListener("DOMContentLoaded", () => {
        const { variants } = window.Skyforest.PromoBanner;

        // Pick random variant
        const variant = variants[Math.floor(Math.random() * variants.length)];

        // Create banner container
        const banner = document.createElement("div");
        banner.id = "promo-banner";
        banner.dataset.variant = variant.id;

        // Inject HTML safely with template literal (closed properly ✅)
        banner.innerHTML = `
          <span class="promo-text">${variant.message}</span>
          <a class="promo-cta" href="${variant.url}" target="_blank" rel="noopener">
            ${variant.cta}
          </a>
        `;

        // Close button
        const closeBtn = document.createElement("span");
        closeBtn.innerHTML = "&times;";
        closeBtn.classList.add("promo-close");
        closeBtn.addEventListener("click", () => {
          banner.remove();
          if (window.Skyforest.log) {
            window.Skyforest.log("PromoBanner", "Banner dismissed");
          }
        });
        banner.appendChild(closeBtn);

        // Insert banner at top of body
        document.body.prepend(banner);

        // Track CTA click in GA4
        const ctaEl = banner.querySelector(".promo-cta");
        ctaEl.addEventListener("click", () => {
          if (typeof gtag === "function") {
            gtag("event", "promo_banner_click", {
              promo_variant: variant.id,
              promo_message: variant.message,
              promo_cta: variant.cta,
              promo_url: variant.url
            });
          }
          if (window.Skyforest.log) {
            window.Skyforest.log("PromoBanner", `CTA clicked [${variant.id}]`);
          }
        });

        if (window.Skyforest.log) {
          window.Skyforest.log("PromoBanner", `✅ Banner injected [${variant.id}]`);
        }
      });
    }
  };

  // Auto-init
  window.Skyforest.PromoBanner.init();
})();
