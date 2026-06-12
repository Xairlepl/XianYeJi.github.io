type QrBlockGroup = {
  count: number;
  dataCodewords: number;
};

type QrVersionSpec = {
  version: number;
  dataCodewords: number;
  eccCodewordsPerBlock: number;
  blockGroups: QrBlockGroup[];
  alignmentCenters: number[];
};

export type QrMatrix = boolean[][];

const VERSION_SPECS: QrVersionSpec[] = [
  { version: 1, dataCodewords: 19, eccCodewordsPerBlock: 7, blockGroups: [{ count: 1, dataCodewords: 19 }], alignmentCenters: [] },
  { version: 2, dataCodewords: 34, eccCodewordsPerBlock: 10, blockGroups: [{ count: 1, dataCodewords: 34 }], alignmentCenters: [6, 18] },
  { version: 3, dataCodewords: 55, eccCodewordsPerBlock: 15, blockGroups: [{ count: 1, dataCodewords: 55 }], alignmentCenters: [6, 22] },
  { version: 4, dataCodewords: 80, eccCodewordsPerBlock: 20, blockGroups: [{ count: 1, dataCodewords: 80 }], alignmentCenters: [6, 26] },
  { version: 5, dataCodewords: 108, eccCodewordsPerBlock: 26, blockGroups: [{ count: 1, dataCodewords: 108 }], alignmentCenters: [6, 30] },
  { version: 6, dataCodewords: 136, eccCodewordsPerBlock: 18, blockGroups: [{ count: 2, dataCodewords: 68 }], alignmentCenters: [6, 34] },
  { version: 7, dataCodewords: 156, eccCodewordsPerBlock: 20, blockGroups: [{ count: 2, dataCodewords: 78 }], alignmentCenters: [6, 22, 38] },
  { version: 8, dataCodewords: 194, eccCodewordsPerBlock: 24, blockGroups: [{ count: 2, dataCodewords: 97 }], alignmentCenters: [6, 24, 42] },
  { version: 9, dataCodewords: 232, eccCodewordsPerBlock: 30, blockGroups: [{ count: 2, dataCodewords: 116 }], alignmentCenters: [6, 26, 46] },
  {
    version: 10,
    dataCodewords: 274,
    eccCodewordsPerBlock: 18,
    blockGroups: [
      { count: 2, dataCodewords: 68 },
      { count: 2, dataCodewords: 69 },
    ],
    alignmentCenters: [6, 28, 50],
  },
];

const FORMAT_MASK = 0x5412;
const BYTE_MODE = 0b0100;
const ERROR_CORRECTION_LOW = 0b01;

const GF_EXP = new Array<number>(512);
const GF_LOG = new Array<number>(256);

let gfValue = 1;
for (let index = 0; index < 255; index += 1) {
  GF_EXP[index] = gfValue;
  GF_LOG[gfValue] = index;
  gfValue <<= 1;
  if (gfValue & 0x100) gfValue ^= 0x11d;
}
for (let index = 255; index < 512; index += 1) {
  GF_EXP[index] = GF_EXP[index - 255];
}

const createMatrix = (size: number) => Array.from({ length: size }, () => Array<boolean>(size).fill(false));

const gfMultiply = (left: number, right: number) => {
  if (left === 0 || right === 0) return 0;
  return GF_EXP[GF_LOG[left] + GF_LOG[right]];
};

const getBit = (value: number, index: number) => ((value >>> index) & 1) === 1;

const appendBits = (bits: number[], value: number, length: number) => {
  for (let index = length - 1; index >= 0; index -= 1) {
    bits.push((value >>> index) & 1);
  }
};

const bitsToCodewords = (bits: number[]) => {
  const codewords: number[] = [];
  for (let index = 0; index < bits.length; index += 8) {
    let value = 0;
    for (let offset = 0; offset < 8; offset += 1) {
      value = (value << 1) | (bits[index + offset] ?? 0);
    }
    codewords.push(value);
  }
  return codewords;
};

const chooseSpec = (bytes: Uint8Array) => {
  const spec = VERSION_SPECS.find((candidate) => {
    const countBits = candidate.version <= 9 ? 8 : 16;
    const requiredBits = 4 + countBits + bytes.length * 8;
    return requiredBits <= candidate.dataCodewords * 8;
  });

  if (!spec) {
    throw new Error('二维码内容过长，无法在当前组件中生成');
  }

  return spec;
};

const makeDataCodewords = (bytes: Uint8Array, spec: QrVersionSpec) => {
  const bits: number[] = [];
  appendBits(bits, BYTE_MODE, 4);
  appendBits(bits, bytes.length, spec.version <= 9 ? 8 : 16);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const capacityBits = spec.dataCodewords * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));

  while (bits.length % 8 !== 0) bits.push(0);

  const codewords = bitsToCodewords(bits);
  for (let padIndex = 0; codewords.length < spec.dataCodewords; padIndex += 1) {
    codewords.push(padIndex % 2 === 0 ? 0xec : 0x11);
  }

  return codewords;
};

