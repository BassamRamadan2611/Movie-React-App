const MovieCard = ({ movie, onClick }) => {
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  return (
    <li className="movie-card" onClick={onClick}>
      <div className="movie-poster">
        {movie.poster_path ? (
          <img
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={movie.title}
          />
        ) : (
          <div className="no-poster">No Image</div>
        )}
      </div>
      
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <div className="movie-meta">
          <span className="rating">⭐ {movie.vote_average?.toFixed(1)}</span>
          <span className="year">{movie.release_date?.split('-')[0]}</span>
        </div>
      </div>
    </li>
  );
};

export default MovieCard;