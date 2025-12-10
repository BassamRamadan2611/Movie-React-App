import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import MovieDetails from './components/MovieDetails.jsx'
import Pagination from './components/Pagination.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Movie details state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Debounce the search term
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '', page = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (!API_KEY) {
        console.error('TMDB API Key is missing!');
        setErrorMessage('API Key is missing');
        return;
      }

      // Build URL based on whether we have a search query
      const url = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

      const response = await fetch(url, API_OPTIONS);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('TMDB API Error:', response.status, errorData);
        throw new Error(`Failed to fetch movies: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Movies fetched successfully:', data.results?.length);
      
      setMovieList(data.results || []);
      setTotalPages(data.total_pages > 500 ? 500 : data.total_pages); // TMDB limits to 500 pages
      
      // If there's a search term and we got results, track it
      if (query && data.results && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Failed to fetch movies. Please try again.');
      setMovieList([]);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchMovieDetails = async (movieId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/${movieId}?append_to_response=credits,videos`,
        API_OPTIONS
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      
      const data = await response.json();
      setSelectedMovie(data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setErrorMessage('Failed to fetch movie details');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      console.log('Trending movies loaded:', movies?.length);
      setTrendingMovies(movies || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  const handleMovieClick = (movieId) => {
    fetchMovieDetails(movieId);
  }

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedMovie(null);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Fetch movies when search term or page changes
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]);

  // Load trending movies on mount
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : movieList && movieList.length > 0 ? (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onClick={() => handleMovieClick(movie.id)}
                  />
                ))}
              </ul>
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <p className="empty-state">No movies found. Try a different search!</p>
          )}
        </section>
      </div>

      {showDetails && selectedMovie && (
        <MovieDetails 
          movie={selectedMovie} 
          onClose={handleCloseDetails}
        />
      )}
    </main>
  )
}

export default App