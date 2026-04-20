const SERIES = ["A", "B", "C", "D", "E"];

const CORRECT_ANSWERS = {
  A1: 4, A2: 5, A3: 1, A4: 2, A5: 6, A6: 3, A7: 6, A8: 2, A9: 1, A10: 3, A11: 4, A12: 5,
  B1: 2, B2: 6, B3: 1, B4: 2, B5: 1, B6: 3, B7: 5, B8: 6, B9: 4, B10: 3, B11: 4, B12: 5,
  C1: 8, C2: 2, C3: 3, C4: 8, C5: 7, C6: 4, C7: 5, C8: 1, C9: 7, C10: 6, C11: 1, C12: 2,
  D1: 3, D2: 4, D3: 3, D4: 7, D5: 8, D6: 6, D7: 5, D8: 4, D9: 1, D10: 2, D11: 5, D12: 6,
  E1: 7, E2: 6, E3: 8, E4: 2, E5: 1, E6: 5, E7: 1, E8: 6, E9: 3, E10: 2, E11: 4, E12: 5,
};

const EXPECTED_DISTRIBUTION = [
  { total: 10, A: 5, B: 2, C: 1, D: 1, E: 0 },
  { total: 11, A: 7, B: 2, C: 1, D: 1, E: 0 },
  { total: 12, A: 8, B: 2, C: 1, D: 1, E: 0 },
  { total: 13, A: 8, B: 3, C: 1, D: 1, E: 0 },
  { total: 14, A: 8, B: 3, C: 1, D: 1, E: 1 },
  { total: 15, A: 8, B: 3, C: 2, D: 1, E: 1 },
  { total: 16, A: 8, B: 4, C: 2, D: 1, E: 1 },
  { total: 17, A: 9, B: 4, C: 2, D: 1, E: 1 },
  { total: 18, A: 9, B: 4, C: 2, D: 2, E: 1 },
  { total: 19, A: 9, B: 5, C: 2, D: 2, E: 1 },
  { total: 20, A: 9, B: 5, C: 3, D: 2, E: 1 },
  { total: 21, A: 9, B: 5, C: 4, D: 2, E: 1 },
  { total: 22, A: 9, B: 5, C: 4, D: 3, E: 1 },
  { total: 23, A: 9, B: 6, C: 4, D: 3, E: 1 },
  { total: 24, A: 9, B: 6, C: 4, D: 4, E: 1 },
  { total: 25, A: 9, B: 6, C: 5, D: 4, E: 1 },
  { total: 26, A: 9, B: 6, C: 5, D: 5, E: 1 },
  { total: 27, A: 9, B: 7, C: 5, D: 5, E: 1 },
  { total: 28, A: 10, B: 7, C: 5, D: 5, E: 1 },
  { total: 29, A: 10, B: 7, C: 6, D: 5, E: 1 },
  { total: 30, A: 10, B: 7, C: 6, D: 5, E: 2 },
  { total: 31, A: 10, B: 7, C: 6, D: 6, E: 2 },
  { total: 32, A: 10, B: 7, C: 6, D: 6, E: 3 },
  { total: 33, A: 10, B: 7, C: 7, D: 6, E: 3 },
  { total: 34, A: 10, B: 7, C: 7, D: 7, E: 3 },
  { total: 35, A: 10, B: 7, C: 7, D: 7, E: 4 },
  { total: 36, A: 10, B: 8, C: 7, D: 7, E: 4 },
  { total: 37, A: 10, B: 8, C: 8, D: 7, E: 4 },
  { total: 38, A: 10, B: 8, C: 8, D: 8, E: 4 },
  { total: 39, A: 10, B: 8, C: 8, D: 8, E: 5 },
  { total: 40, A: 10, B: 8, C: 8, D: 8, E: 6 },
  { total: 41, A: 11, B: 8, C: 8, D: 8, E: 6 },
  { total: 42, A: 11, B: 8, C: 8, D: 8, E: 7 },
  { total: 43, A: 11, B: 8, C: 8, D: 8, E: 8 },
  { total: 44, A: 11, B: 9, C: 8, D: 8, E: 8 },
  { total: 45, A: 11, B: 9, C: 8, D: 9, E: 8 },
  { total: 46, A: 11, B: 9, C: 9, D: 9, E: 8 },
  { total: 47, A: 11, B: 9, C: 9, D: 9, E: 9 },
  { total: 48, A: 11, B: 10, C: 9, D: 9, E: 9 },
  { total: 49, A: 12, B: 10, C: 9, D: 9, E: 9 },
  { total: 50, A: 12, B: 10, C: 9, D: 10, E: 9 },
  { total: 51, A: 12, B: 10, C: 10, D: 10, E: 9 },
  { total: 52, A: 12, B: 10, C: 10, D: 10, E: 10 },
  { total: 53, A: 12, B: 11, C: 10, D: 10, E: 10 },
  { total: 54, A: 12, B: 11, C: 11, D: 10, E: 10 },
  { total: 55, A: 12, B: 11, C: 11, D: 11, E: 10 },
  { total: 56, A: 12, B: 11, C: 11, D: 11, E: 11 },
  { total: 57, A: 12, B: 11, C: 12, D: 11, E: 11 },
  { total: 58, A: 12, B: 12, C: 12, D: 11, E: 11 },
  { total: 59, A: 12, B: 12, C: 12, D: 12, E: 11 },
  { total: 60, A: 12, B: 12, C: 12, D: 12, E: 12 },
];

