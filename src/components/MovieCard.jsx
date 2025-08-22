export default function MovieCard({ movie, hasNext, onNext, onHome }) {
  if (!movie) return null
  return (
    <div className="text-white">
      <h2 className="text-center text-xl font-extrabold">
        {movie.title} ({movie.year})
      </h2>
      <img
        src={movie.poster}
        alt={movie.title}
        className="rounded-xl my-4 mx-auto max-h-80 object-cover"
      />
      <p className="text-sm text-gray-300">{movie.overview}</p>

      {hasNext ? (
        <button
          onClick={onNext}
          className="w-full mt-5 py-3 rounded-xl bg-green-500 font-bold hover:brightness-110 active:scale-[.99]"
        >
          Next Movie
        </button>
      ) : (
        <button
          onClick={onHome}
          className="w-full mt-5 py-3 rounded-xl bg-indigo-500 font-bold hover:brightness-110 active:scale-[.99]"
        >
          Start Over
        </button>
      )}
    </div>
  )
}
