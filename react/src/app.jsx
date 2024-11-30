// App.jsx
import { useState, useRef } from "react";

function App() {
  const [sliderValue, setSliderValue] = useState(0);
  const canvasRef = useRef(null);

  const drawGlyph = (data) => {
    const { coordinates, contours, flags } = data;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up drawing style
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    // Scale and offset for better visibility
    const scale = 0.3;
    const offsetX = 200;
    const offsetY = 300;

    ctx.beginPath();
    let currentPoint = 0;

    contours.forEach((endPoint) => {
      // Move to first point of contour
      const startX = coordinates[currentPoint][0] * scale + offsetX;
      const startY = -coordinates[currentPoint][1] * scale + offsetY;
      ctx.moveTo(startX, startY);

      // Draw the contour
      for (let i = currentPoint + 1; i <= endPoint; i++) {
        const x = coordinates[i][0] * scale + offsetX;
        const y = -coordinates[i][1] * scale + offsetY;

        if (flags[i]) {
          // On-curve point
          ctx.lineTo(x, y);
        } else {
          // Off-curve point (control point)
          const nextX = coordinates[i + 1][0] * scale + offsetX;
          const nextY = -coordinates[i + 1][1] * scale + offsetY;
          ctx.quadraticCurveTo(x, y, nextX, nextY);
          i++; // Skip next point as we've used it
        }
      }

      // Close the contour
      ctx.lineTo(startX, startY);
      currentPoint = endPoint + 1;
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const handleSlide = async (e) => {
    const value = parseFloat(e.target.value);
    setSliderValue(value);

    try {
      const response = await fetch("http://localhost:8000/interpolate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: value }),
      });

      const data = await response.json();
      if (data.coordinates) {
        drawGlyph(data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Font Interpolation</h1>
      <div>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={sliderValue}
          onChange={handleSlide}
          style={{ width: "200px" }}
        />
        <p>Value: {sliderValue}</p>
        <canvas
          ref={canvasRef}
          width="400"
          height="400"
          style={{ border: "1px solid black" }}
        />
      </div>
    </div>
  );
}

export default App;
