import MediaCard from "./MediaCard";

const YearGroup = ({ year, months, onDelete, onEdit }) => {
  const total = Object.values(months).flat().length;

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-semibold mb-2">
        {year} <span className="text-slate-400 text-lg">({total})</span>
      </h2>

      {Object.entries(months).map(([month, items]) => (
        <div key={month} className="mb-6">
          <h3 className="text-xl mb-3 text-blue-400">
            {month} ({items.length})
          </h3>

          <div className="flex gap-4 flex-wrap">
            {items.map((item) => (
              <MediaCard
                key={item.id + item.watchedOn}
                item={item}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default YearGroup;
