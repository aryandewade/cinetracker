const StatsPanel = ({ data }) => {
  const total = data.length;
  const movies = data.filter(i => i.type === "movie").length;
  const series = data.filter(i => i.type === "series").length;

  return (
    <div className="bg-slate-900/80 backdrop-blur p-6 rounded-xl mb-10">
      <h3 className="text-lg font-semibold mb-4">Stats</h3>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xl font-bold">{total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div>
          <p className="text-xl font-bold">{movies}</p>
          <p className="text-xs text-slate-400">Movies</p>
        </div>
        <div>
          <p className="text-xl font-bold">{series}</p>
          <p className="text-xs text-slate-400">Series</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
