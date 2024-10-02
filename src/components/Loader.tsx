export const Loader = () => {
  return (
    <div className="relative flex h-40 items-center justify-center">
      <div className="absolute h-full w-32 animate-spin rounded-full border-b-4 border-t-4 border-purple-500"></div>
      <img
        src="https://res.cloudinary.com/dc69f3e0o/image/upload/v1727881849/Pokedex/vimesftm9x5kb4uytiz2.png"
        className="h-28 w-28 rounded-full object-cover"
      />
    </div>
  );
};
