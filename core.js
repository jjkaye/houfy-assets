(() => {
  // Ensure namespace exists
  window.Skyforest = window.Skyforest || {};

  // Core utilities
  window.Skyforest.Core = {
    init: () => {
      // Simple logging utility
      window.Skyforest.log = (feature, ...args) => {
        const prefix = `[Skyforest:${feature}]`;
        if (window.Skyforest.debug) {
          console.log(prefix, ...args);
        }
      };

      // Toggle logging globally
      window.Skyforest.debug = true; // set false in prod if you want silence

      // Confirm core loaded
      window.Skyforest.log("Core", "✅ Core initialized");
    }
  };

  // Auto-init
  window.Skyforest.Core.init();
})();
