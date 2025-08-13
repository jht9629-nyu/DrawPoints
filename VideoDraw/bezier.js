//

function drawBezierPath(points, layer) {
  if (points.length < 2) return;
  // layer.noFill(); // !!@ not available on canvas
  let smoothness = smoothnessValue; // Convert to 0.1-1.0 range
  // For paths with only 2 points, draw a simple line
  if (points.length == 2) {
    p0 = points[0];
    p1 = points[0];
    layer.stroke(p1.strokeColor);
    layer.strokeWeight(p1.weight);
    layer.line(p0.x, p0.y, p1.x, p1.y);
    return;
  }
  // Draw bezier curves between consecutive points
  for (let i = 0; i < points.length - 1; i++) {
    let p0, p1, p2, p3;
    // Get the four points needed for cubic bezier
    if (i == 0) {
      p0 = points[0];
      p1 = points[0];
      p2 = points[1];
      p3 = points.length > 2 ? points[2] : points[1];
    } else if (i == points.length - 2) {
      p0 = points[i - 1];
      p1 = points[i];
      p2 = points[i + 1];
      p3 = points[i + 1];
    } else {
      p0 = points[i - 1];
      p1 = points[i];
      p2 = points[i + 1];
      p3 = points[i + 2];
    }
    layer.stroke(p3.strokeColor);
    layer.strokeWeight(p3.weight);
    // Calculate control points for smooth cubic bezier
    let cp1x = p1.x + (p2.x - p0.x) * smoothness * 0.16;
    let cp1y = p1.y + (p2.y - p0.y) * smoothness * 0.16;
    let cp2x = p2.x - (p3.x - p1.x) * smoothness * 0.16;
    let cp2y = p2.y - (p3.y - p1.y) * smoothness * 0.16;
    // Draw the cubic bezier curve using p5.js bezier function
    layer.bezier(p1.x, p1.y, cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}
