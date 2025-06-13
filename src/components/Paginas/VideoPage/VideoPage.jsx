import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from '../../../api/axios-config';
import styles from './VideoPage.module.css';
import Layout from '../../Layout/Layout';

const getThumbnailSource = (video) => {
  const s3BaseUrl = 'https://tcc-fiec-ti-informa.s3.us-east-2.amazonaws.com/';
  if (video?.thumbnail) {
    return `${s3BaseUrl}${video.thumbnail}`;
  }
  if (video?.key) {
    return `${s3BaseUrl}${video.key}`;
  }
  return 'https://placehold.co/300x169?text=Thumbnail+Indispon%C3%ADvel';
};

const VideoPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [recommendedError, setRecommendedError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [creatorProfilePhoto, setCreatorProfilePhoto] = useState('https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg');
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingMessage, setRatingMessage] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [showPlaylistSelect, setShowPlaylistSelect] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [videoViews, setVideoViews] = useState(0); 

  useEffect(() => {
    document.documentElement.classList.add(styles.htmlVideoPage);
    return () => {
      document.documentElement.classList.remove(styles.htmlVideoPage);
    };
  }, []);

  const getVideoSource = useCallback((videoKey) => {
    if (!videoKey) return '';
    return `https://tcc-fiec-ti-informa.s3.us-east-2.amazonaws.com/${videoKey}`;
  }, []);

  const getSimulatedUserId = () => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : 1;
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist || !videoId) {
      alert('Selecione uma playlist e verifique o vídeo');
      return;
    }

    setLoadingPlaylists(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/playlists/${selectedPlaylist}/adicionar-video`,
        {},
        {
          params: { videoId: videoId.toString() },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert('Vídeo adicionado à playlist!');
      setShowPlaylistSelect(false);
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar vídeo à playlist');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setLoadingPlaylists(true);
        const res = await axios.get('/playlists/minhas-playlists', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlaylists(res.data);
      } catch (error) {
        console.error('Erro ao buscar playlists:', error);
      } finally {
        setLoadingPlaylists(false);
      }
    };

    fetchPlaylists();
  }, []);

  useEffect(() => {
        const incrementAndFetchViews = async () => {
          if (!videoId) return;
    
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
          try {
            await axios.post(`/file/${videoId}/visualizacao`, {}, { headers });
            console.log(`Visualização do vídeo ${videoId} registrada com sucesso.`);
          } catch (viewError) {
            console.error('Erro ao incrementar visualização:', viewError);
          }
    
          try {
            const viewsResponse = await axios.get(`/file/${videoId}/visualizacoes`, { headers });
            if (viewsResponse.data !== null && typeof viewsResponse.data === 'number') {
              setVideoViews(viewsResponse.data);
            }
          } catch (fetchViewsError) {
            console.error('Erro ao buscar visualizações do vídeo:', fetchViewsError);
            setVideoViews(0);
          }
        };
    
        incrementAndFetchViews();
      }, [videoId]);

  useEffect(() => {
    const fetchVideoData = async () => {
      setLoading(true);
      setError('');
      setRecommendedError('');
      setHasRated(false);
      setUserRating(0);
      setComment('');
      setRatingMessage('');

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      setCurrentUserId(getSimulatedUserId());

      let currentVideoData = null;

      try {
        if (location.state?.video && (location.state.video.id_video || location.state.video.id)) {
          currentVideoData = location.state.video;
          setVideoData(currentVideoData);
        } else {
          if (!videoId) {
            throw new Error('ID do vídeo não encontrado');
          }
          const response = await axios.get(`/file/video/${videoId}`, { headers });
          if (!response.data) {
            throw new Error('Dados do vídeo não recebidos');
          }
          currentVideoData = response.data;
          setVideoData(currentVideoData);
        }

        if (currentVideoData?.criador?.fotoPerfil) {
          setCreatorProfilePhoto(currentVideoData.criador.fotoPerfil);
        } else {
          setCreatorProfilePhoto('https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg');
        }

        if (token && videoId) {
          try {
            const userId = getSimulatedUserId();
            const evalResponse = await axios.get(`/avaliacoes/usuario/${userId}/video/${videoId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (evalResponse.data) {
              setExistingEvaluation(evalResponse.data);
              setHasRated(true);
              setUserRating(evalResponse.data.nota);
              setComment(evalResponse.data.comentario);
            }
          } catch (err) {
            console.log('Usuário ainda não avaliou este vídeo', err);
          }
        }

      } catch (err) {
        console.error('Erro ao carregar vídeo principal:', err);
        setError(err.message || 'Erro ao carregar o vídeo. Por favor, tente novamente.');
        setLoading(false);
        return;
      }

      if (currentVideoData) {
        try {
          const recResponse = await axios.get('/file/videos-recomendados', { headers });
          const filteredRecommendedVideos = Array.isArray(recResponse.data)
            ? recResponse.data.filter(recVideo => {
                const currentVideoIdentifier = videoId || currentVideoData.id_video || currentVideoData.id;
                return recVideo.id_video != currentVideoIdentifier && recVideo.id != currentVideoIdentifier;
              })
            : [];
          setRecommendedVideos(filteredRecommendedVideos);
        } catch (recError) {
          console.error('Erro ao buscar recomendados:', recError);
          setRecommendedVideos([]);
          setRecommendedError('Não foi possível carregar vídeos recomendados no momento.');
        }

        if (token && currentVideoData.criador?.id) {
          try {
            const subResponse = await axios.get(`/subscriptions/check/${currentVideoData.criador.id}`, { headers });
            setIsSubscribed(subResponse.data?.isSubscribed || false);
          } catch (subError) {
            console.error('Erro ao verificar inscrição:', subError);
            setIsSubscribed(false);
          }
        }
      }
      setLoading(false);
    };

    fetchVideoData();
  }, [videoId, location.state, navigate, getVideoSource]); 

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!videoData?.criador?.id) {
        throw new Error('Criador do vídeo não identificado');
      }

      if (isSubscribed) {
        await axios.delete(`/subscriptions/unsubscribe/${videoData.criador.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`/subscriptions/subscribe/${videoData.criador.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsSubscribed(!isSubscribed);
    } catch (err) {
      console.error('Erro na inscrição:', err);
      setRatingMessage(err.response?.data?.message || 'Erro ao processar inscrição. Tente novamente.');
      setTimeout(() => setRatingMessage(''), 3000);
    }
  };

  const handleStarClick = (rating) => {
    if (!hasRated) {
      setUserRating(rating);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (hasRated) {
        setRatingMessage('Você já avaliou este vídeo.');
        setTimeout(() => setRatingMessage(''), 3000);
        return;
    }

    if (userRating === 0) {
      setRatingMessage('Por favor, selecione uma nota (estrelas).');
      setTimeout(() => setRatingMessage(''), 3000);
      return;
    }

    if (!comment.trim()) {
      setRatingMessage('Por favor, adicione um comentário.');
      setTimeout(() => setRatingMessage(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
          navigate('/login');
          return;
      }

      setRatingMessage('Enviando sua avaliação...');

      const response = await axios.post('/avaliacoes/create', {
          userId: currentUserId,
          videoId: videoId,
          nota: userRating,
          comentario: comment
      }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
      });

      if (response.data) {
          setHasRated(true);
          setExistingEvaluation(response.data);
          setRatingMessage('Obrigado pela sua avaliação!');
          setVideoData(prev => ({
              ...prev,
              numeroAvaliacoes: (prev.numeroAvaliacoes || 0) + 1,
              mediaAvaliacoes: (
                  (prev.mediaAvaliacoes || 0) * (prev.numeroAvaliacoes || 0) + userRating
              ) / ((prev.numeroAvaliacoes || 0) + 1)
          }));
      }
    } catch (err) {
      console.error('Erro ao avaliar o vídeo:', err);
      if (err.response?.status === 409) {
          setRatingMessage('Você já avaliou este vídeo anteriormente.');
          setHasRated(true);
          try {
            const userId = getSimulatedUserId();
            const evalResponse = await axios.get(`/avaliacoes/usuario/${userId}/video/${videoId}`, {
            });
            if (evalResponse.data) {
              setExistingEvaluation(evalResponse.data);
              setUserRating(evalResponse.data.nota);
              setComment(evalResponse.data.comentario);
            }
          } catch (fetchErr) {
            console.error('Erro ao buscar avaliação existente:', fetchErr);
          }
      } else {
          setRatingMessage(err.response?.data?.message || 'Erro ao avaliar. Tente novamente.');
      }
    } finally {
        setTimeout(() => setRatingMessage(''), 3000);
    }
  };

  const handleDeleteEvaluation = async () => {
    if (!existingEvaluation) return;

    try {
      setIsDeleting(true);
      setRatingMessage('Removendo sua avaliação...');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`/avaliacoes/${existingEvaluation.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setExistingEvaluation(null);
      setHasRated(false);
      setUserRating(0);
      setComment('');
      setRatingMessage('Avaliação removida com sucesso!');

      setVideoData(prev => ({
        ...prev,
        numeroAvaliacoes: Math.max((prev.numeroAvaliacoes || 1) - 1, 0),
        mediaAvaliacoes: prev.numeroAvaliacoes <= 1 ? 0 :
          ((prev.mediaAvaliacoes || 0) * (prev.numeroAvaliacoes || 0) - userRating) /
          Math.max((prev.numeroAvaliacoes || 1) - 1, 1)
      }));

    } catch (err) {
      console.error('Erro ao remover avaliação:', err);
      setRatingMessage(err.response?.data?.message || 'Erro ao remover avaliação. Tente novamente.');
    } finally {
      setIsDeleting(false);
      setTimeout(() => setRatingMessage(''), 3000);
    }
  };

  const formatDate = useCallback((dateString) => {
    try {
      if (!dateString) return 'Data desconhecida';
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Sao_Paulo'
      };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    } catch {
      return 'Data inválida';
    }
  }, []);

  const handleRecommendedVideoClick = useCallback((video) => {
    if (!video) return;
    navigate(`/video/${video.id_video || video.id}`, {
      state: { video },
      replace: true
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Layout />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Carregando vídeo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Layout />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.backButton}
            onClick={() => navigate('/')}
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className={styles.container}>
        <Layout />
        <div className={styles.errorContainer}>
          <p>Vídeo não encontrado</p>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Layout />
      <div className={styles.videoPageContainer}>
        <div className={styles.mainContent}>
          <div className={styles.videoPlayerContainer}>
            <video
              controls
              autoPlay
              className={styles.videoPlayer}
              src={getVideoSource(videoData.key)}
              onError={(e) => {
                console.error('Erro ao carregar vídeo:', e);
                e.target.parentElement.innerHTML = `
                  <div class="${styles.videoError}">
                    <p>Erro ao carregar o vídeo</p>
                    <button
                      class="${styles.retryButton}"
                      onclick="window.location.reload()"
                    >
                      Tentar novamente
                    </button>
                  </div>
                `;
              }}
            >
              Seu navegador não suporta vídeos HTML5.
            </video>
          </div>

          <div className={styles.videoInfo}>
            <div className={styles.videoInfoContainer}>
              <h1 className={styles.videoTitle}>{videoData.titulo || 'Título não disponível'}</h1>

              <div className={styles.videoMetadata}>
                <span className={styles.videoStat}>
                  <span>{videoViews} visualizações</span>
                </span>
                <span className={styles.videoStat}>•</span>
                <span className={styles.videoStat}>
                  <span>{formatDate(videoData.dataPublicacao)}</span>
                </span>
                <span className={styles.videoStat}>
                  • Média: {videoData.mediaAvaliacoes?.toFixed(1) || '0.0'} ({videoData.numeroAvaliacoes || 0} avaliações)
                </span>
              </div>

              <div className={styles.creatorInfo}>
                <div className={styles.creatorLeft}>
                  <img
                    src={creatorProfilePhoto}
                    alt={videoData.criador?.nome || 'Criador'}
                    className={styles.creatorAvatar}
                    onError={(e) => {
                      e.target.src = 'https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg';
                    }}
                  />
                  <div>
                    <h3 className={styles.creatorName}>
                      {videoData.criador?.nome || 'Criador desconhecido'}
                    </h3>
                    <p className={styles.subscriberCount}>
                      {videoData.criador?.totalInscritos || 0} inscritos
                    </p>
                  </div>
                </div>
                <div className={styles.actionButtons}>
                  {videoData.criador?.id && (
                    <button
                      className={`${styles.subscribeButton} ${isSubscribed ? styles.subscribed : ''}`}
                      onClick={handleSubscribe}
                      disabled={!videoData.criador.id}
                    >
                      {isSubscribed ? 'Inscrito' : 'Inscrever-se'}
                    </button>
                  )}
                  {localStorage.getItem('token') && (
                    <div className={styles.playlistAction}>
                      <button
                        className={styles.addToPlaylistButton}
                        onClick={() => setShowPlaylistSelect(!showPlaylistSelect)}
                      >
                        Adicionar à Playlist
                      </button>
                      {showPlaylistSelect && (
                        <div className={styles.playlistDropdown}>
                          <select
                            value={selectedPlaylist}
                            onChange={(e) => setSelectedPlaylist(e.target.value)}
                            className={styles.playlistSelect}
                          >
                            <option value="">Selecione uma playlist</option>
                            {playlists.map((pl) => (
                              <option
                                key={pl.id_playlist || pl.id}
                                value={pl.id_playlist || pl.id}
                              >
                                {pl.nome}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleAddToPlaylist}
                            disabled={!selectedPlaylist || loadingPlaylists}
                            className={styles.confirmAddButton}
                          >
                            {loadingPlaylists ? 'Adicionando...' : 'Confirmar'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.evaluationSection}>
                <h3 className={styles.evaluationTitle}>
                  {existingEvaluation ? 'Sua Avaliação' : 'Avalie este vídeo'}
                </h3>

                {existingEvaluation ? (
                  <div className={styles.existingEvaluation}>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`${styles.star} ${star <= existingEvaluation.nota ? styles.filledStar : ''}`}
                        >
                          &#9733;
                        </span>
                      ))}
                    </div>
                    <div className={styles.existingComment}>
                      <p>{existingEvaluation.comentario}</p>
                    </div>
                    <p className={styles.evaluationDate}>
                      Avaliado em: {formatDate(existingEvaluation.dataAvaliacao)}
                    </p>
                    <button
                      className={styles.deleteEvaluationButton}
                      onClick={handleDeleteEvaluation}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Removendo...' : 'Remover Avaliação'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`${styles.star} ${star <= userRating ? styles.filledStar : ''}`}
                          onClick={() => handleStarClick(star)}
                          style={{ cursor: hasRated ? 'not-allowed' : 'pointer' }}
                        >
                          &#9733;
                        </span>
                      ))}
                    </div>
                    <textarea
                      className={styles.commentInput}
                      placeholder="Deixe seu comentário aqui..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={hasRated}
                    />
                    <button
                      className={styles.submitEvaluationButton}
                      onClick={handleSubmitEvaluation}
                      disabled={hasRated || userRating === 0 || !comment.trim()}
                    >
                      {hasRated ? 'Avaliado' : 'Enviar Avaliação'}
                    </button>
                  </>
                )}
                {ratingMessage && <p className={styles.ratingMessage}>{ratingMessage}</p>}
              </div>

              <div className={styles.videoDescription}>
                <p>{videoData.descricao || 'Este vídeo não possui descrição.'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <h3 className={styles.recommendationsTitle}>Recomendados</h3>
          <div className={styles.recommendedVideos}>
            {recommendedError ? (
              <p className={styles.errorMessage}>{recommendedError}</p>
            ) : recommendedVideos.length > 0 ? (
              recommendedVideos.map((video) => (
                <div
                  key={video.id_video || video.id}
                  className={styles.recommendedVideoCard}
                  onClick={() => handleRecommendedVideoClick(video)}
                >
                  <div className={styles.thumbnailContainer}>
                    <img
                      src={getThumbnailSource(video)}
                      alt={video.titulo}
                      className={styles.thumbnail}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/300x169?text=Thumbnail+Indispon%C3%ADvel'
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
              <p className={styles.noRecommendations}>Nenhum vídeo recomendado disponível</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;