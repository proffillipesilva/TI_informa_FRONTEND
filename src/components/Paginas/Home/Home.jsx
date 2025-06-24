import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import Layout from '../../Layout/Layout';
import { HiOutlineSearch, HiArrowRight } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios-config';

const Home = () => {
  const navigate = useNavigate();
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [popularVideos, setPopularVideos] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [errorRecommended, setErrorRecommended] = useState(null);
  const [errorPopular, setErrorPopular] = useState(null);
  const [filter, setFilter] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [recommendedStartIndex, setRecommendedStartIndex] = useState(0);
  const [popularStartIndex, setPopularStartIndex] = useState(0);

  const fetchVideos = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoadingRecommended(true);
      setLoadingPopular(true);

      let recommendedEndpoint = '/file/videos-recomendados';
      let popularEndpoint = '/file/videos-populares';

      if (filter === 'top-rated') {
        recommendedEndpoint = '/file/videos-mais-avaliados/interesses';
        popularEndpoint = '/file/videos-mais-avaliados/populares';
      } else if (filter === 'recent') {
        recommendedEndpoint = '/file/videos-recentes/interesses';
        popularEndpoint = '/file/videos-recentes/populares';
      }

      const recommendedResponse = await api.get(recommendedEndpoint);
      setRecommendedVideos(recommendedResponse.data);

      const popularResponse = await api.get(popularEndpoint);
      let sortedPopularVideos = popularResponse.data;
      
      if (filter === 'default') {
        sortedPopularVideos = sortedPopularVideos.sort((a, b) => {
          const viewsA = a.visualizacoes || 0;
          const viewsB = b.visualizacoes || 0;
          return viewsB - viewsA;
        });
      }
      setPopularVideos(sortedPopularVideos);

    } catch (error) {
      console.error("Erro ao buscar vídeos:", error);
      if (error.response?.status === 401) {
        setErrorRecommended('Sessão expirada ou não autorizado. Por favor, faça login novamente.');
        navigate('/login');
      } else {
        setErrorRecommended('Erro ao buscar vídeos.');
        setErrorPopular('Erro ao buscar vídeos.');
      }
    } finally {
      setLoadingRecommended(false);
      setLoadingPopular(false);
    }
  };

  const searchVideos = async (term) => {
    if (!term.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await api.get(`/file/buscar?termo=${encodeURIComponent(term)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Erro ao buscar vídeos:", error);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchVideos(searchTerm);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!isSearching) {
      fetchVideos();
    }
  }, [navigate, filter, isSearching]);

  const getThumbnailSource = (video) => {
    const s3BaseUrl = 'https://tiinformafiec.s3.us-east-1.amazonaws.com/';
    if (video?.thumbnail) {
      return `${s3BaseUrl}${video.thumbnail}`;
    }
    if (video?.key) {
      return `${s3BaseUrl}${video.key}`;
    }
    if (video?.urlDoThumbnail) {
      return video.urlDoThumbnail;
    }
    return 'https://placehold.co/300x169?text=Thumbnail+Indispon%C3%ADvel';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleVideoClick = (video) => {
    navigate(`/video/${video.id_video || video.id}`, {
      state: { video }
    });
  };

  const handleNextVideos = (type) => {
    if (type === 'recommended') {
      setRecommendedStartIndex(prevIndex => prevIndex + 10);
    } else if (type === 'popular') {
      setPopularStartIndex(prevIndex => prevIndex + 10);
    }
  };

  const handlePrevVideos = (type) => {
    if (type === 'recommended') {
      setRecommendedStartIndex(prevIndex => Math.max(0, prevIndex - 10));
    } else if (type === 'popular') {
      setPopularStartIndex(prevIndex => Math.max(0, prevIndex - 10));
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setRecommendedStartIndex(0);
    setPopularStartIndex(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getSectionTitle = () => {
    switch (filter) {
      case 'top-rated':
        return 'Bem avaliados de acordo com seus interesses.';
      case 'recent':
        return 'Recentes de acordo com seus interesses.';
      default:
        return 'Recomendados de acordo com seus interesses.';
    }
  };

  const renderVideoCards = (videos, loading, error, startIndex, type) => {
    if (loading) {
      return <p>Carregando vídeos...</p>;
    }
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }
    if (videos.length === 0) {
      return <p>Nenhum vídeo encontrado.</p>;
    }
  
    const videosToDisplay = videos.slice(startIndex, startIndex + 10);
    const hasMoreVideos = (startIndex + 10) < videos.length;
    const hasPreviousVideos = startIndex > 0;
  
    return (
      <div className={styles.carouselContainer}>
        {hasPreviousVideos && (
          <button
            className={`${styles.carouselButton} ${styles.prevButton}`}
            onClick={() => handlePrevVideos(type)}
          >
            <HiArrowRight style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
  
        <div className={styles.recommendedVideos}>
          {videosToDisplay.length > 0 ? (
            videosToDisplay.map((video) => (
              <div
                key={video.id_video || video.id}
                className={styles.recommendedVideoCard}
                onClick={() => handleVideoClick(video)}
              >
                <div className={styles.thumbnailContainer}>
                  <img
                    src={getThumbnailSource(video)}
                    alt={video.titulo}
                    className={styles.thumbnail}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x169?text=Thumbnail+Indispon%C3%ADvel';
                    }}
                  />
                  <div className={styles.thumbnailRating}>
                    <span className={styles.ratingStars}>
                      {video.avaliacaoMedia?.toFixed(1) || '0.0'} <FaStar size={12} />
                    </span>
                  </div>
                </div>
                <div className={styles.recommendedVideoInfo}>
                  <h4 className={styles.recommendedVideoTitle}>
                    {video.titulo || 'Vídeo sem título'}
                  </h4>
                  <p className={styles.recommendedVideoCreator}>
                    {video.criador?.nome || 'Criador desconhecido'}
                  </p>
                  <p className={styles.recommendedVideoStats}>
                    {video.visualizacoes || 0} visualizações • {formatDate(video.dataPublicacao)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noVideosMessage}>Nenhum vídeo disponível nesta seção.</p>
          )}
        </div>
  
        {hasMoreVideos && (
          <button
            className={`${styles.carouselButton} ${styles.nextButton}`}
            onClick={() => handleNextVideos(type)}
          >
            <HiArrowRight />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.paginaHome}>
      <Layout />
      <div className={styles.barraPesquisaFiltros}>
        <div className={styles.barraPesquisaContainer}>
          <input
            type="text"
            placeholder="Pesquisar..."
            className={styles.barraPesquisa}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <HiOutlineSearch className={styles.iconePesquisa} />
        </div>
        <div className={styles.filtros}>
          <span className={styles.tituloFiltros}>Filtros</span>
          <select 
            className={styles.selectCategorias}
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="default">Nenhum</option>
            <option value="top-rated">Bem avaliados</option>
            <option value="recent">Mais recente</option>
          </select>
        </div>
      </div>

      {isSearching ? (
        <div className={styles.secao}>
          <h2 className={styles.tituloSecao}>
            Resultados da busca: "{searchTerm}"
          </h2>
          {renderVideoCards(searchResults, false, null, 0, 'search')}
        </div>
      ) : (
        <>
          <div className={styles.secao}>
            <h2 className={styles.tituloSecao}>
              {getSectionTitle()}
            </h2>
            {renderVideoCards(recommendedVideos, loadingRecommended, errorRecommended, recommendedStartIndex, 'recommended')}
          </div>

          <div className={styles.secao}>
            <h2 className={styles.tituloSecao}>
              {filter === 'top-rated' ? 'Bem avaliados' : filter === 'recent' ? 'Recentes' : 'Populares'}
            </h2>
            {renderVideoCards(popularVideos, loadingPopular, errorPopular, popularStartIndex, 'popular')}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;