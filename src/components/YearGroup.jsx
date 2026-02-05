import MediaCard from "./MediaCard";

const YearGroup = ({ year, months, onDelete, onEdit }) => {
  return (
    <div className="mb-12 animate-fade-in">
      <h2 className="text-4xl font-bold text-text-primary mb-6 border-b border-border pb-2 opacity-40 hover:opacity-100 transition-opacity">
        {year}
      </h2>
      {Object.keys(months)
        .sort((a, b) => b - a)
        .map((month) => (
          <div key={month} className="mb-8">
            <h3 className="text-lg font-medium text-text-secondary mb-4 uppercase tracking-wider pl-1">
              {new Date(0, month).toLocaleString("default", {
                month: "long",
              })}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {months[month].map((item) => (
                <MediaCard
                  key={item.id}
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
