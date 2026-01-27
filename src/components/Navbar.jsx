const Navbar = () => {
  return (
    
    <nav className="fixed top-0 w-full z-50 backdrop-blur bg-black/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
       <h1
  className="text-xl font-bold text-blue-400 cursor-pointer"
  onClick={() => {
    window.location.reload();
  }}
>
  CineTrack
</h1>

        <span className="text-slate-400 text-sm">
          Your personal watch history
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
