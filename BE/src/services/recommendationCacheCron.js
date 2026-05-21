const cron = require("node-cron");
const {
  cleanupExpiredRecommendationCaches,
  markAllRecommendationCachesForRefresh,
} = require("./recommendationCacheService.js");
const {
  refreshRecommendationTrendSnapshot,
} = require("./recommendationTrendService.js");

let started = false;

// Chạy dọn cache hết hạn và đánh dấu cache cần tính lại.
const runCacheReset = async (label) => {
  try {
    await cleanupExpiredRecommendationCaches();
    await markAllRecommendationCachesForRefresh();
    console.log(`Recommendation cache reset completed at ${label}`);
  } catch (error) {
    console.error("Failed to reset recommendation cache:", error);
  }
};

// Làm mới snapshot trend định kỳ để recommendation có dữ liệu hot mới nhất.
const runTrendSnapshotRefresh = async (label) => {
  try {
    await refreshRecommendationTrendSnapshot();
    console.log(`Recommendation trend snapshot refreshed at ${label}`);
  } catch (error) {
    console.error("Failed to refresh recommendation trend snapshot:", error);
  }
};

// Khởi động cron job theo lịch cố định trong ngày.
const startRecommendationCacheCronJobs = () => {
  if (started) {
    return;
  }

  started = true;

  const options = {
    timezone: "Asia/Ho_Chi_Minh",
  };

  cron.schedule(
    "0 7 * * *",
    () => runCacheReset("07:00"),
    options,
  );

  cron.schedule(
    "0 16 * * *",
    () => runCacheReset("16:00"),
    options,
  );

  cron.schedule(
    "10 0 1 * *",
    () => runTrendSnapshotRefresh("monthly-00:10"),
    options,
  );
};

module.exports = {
  startRecommendationCacheCronJobs,
};
