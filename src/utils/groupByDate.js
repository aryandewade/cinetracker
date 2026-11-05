export const groupByYearAndMonth = (items) => {
  const grouped = {};

  items.forEach((item) => {
    // Skip items without a valid watch date (e.g. legacy rows) instead of
    // grouping them under a broken "NaN" year.
    const date = item.watchedOn ? new Date(item.watchedOn) : null;
    if (!date || isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];

    grouped[year][month].push(item);
  });

  // Sort entries within each month chronologically.
  Object.values(grouped).forEach((months) => {
    Object.values(months).forEach((list) => {
      list.sort((a, b) => new Date(a.watchedOn) - new Date(b.watchedOn));
    });
  });

  return grouped;
};
