const SEASON_BY_MONTH = {
  1: "winter",
  2: "winter",
  3: "spring",
  4: "spring",
  5: "spring",
  6: "summer",
  7: "summer",
  8: "summer",
  9: "rainy",
  10: "rainy",
  11: "rainy",
  12: "winter",
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getSeasonFromMonth = (month) => {
  const numericMonth = Number(month);
  if (!Number.isFinite(numericMonth) || numericMonth < 1 || numericMonth > 12) {
    return "all";
  }

  return SEASON_BY_MONTH[numericMonth] || "all";
};

const normalizeTagList = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(item)).filter(Boolean);
};

const isHolidayLike = (value) => {
  const text = normalizeText(value);
  return ["true", "1", "yes", "holiday", "tet", "tet-nguyen-dan"].includes(text);
};

module.exports = {
  getSeasonFromMonth,
  normalizeTagList,
  normalizeText,
  isHolidayLike,
};
