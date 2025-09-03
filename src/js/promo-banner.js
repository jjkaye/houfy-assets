(() => {
  // Ensure namespace
  window.Skyforest = window.Skyforest || {};

  window.Skyforest.PromoBanner = {
    init: () => {
      document.addEventListener("DOMContentLoaded", () => {
        // Create banner container
        const banner = document.createElement("div");
        banner.id = "promo-banner";
        banner.style.cssText = `
          background: #1a73e8;
          color: white;
          padding: 12px 20px;
          font-family: DM Sans, sans-serif;
          font-size: 16px;
          text-align: center;
          position: relative;
          z-index: 1000;
        `;
        banner.innerText = "👋 Hello World! This is your promo banner.";

        // Close button
        const closeBtn = document.createElement("span");
        closeBtn.innerHTML = "&times;";
        closeBtn.style.cssText = `
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
        `;
        closeBtn.addEventListener("click", () => {
          banner.remove();
          window.Skyforest.log("PromoBanner", "Banner dismissed");
        });

        banner.appendChild(closeBtn);

        // Insert banner
        document.body.prepend(banner);

        // Log success
        window.Skyforest.log("PromoBanner", "✅ Banner injected successfully");
      });
    }
  };

  // Auto-init
  window.Skyforest.PromoBanner.init();
})();
