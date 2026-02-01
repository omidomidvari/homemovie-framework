// HomeMovie Framework v1.0.0
(function (global) {
  const HomeMovie = {
    version: "1.0.0",
    state: {},

    /** Create DOM elements */
    createElement(tag, attrs = {}, ...children) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
      children.forEach(child => {
        if (typeof child === "string") {
          el.appendChild(document.createTextNode(child));
        } else {
          el.appendChild(child);
        }
      });
      return el;
    },

    /** Render to container */
    render(element, container) {
      container.appendChild(element);
    },

    /** Simple state management */
    setState(key, value) {
      this.state[key] = value;
      if (this.onStateChange) this.onStateChange(key, value);
    },

    getState(key) {
      return this.state[key];
    },

    /** CSV to Graph feature */
    async csvToGraph(csvUrl, container) {
      try {
        const response = await fetch(csvUrl);
        const text = await response.text();

        // Parse CSV
        const rows = text.trim().split("\n").map(r => r.split(","));
        const labels = rows.slice(1).map(r => r[0]);
        const values = rows.slice(1).map(r => Number(r[1]));

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 300;
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        const barWidth = canvas.width / values.length;

        // Draw bars
        values.forEach((val, i) => {
          const height = val * 10; // scale factor
          ctx.fillStyle = "steelblue";
          ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 5, height);

          ctx.fillStyle = "black";
          ctx.font = "12px Arial";
          ctx.fillText(labels[i], i * barWidth + 5, canvas.height - 5);
        });
      } catch (err) {
        console.error("Error loading CSV:", err);
      }
    }
  };

  // Expose globally
  global.HomeMovie = HomeMovie;
})(window);