const DIAGNOSTIC_BANDS = [
  { minPercentile: 95, maxPercentile: 100, code: "I", label: "Superior" },
  { minPercentile: 90, maxPercentile: 94, code: "II+", label: "Superior al término medio" },
  { minPercentile: 75, maxPercentile: 89, code: "II", label: "Superior al término medio" },
  { minPercentile: 50, maxPercentile: 74, code: "III+", label: "Término medio" },
  { minPercentile: 25, maxPercentile: 49, code: "III-", label: "Término medio" },
  { minPercentile: 10, maxPercentile: 24, code: "IV", label: "Inferior al término medio" },
  { minPercentile: 5, maxPercentile: 9, code: "IV-", label: "Inferior al término medio" },
  { minPercentile: 0, maxPercentile: 4, code: "V", label: "Deficiente" },
];

function buildPercentileTable() {
  const table = {};
  const commonYoung = {};
  for (let score = 1; score <= 25; score += 1) commonYoung[score] = 5;
  for (let score = 26; score <= 30; score += 1) commonYoung[score] = 10;
  for (let score = 31; score <= 37; score += 1) commonYoung[score] = 25;
  for (let score = 38; score <= 44; score += 1) commonYoung[score] = 50;
  for (let score = 45; score <= 49; score += 1) commonYoung[score] = 75;
  for (let score = 50; score <= 54; score += 1) commonYoung[score] = 90;
  for (let score = 55; score <= 60; score += 1) commonYoung[score] = 95;
  for (let age = 13; age <= 25; age += 1) table[age] = { ...commonYoung };

  const older = {};
  for (let score = 1; score <= 24; score += 1) older[score] = 5;
  for (let score = 25; score <= 27; score += 1) older[score] = 10;
  for (let score = 28; score <= 35; score += 1) older[score] = 25;
  for (let score = 36; score <= 44; score += 1) older[score] = 50;
  for (let score = 45; score <= 49; score += 1) older[score] = 75;
  for (let score = 50; score <= 54; score += 1) older[score] = 90;
  for (let score = 55; score <= 60; score += 1) older[score] = 95;
  for (let age = 26; age <= 65; age += 1) table[age] = { ...older };
  return table;
}

const PERCENTILE_BY_AGE = buildPercentileTable();

const ITEMS = SERIES.flatMap((series) =>
  Array.from({ length: 12 }, (_, index) => {
    const itemNumber = index + 1;
    const key = `${series}${itemNumber}`;
    return {
      key,
      series,
      itemNumber,
      options: series === "A" || series === "B" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7, 8],
      imagePath: `laminas/${key}.png`,
      imageAlt: `Lámina ${key} del Test de Raven`,
    };
  }),
);