const makeRsDivisor = (degree: number) => {
  const result = Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let index = 0; index < degree; index += 1) {
    for (let offset = 0; offset < degree; offset += 1) {
      result[offset] = gfMultiply(result[offset], root);
      if (offset + 1 < degree) result[offset] ^= result[offset + 1];
    }
    root = gfMultiply(root, 0x02);
  }

  return result;
};

const makeRsRemainder = (data: number[], divisor: number[]) => {
  const result = Array<number>(divisor.length).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result.shift()!;
    result.push(0);
    divisor.forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor);
    });
  });

  return result;
};

const splitBlocks = (dataCodewords: number[], spec: QrVersionSpec) => {
  const blocks: number[][] = [];
  let offset = 0;

  spec.blockGroups.forEach((group) => {
    for (let index = 0; index < group.count; index += 1) {
      blocks.push(dataCodewords.slice(offset, offset + group.dataCodewords));
      offset += group.dataCodewords;
    }
  });

  return blocks;
};

const interleaveBlocks = (dataCodewords: number[], spec: QrVersionSpec) => {
  const dataBlocks = splitBlocks(dataCodewords, spec);
  const rsDivisor = makeRsDivisor(spec.eccCodewordsPerBlock);
  const eccBlocks = dataBlocks.map((block) => makeRsRemainder(block, rsDivisor));
  const result: number[] = [];
  const maxDataLength = Math.max(...dataBlocks.map((block) => block.length));

  for (let index = 0; index < maxDataLength; index += 1) {
    dataBlocks.forEach((block) => {
      if (index < block.length) result.push(block[index]);
    });
  }

  for (let index = 0; index < spec.eccCodewordsPerBlock; index += 1) {
    eccBlocks.forEach((block) => {
      result.push(block[index]);
    });
  }

  return result;
};

const drawFunctionModule = (
  matrix: QrMatrix,
  functionModules: QrMatrix,
  x: number,
  y: number,
  dark: boolean
) => {
  matrix[y][x] = dark;
  functionModules[y][x] = true;
};

const drawFinderPattern = (matrix: QrMatrix, functionModules: QrMatrix, left: number, top: number) => {
  const size = matrix.length;

  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const x = left + dx;
      const y = top + dy;
      if (x < 0 || y < 0 || x >= size || y >= size) continue;

      const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const dark =
        inFinder &&
        (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      drawFunctionModule(matrix, functionModules, x, y, dark);
    }
  }
};

const drawAlignmentPattern = (matrix: QrMatrix, functionModules: QrMatrix, centerX: number, centerY: number) => {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      drawFunctionModule(
        matrix,
        functionModules,
        centerX + dx,
        centerY + dy,
        Math.max(Math.abs(dx), Math.abs(dy)) !== 1
      );
    }
  }
};

const calculateBchCode = (value: number, generator: number) => {
  let result = value;
  const generatorLength = 31 - Math.clz32(generator);

  while (31 - Math.clz32(result) >= generatorLength) {
    result ^= generator << (31 - Math.clz32(result) - generatorLength);
  }

  return result;
};

const drawFormatBits = (matrix: QrMatrix, functionModules: QrMatrix, mask: number) => {
  const size = matrix.length;
  const data = (ERROR_CORRECTION_LOW << 3) | mask;
  const bits = ((data << 10) | calculateBchCode(data << 10, 0x537)) ^ FORMAT_MASK;

  for (let index = 0; index <= 5; index += 1) {
    drawFunctionModule(matrix, functionModules, 8, index, getBit(bits, index));
  }
  drawFunctionModule(matrix, functionModules, 8, 7, getBit(bits, 6));
  drawFunctionModule(matrix, functionModules, 8, 8, getBit(bits, 7));
  drawFunctionModule(matrix, functionModules, 7, 8, getBit(bits, 8));
  for (let index = 9; index < 15; index += 1) {
    drawFunctionModule(matrix, functionModules, 14 - index, 8, getBit(bits, index));
  }

  for (let index = 0; index < 8; index += 1) {
    drawFunctionModule(matrix, functionModules, size - 1 - index, 8, getBit(bits, index));
  }
  for (let index = 8; index < 15; index += 1) {
    drawFunctionModule(matrix, functionModules, 8, size - 15 + index, getBit(bits, index));
  }
  drawFunctionModule(matrix, functionModules, 8, size - 8, true);
};

const drawVersionBits = (matrix: QrMatrix, functionModules: QrMatrix, version: number) => {
  if (version < 7) return;

  const size = matrix.length;
  const bits = (version << 12) | calculateBchCode(version << 12, 0x1f25);

  for (let index = 0; index < 18; index += 1) {
    const x = size - 11 + (index % 3);
    const y = Math.floor(index / 3);
    const dark = getBit(bits, index);
    drawFunctionModule(matrix, functionModules, x, y, dark);
    drawFunctionModule(matrix, functionModules, y, x, dark);
  }
};

