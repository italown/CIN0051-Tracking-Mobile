// ORB.js


// Função auxiliar: convolução 2D (mode='same')
export function convolve2d(image, kernel) {
  'worklet';
  const kh = kernel.length;
  const kw = kernel[0].length;
  const h = image.length;
  const w = image[0].length;
  const padH = Math.floor(kh / 2);
  const padW = Math.floor(kw / 2);

  // Padding zero
  const padded = Array(h + 2 * padH).fill(null).map(() => Array(w + 2 * padW).fill(0));
  for (let i = 0; i < h; i++)
    for (let j = 0; j < w; j++)
      padded[i + padH][j + padW] = image[i][j];

  const out = Array(h).fill(null).map(() => Array(w).fill(0));

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let sum = 0;
      for (let ki = 0; ki < kh; ki++) {
        for (let kj = 0; kj < kw; kj++) {
          sum += kernel[ki][kj] * padded[i + ki][j + kj];
        }
      }
      out[i][j] = sum;
    }
  }
  return out;
}

// Função auxiliar: distância de Hamming entre dois arrays booleanos
export function hammingDistance(a, b) {
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

// FAST detector simplificado
export function FAST(img, N = 9, threshold = 0.15, nmsWindow = 2) {
  'worklet';
  // img é matriz 2D float [0..1]
  // kernel Gauss 3x3
  const kernel = [
    [1 / 16, 2 / 16, 1 / 16],
    [2 / 16, 4 / 16, 2 / 16],
    [1 / 16, 2 / 16, 1 / 16],
  ];

  const smooth = convolve2d(img, kernel);
  const crossIdx = [
    [3, 0, -3, 0],
    [0, 3, 0, -3],
  ];
  const circleIdx = [
    [3, 3, 2, 1, 0, -1, -2, -3, -3, -3, -2, -1, 0, 1, 2, 3],
    [0, 1, 2, 3, 3, 3, 2, 1, 0, -1, -2, -3, -3, -3, -2, -1],
  ];

  const h = img.length;
  const w = img[0].length;
  const cornerImg = Array(h).fill(null).map(() => Array(w).fill(0));
  let keypoints = [];

  for (let y = 3; y < h - 3; y++) {
    for (let x = 3; x < w - 3; x++) {
      const Ip = smooth[y][x];
      const t = threshold < 1 ? threshold * Ip : threshold;

      let countCross1 = 0;
      let countCross2 = 0;
      for (let k = 0; k < 4; k++) {
        if (smooth[y + crossIdx[0][k]][x + crossIdx[1][k]] > Ip + t) countCross1++;
        if (smooth[y + crossIdx[0][k]][x + crossIdx[1][k]] < Ip - t) countCross2++;
      }
      if (countCross1 >= 3 || countCross2 >= 3) {
        // check circle
        let countCircle1 = 0;
        let countCircle2 = 0;
        for (let k = 0; k < 16; k++) {
          const val = smooth[y + circleIdx[0][k]][x + circleIdx[1][k]];
          if (val >= Ip + t) countCircle1++;
          if (val <= Ip - t) countCircle2++;
        }
        if (countCircle1 >= N || countCircle2 >= N) {
          keypoints.push([x, y]);
          // pontuação (soma absoluta das diferenças)
          let score = 0;
          for (let k = 0; k < 16; k++) {
            score += Math.abs(Ip - smooth[y + circleIdx[0][k]][x + circleIdx[1][k]]);
          }
          cornerImg[y][x] = score;
        }
      }
    }
  }

  // NMS - Non Maximal Suppression
  if (nmsWindow !== 0) {
    let fewerKps = [];
    for (const [x, y] of keypoints) {
      const window = [];
      for (let wy = y - nmsWindow; wy <= y + nmsWindow; wy++) {
        for (let wx = x - nmsWindow; wx <= x + nmsWindow; wx++) {
          if (wy >= 0 && wy < h && wx >= 0 && wx < w) {
            window.push({ x: wx, y: wy, val: cornerImg[wy][wx] });
          }
        }
      }
      const maxVal = Math.max(...window.map((p) => p.val));
      if (cornerImg[y][x] === maxVal) {
        fewerKps.push([x, y]);
      }
    }
    keypoints = fewerKps;
  }

  return keypoints;
}

// BRIEF simplificado
export function BRIEF(img, keypoints, n = 256, patchSize = 9, sampleSeed = 42) {
  // img: 2D grayscale [0..1]
  // keypoints: [[x, y], ...]
  // gera n pares de amostras (pos1, pos2) dentro do patch

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const halfPatch = Math.floor(patchSize / 2);
  const pairs = [];
  const random = (() => {
    let seed = sampleSeed;
    return () => {
      // simples LCG
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  })();

  for (let i = 0; i < n; i++) {
    const x1 = Math.floor(random() * patchSize) - halfPatch;
    const y1 = Math.floor(random() * patchSize) - halfPatch;
    const x2 = Math.floor(random() * patchSize) - halfPatch;
    const y2 = Math.floor(random() * patchSize) - halfPatch;
    pairs.push([[x1, y1], [x2, y2]]);
  }

  const descriptors = [];

  const h = img.length;
  const w = img[0].length;

  for (const [x, y] of keypoints) {
    // verificar bordas
    if (
      x - halfPatch < 0 ||
      x + halfPatch >= w ||
      y - halfPatch < 0 ||
      y + halfPatch >= h
    ) {
      descriptors.push(null);
      continue;
    }

    const desc = new Array(n).fill(false);
    for (let i = 0; i < n; i++) {
      const [p1, p2] = pairs[i];
      const val1 = img[y + p1[1]][x + p1[0]];
      const val2 = img[y + p2[1]][x + p2[0]];
      desc[i] = val1 < val2;
    }
    descriptors.push(desc);
  }

  return descriptors;
}

// Matching simples com cross-check
export function match(desc1, desc2, maxDistance = Infinity, crossCheck = true) {
  // desc1, desc2: arrays de descritores booleanos
  // retorna lista de pares de índices correspondentes

  function hamming(a, b) {
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) dist++;
    }
    return dist;
  }

  const matches = [];
  for (let i = 0; i < desc1.length; i++) {
    if (!desc1[i]) continue;
    let bestDist = Infinity;
    let bestIdx = -1;
    for (let j = 0; j < desc2.length; j++) {
      if (!desc2[j]) continue;
      const dist = hamming(desc1[i], desc2[j]);
      if (dist < bestDist && dist < maxDistance) {
        bestDist = dist;
        bestIdx = j;
      }
    }
    if (bestIdx >= 0) matches.push([i, bestIdx, bestDist]);
  }

  if (crossCheck) {
    // cross check filter
    const crossMatches = [];
    for (const [i, j, dist] of matches) {
      let bestDist2 = Infinity;
      let bestI2 = -1;
      for (let k = 0; k < desc1.length; k++) {
        if (!desc1[k]) continue;
        const dist2 = hamming(desc2[j], desc1[k]);
        if (dist2 < bestDist2) {
          bestDist2 = dist2;
          bestI2 = k;
        }
      }
      if (bestI2 === i) crossMatches.push([i, j, dist]);
    }
    return crossMatches;
  }

  return matches;
}
