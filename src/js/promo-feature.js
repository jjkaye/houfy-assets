(() => {
  console.log("PromoFeature script loaded");

  window.Skyforest = window.Skyforest || {};

  window.Skyforest.PromoFeature = {
    injectCSS: () => {
      if (document.getElementById("promo-feature-style")) return;

      const css = `
        #promo-feature {
          display: flex;
          flex-wrap: nowrap;
          border: 1px solid #ccc;
          background: #f7f4e7;
          margin: 2rem 0;
          font-family: "DM Sans", sans-serif;
        }
        #promo-feature img {
          width: 50%;
          object-fit: cover;
          display: block;
        }
        #promo-feature .promo-content {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #f7f4e7;
          text-align: center;
        }
        #promo-feature .promo-tag {
          background: #ffe89c;
          color: #333;
          font-size: .8rem;
          font-weight: 700;
          padding: 0.25rem 1rem;
          border-radius: 2rem;
          display: inline-block;
          margin: 0 auto 1.5rem auto;
        }
        #promo-feature h3 {
          font-size: 1.8rem !important;
          line-height: 1.2em !important;
          margin: 0 !important;
          padding: 0 !important;
          font-weight: 700;
        }
        #promo-feature p {
          margin: 0;
          font-size: .8rem;
          line-height: 1.8;
        }
        #promo-feature .promo-cta {
          display: inline-block;
          background: #f6b93b;
          color: #000 !important;
          text-decoration: none;
          font-weight: 600;
          text-transform: uppercase;
          padding: .75rem;
          border: 1px solid #222;
          transition: background 0.2s ease, color 0.2s ease;
          text-align: center;
          margin: 1rem auto .5rem auto;
          font-size: .9rem;
          width: 100%;
        }
        #promo-feature .promo-cta:hover {
          background: #e0a52f;
          color: #000;
        }
        #promo-feature .promo-rating {
          font-size: .8rem;
          color: #333;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
        }
        #promo-feature .promo-rating::before {
          content: "★★★★★";
          color: #f6b93b;
          font-size: 1rem;
          letter-spacing: 0.1rem;
        }
        @media (max-width: 900px) {
          #promo-feature {
            flex-direction: column;
            text-align: center;
          }
          #promo-feature img {
            width: 100%;
          }
          #promo-feature .promo-content {
            padding: 1rem;
          }
          #promo-feature .promo-tag {
            margin: .5rem auto 1rem auto;
          }
          #promo-feature .promo-cta {
            padding: .5rem;
            margin-top: 0rem;
          }
          
        }
      `;

      const styleEl = document.createElement("style");
      styleEl.id = "promo-feature-style";
      styleEl.textContent = css;
      document.head.appendChild(styleEl);

      console.log("✅ PromoFeature CSS injected");
    },

    getSlug: () => {
      const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
      return path.split("/").pop();
    },

    init: async (jsonUrl = "/js/promo-feature.json") => {
      window.Skyforest.PromoFeature.injectCSS();

      const slug = window.Skyforest.PromoFeature.getSlug();
      try {
        const resp = await fetch(jsonUrl);
        const data = await resp.json();

        if (!data[slug]) {
          console.warn(`⚠️ PromoFeature: no promo defined for slug "${slug}"`);
          return;
        }

        const promo = data[slug];
        const afterEl = document.getElementById(promo.insertAfterId);

        if (!afterEl) {
          console.warn(`⚠️ PromoFeature: insertAfterId \"${promo.insertAfterId}\" not found`);
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.id = "promo-feature";
        wrapper.innerHTML = `
          ${promo.image ? `<img src="${promo.image}" alt="${promo.headline}">` : ""}
          <div class="promo-content">
            ${promo.tag ? `<span class="promo-tag">${promo.tag}</span>` : ""}
            <h3 class="promo-header">${promo.headline}</h3>
            <p>${promo.body}</p>
            <a class="promo-cta" href="${promo.url}">${promo.cta}</a>
            ${promo.rating ? `<div class="promo-rating">${promo.rating}</div>` : ""}
          </div>
        `;

        afterEl.insertAdjacentElement("afterend", wrapper);

        // Optional: GA tracking
        const ctaEl = wrapper.querySelector(".promo-cta");
        if (ctaEl) {
          ctaEl.addEventListener("click", () => {
            if (typeof gtag === "function") {
              gtag("event", "promo_feature_click", {
                page_slug: slug,
                headline: promo.headline,
                cta: promo.cta,
                url: promo.url
              });
            }
            console.log(`📊 GA Event fired: promo_feature_click [${slug}]`);
          });
        }
      } catch (err) {
        console.error("❌ PromoFeature error:", err);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.Skyforest.PromoFeature.init();
  });
})();