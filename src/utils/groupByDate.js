export const groupByYearAndMonth = (items) => {
  const grouped = {};

  items.forEach((item) => {
    const date = new Date(item.watchedOn);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" });

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];

    grouped[year][month].push(item);
  });

  return grouped;
};
