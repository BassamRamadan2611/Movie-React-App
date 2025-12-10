const MovieDetails = ({ movie, onClose }) => {
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

  // Get the first trailer if available
  const trailer = movie.videos?.results?.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  );

  // Get main cast (first 10)
  const mainCast = movie.credits?.cast?.slice(0, 10) || [];

  // Format runtime
  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="movie-details-overlay" onClick={onClose}>
      <div className="movie-details-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Backdrop */}
        {movie.backdrop_path && (
          <div className="movie-backdrop">
            <img
              src={`${IMAGE_BASE_URL}original${movie.backdrop_path}`}
              alt={movie.title}
            />
            <div className="backdrop-overlay" />
          </div>
        )}

        <div className="movie-details-body">
          <div className="movie-details-header">
            {/* Poster */}
            {movie.poster_path && (
              <img
                src={`${IMAGE_BASE_URL}w500${movie.poster_path}`}
                alt={movie.title}
                className="movie-details-poster"
              />
            )}

            <div className="movie-details-info">
              <h1>{movie.title}</h1>
              
              {movie.tagline && (
                <p className="tagline">{movie.tagline}</p>
              )}

              <div className="movie-meta">
                <span className="rating">⭐ {movie.vote_average?.toFixed(1)}/10</span>
                <span>{movie.release_date?.split('-')[0]}</span>
                {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="genres">
                  {movie.genres.map((genre) => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="overview">
                <h3>Overview</h3>
                <p>{movie.overview}</p>
              </div>

              {trailer && (
                <div className="trailer-section">
                  <h3>Trailer</h3>
                  <div className="trailer-container">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title="Movie Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            {movie.budget > 0 && (
              <div className="info-item">
                <strong>Budget:</strong> {formatCurrency(movie.budget)}
              </div>
            )}
            {movie.revenue > 0 && (
              <div className="info-item">
                <strong>Revenue:</strong> {formatCurrency(movie.revenue)}
              </div>
            )}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="info-item">
                <strong>Production:</strong>{' '}
                {movie.production_companies.map(c => c.name).join(', ')}
              </div>
            )}
          </div>

          {/* Cast */}
          {mainCast.length > 0 && (
            <div className="cast-section">
              <h3>Cast</h3>
              <div className="cast-grid">
                {mainCast.map((person) => (
                  <div key={person.id} className="cast-member">
                    {person.profile_path ? (
                      <img
                        src={`${IMAGE_BASE_URL}w185${person.profile_path}`}
                        alt={person.name}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <div className="cast-info">
                      <p className="cast-name">{person.name}</p>
                      <p className="cast-character">{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;