import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import Layout from '../../Layout/Layout';
import { HiOutlineSearch, HiArrowRight } from 'react-icons/hi';
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

  const [recommendedStartIndex, setRecommendedStartIndex] = useState(0);
  const [popularStartIndex, setPopularStartIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchRecommendedVideos = async () => {
      try {
        setLoadingRecommended(true);
        const response = await api.get('/file/videos-recomendados');
        setRecommendedVideos(response.data);
      } catch (error) {
        console.error("Erro ao buscar vídeos recomendados:", error);
        if (error.response?.status === 401) {
          setErrorRecommended('Sessão expirada ou não autorizado. Por favor, faça login novamente.');
          navigate('/login');
        } else {
          setErrorRecommended('Erro ao buscar vídeos recomendados.');
        }
      } finally {
        setLoadingRecommended(false);
      }
    };

    const fetchPopularVideos = async () => {
      try {
        setLoadingPopular(true);
        const response = await api.get('/file/videos-populares');
        const sortedPopularVideos = response.data.sort((a, b) => {
          const viewsA = a.visualizacoes || 0; 
          const viewsB = b.visualizacoes || 0;
          return viewsB - viewsA; 
        });
        setPopularVideos(sortedPopularVideos);
      } catch (error) {
        console.error("Erro ao buscar vídeos populares:", error);
        setErrorPopular('Erro ao buscar vídeos populares.');
      } finally {
        setLoadingPopular(false);
      }
    };

    fetchRecommendedVideos();
    fetchPopularVideos();

  }, [navigate]);

  const getThumbnailSource = (video) => {
    const s3BaseUrl = 'https://tcc-fiec-ti-informa.s3.us-east-2.amazonaws.com/';
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
                  <span className={styles.videoDuration}>10:30</span>
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
          />
          <HiOutlineSearch className={styles.iconePesquisa} />
        </div>
        <div className={styles.filtros}>
          <span className={styles.tituloFiltros}>Filtros</span>
          <select className={styles.selectCategorias}>
            <option>Todas as categorias</option>
          </select>
        </div>
      </div>

      <div className={styles.secao}>
        <h2 className={styles.tituloSecao}>
          Recomendados de acordo com seus interesses.
        </h2>
        {renderVideoCards(recommendedVideos, loadingRecommended, errorRecommended, recommendedStartIndex, 'recommended')}
      </div>

      <div className={styles.secao}>
        <h2 className={styles.tituloSecao}>Populares</h2>
        {renderVideoCards(popularVideos, loadingPopular, errorPopular, popularStartIndex, 'popular')}
      </div>
    </div>
  );
};

export default Home;