const drawFunctionPatterns = (matrix: QrMatrix, functionModules: QrMatrix, spec: QrVersionSpec) => {
  const size = matrix.length;

  drawFinderPattern(matrix, functionModules, 0, 0);
  drawFinderPattern(matrix, functionModules, size - 7, 0);
  drawFinderPattern(matrix, functionModules, 0, size - 7);

  for (let index = 8; index < size - 8; index += 1) {
    const dark = index % 2 === 0;
    drawFunctionModule(matrix, functionModules, index, 6, dark);
    drawFunctionModule(matrix, functionModules, 6, index, dark);
  }

  spec.alignmentCenters.forEach((x) => {
    spec.alignmentCenters.forEach((y) => {
      if (!functionModules[y][x]) drawAlignmentPattern(matrix, functionModules, x, y);
    });
  });

  drawFormatBits(matrix, functionModules, 0);
  drawVersionBits(matrix, functionModules, spec.version);
};

const shouldInvertForMask = (mask: number, x: number, y: number) => {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return false;
  }
};

const drawCodewords = (matrix: QrMatrix, functionModules: QrMatrix, codewords: number[]) => {
  const size = matrix.length;
  const bits = codewords.flatMap((codeword) =>
    Array.from({ length: 8 }, (_, index) => (codeword >>> (7 - index)) & 1)
  );
  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;

    for (let vertical = 0; vertical < size; vertical += 1) {
      const y = upward ? size - 1 - vertical : vertical;
      for (let dx = 0; dx < 2; dx += 1) {
        const x = right - dx;
        if (functionModules[y][x]) continue;
        matrix[y][x] = (bits[bitIndex] ?? 0) === 1;
        bitIndex += 1;
      }
    }

    upward = !upward;
  }
};

const applyMask = (matrix: QrMatrix, functionModules: QrMatrix, mask: number) => {
  const size = matrix.length;
  const result = matrix.map((row) => [...row]);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!functionModules[y][x] && shouldInvertForMask(mask, x, y)) {
        result[y][x] = !result[y][x];
      }
    }
  }

  return result;
};

const getPenaltyScore = (matrix: QrMatrix) => {
  const size = matrix.length;
  let penalty = 0;

  for (let y = 0; y < size; y += 1) {
    let runColor = matrix[y][0];
    let runLength = 1;
    for (let x = 1; x < size; x += 1) {
      if (matrix[y][x] === runColor) {
        runLength += 1;
      } else {
        if (runLength >= 5) penalty += runLength - 2;
        runColor = matrix[y][x];
        runLength = 1;
      }
    }
    if (runLength >= 5) penalty += runLength - 2;
  }

  for (let x = 0; x < size; x += 1) {
    let runColor = matrix[0][x];
    let runLength = 1;
    for (let y = 1; y < size; y += 1) {
      if (matrix[y][x] === runColor) {
        runLength += 1;
      } else {
        if (runLength >= 5) penalty += runLength - 2;
        runColor = matrix[y][x];
        runLength = 1;
      }
    }
    if (runLength >= 5) penalty += runLength - 2;
  }

  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const color = matrix[y][x];
      if (matrix[y][x + 1] === color && matrix[y + 1][x] === color && matrix[y + 1][x + 1] === color) {
        penalty += 3;
      }
    }
  }

  const patterns = [
    [true, false, true, true, true, false, true, false, false, false, false],
    [false, false, false, false, true, false, true, true, true, false, true],
  ];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x <= size - 11; x += 1) {
      if (patterns.some((pattern) => pattern.every((color, index) => matrix[y][x + index] === color))) {
        penalty += 40;
      }
    }
  }

  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y <= size - 11; y += 1) {
      if (patterns.some((pattern) => pattern.every((color, index) => matrix[y + index][x] === color))) {
        penalty += 40;
      }
    }
  }

  const darkCount = matrix.reduce(
    (total, row) => total + row.reduce((rowTotal, module) => rowTotal + (module ? 1 : 0), 0),
    0
  );
  const totalModules = size * size;
  penalty += Math.floor(Math.abs(darkCount * 20 - totalModules * 10) / totalModules) * 10;

  return penalty;
};

export const createQrMatrix = (content: string): QrMatrix => {
  const bytes = new TextEncoder().encode(content);
  const spec = chooseSpec(bytes);
  const size = spec.version * 4 + 17;
  const baseMatrix = createMatrix(size);
  const functionModules = createMatrix(size);
  const dataCodewords = makeDataCodewords(bytes, spec);
  const codewords = interleaveBlocks(dataCodewords, spec);

  drawFunctionPatterns(baseMatrix, functionModules, spec);
  drawCodewords(baseMatrix, functionModules, codewords);

  let bestMatrix = baseMatrix;
  let bestMask = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    const candidateFunctionModules = functionModules.map((row) => [...row]);
    const candidate = applyMask(baseMatrix, candidateFunctionModules, mask);
    drawFormatBits(candidate, candidateFunctionModules, mask);
    const penalty = getPenaltyScore(candidate);

    if (penalty < bestPenalty) {
      bestMatrix = candidate;
      bestMask = mask;
      bestPenalty = penalty;
    }
  }

  const finalFunctionModules = functionModules.map((row) => [...row]);
  drawFormatBits(bestMatrix, finalFunctionModules, bestMask);
  return bestMatrix;
};
