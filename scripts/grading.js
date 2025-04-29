// grading.js: compute question & topic grades and softer baby-color gradient

export function questionGrade(q) {
  const h = q.history || [];
  if (h.length === 0) return 0;
  let sum = 0, totalW = 0;
  h.forEach((entry, i) => {
    const weight = 2 ** (i + 1);
    const val = entry.status === 'correct' ? 1
              : entry.status === 'partial' ? 0.5
              : 0;
    sum += val * weight;
    totalW += weight;
  });
  return sum / totalW;
}

export function topicGrade(topic) {
  if (!topic.questions.length) return 0;
  const total = topic.questions.reduce((acc, q) => acc + questionGrade(q), 0);
  return total / topic.questions.length;
}

/**
 * Pastel interpolation between:
 *   baby-red  (#ffcccc),
 *   baby-yellow (#ffffcc),
 *   baby-green (#ccffcc)
 */
export function gradientColor(g) {
  let r1, g1, b1, r2, g2, b2, t;
  if (g <= 0.5) {
    // between red and yellow
    [r1, g1, b1] = [0xff, 0xcc, 0xcc]; // #ffcccc
    [r2, g2, b2] = [0xff, 0xff, 0xcc]; // #ffffcc
    t = g / 0.5;
  } else {
    // between yellow and green
    [r1, g1, b1] = [0xff, 0xff, 0xcc]; // #ffffcc
    [r2, g2, b2] = [0xcc, 0xff, 0xcc]; // #ccffcc
    t = (g - 0.5) / 0.5;
  }
  const r = Math.round(r1 + (r2 - r1) * t);
  const gg = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${gg}, ${b})`;
}