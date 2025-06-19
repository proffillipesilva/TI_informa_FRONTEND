import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from '../../../api/axios-config';
import styles from './PlaylistVideo.module.css';
import Layout from '../../Layout/Layout';
import { FaStar } from 'react-icons/fa';

const getThumbnailSource = (video) => {
  const s3BaseUrl = 'https://tiinformafiec.s3.us-east-1.amazonaws.com/';

  if (video?.videoThumbnail) {
    return `${s3BaseUrl}${video.videoThumbnail}`;
  }
  if (video?.thumbnail) {
    return `${s3BaseUrl}${video.thumbnail}`;
  }
  return 'https://placehold.co/300x169?text=Thumbnail+Indispon%C3%ADvel';
};

const PlaylistVideo = () => {
  const { playlistId, videoId } = useParams();
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
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const [videoViews, setVideoViews] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [showPlaylistSelect, setShowPlaylistSelect] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');

  const getVideoSource = useCallback((video) => {
    const s3BaseUrl = 'https://tiinformafiec.s3.us-east-1.amazonaws.com/';
    
    if (!video) {
      console.error("getVideoSource: objeto de vídeo é nulo");
      return null;
    }
    
    if (video.videoKey) {
      return `${s3BaseUrl}${video.videoKey}`;
    }
    if (video.key) {
      return `${s3BaseUrl}${video.key}`;
    }
    
    console.error("Nenhuma chave de vídeo encontrada:", video);
    return null;
  }, []);

  const handleVideoClick = (video) => {
    const newVideoId = video.id || video.videoId || video.id_video;
    if (!newVideoId) {
      console.error("ID do vídeo não encontrado:", video);
      return;
    }
    
    setExistingEvaluation(null);
    setHasRated(false);
    setUserRating(0);
    setComment('');
    setRatingMessage('');
    
    setCurrentVideoId(newVideoId);
    navigate(`/playlist/${playlistId}/video/${newVideoId}`, {
      state: {
        video,
        fromPlaylist: true,
        playlistId,
        playlistVideos
      }
    });
  };

  const isEmpty = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  };

  const getAuthenticatedUserId = () => {
    const storedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!storedUserId || !token) {
      return null;
    }
    return parseInt(storedUserId, 10);
  };

  useEffect(() => {
    document.documentElement.classList.add(styles.htmlVideoPage);
    return () => {
      document.documentElement.classList.remove(styles.htmlVideoPage);
    };
  }, []);
  

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Data desconhecida';

    try {
      let normalizedDateString = String(dateString);
      if (!normalizedDateString.endsWith('Z') && !normalizedDateString.includes('+')) {
        normalizedDateString += 'Z';
      }
      
      const date = new Date(normalizedDateString);
      
      if (isNaN(date.getTime())) {
        throw new Error('Data inválida');
      }

      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error, "Input:", dateString);
      return 'Data inválida';
    }
  }, []);
  

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist || !currentVideoId) {
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
          params: { videoId: currentVideoId.toString() },
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
    const fetchPlaylistData = async () => {
      const token = localStorage.getItem('token');
      if (!token || !playlistId) return;
  
      try {
        const response = await axios.get(`/playlists/${playlistId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Dados da playlist:', response.data);
        setPlaylistName(response.data.nome);
        setPlaylistVideos(response.data.videos || []);
      } catch (error) {
        console.error('Erro ao buscar dados da playlist:', error);
      }
    };
  
    fetchPlaylistData();
  }, [playlistId]);

  useEffect(() => {
    const incrementAndFetchViews = async () => {
      if (!currentVideoId) return;

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        await axios.post(`/file/${currentVideoId}/visualizacao`, {}, { headers });
        console.log(`Visualização do vídeo ${currentVideoId} registrada com sucesso.`);
      } catch (viewError) {
        console.error('Erro ao incrementar visualização:', viewError);
      }

      try {
        const viewsResponse = await axios.get(`/file/${currentVideoId}/visualizacoes`, { headers });
        if (viewsResponse.data !== null && typeof viewsResponse.data === 'number') {
          setVideoViews(viewsResponse.data);
        }
      } catch (fetchViewsError) {
        console.error('Erro ao buscar visualizações do vídeo:', fetchViewsError);
        setVideoViews(0);
      }
    };

    incrementAndFetchViews();
  }, [currentVideoId]);

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

      try {
        const userId = getAuthenticatedUserId();
        setCurrentUserId(userId);
      } catch {
        console.log('Usuário não autenticado - avaliações desabilitadas');
      }

      let currentVideoData = null;

      try {
        if (location.state?.video) {
          currentVideoData = {
            ...location.state.video,
            avaliacaoMedia: location.state.video.avaliacaoMedia || location.state.video.rating || 0
          };
          console.log('Video data from location.state:', currentVideoData);
          setVideoData(currentVideoData);
        } else {
          if (!currentVideoId) {
            throw new Error('ID do vídeo não encontrado');
          }
          const response = await axios.get(`/file/video/${currentVideoId}`, { headers });
          console.log('Video data from API:', response.data);
          if (!response.data) {
            throw new Error('Dados do vídeo não recebidos');
          }
          currentVideoData = {
            ...response.data,
            avaliacaoMedia: response.data.avaliacaoMedia || response.data.rating || 0
          };
          setVideoData(currentVideoData);
        }

        if (currentVideoData?.criador?.fotoPerfil) {
          setCreatorProfilePhoto(currentVideoData.criador.fotoPerfil);
        } else {
          setCreatorProfilePhoto('https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg');
        }

        if (token && currentVideoId && currentUserId) {
          try {
            const evalResponse = await axios.get(
              `/avaliacoes/usuario/${currentUserId}/video/${currentVideoId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          
            if (evalResponse.data && !isEmpty(evalResponse.data)) {
              const evaluationData = {
                ...evalResponse.data,
                dataAvaliacao: evalResponse.data.dataAvaliacao || new Date().toISOString()
              };
              
              setExistingEvaluation(evaluationData);
              setHasRated(true);
              setUserRating(evalResponse.data.nota);
              setComment(evalResponse.data.comentario);
            } else {
              setExistingEvaluation(null);
              setHasRated(false);
            }
          } catch (err) {
            if (err.response?.status === 404) {
              setExistingEvaluation(null);
              setHasRated(false);
            } else {
              console.error('Erro ao buscar avaliação:', err);
            }
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
                return recVideo.id_video != currentVideoId && recVideo.id != currentVideoId;
              }).map(video => ({
                ...video,
                avaliacaoMedia: video.avaliacaoMedia || 0
              }))
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
  }, [currentVideoId, location.state, navigate, getVideoSource, currentUserId]);
  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
  
      if (!videoData?.criador?.id) {
        throw new Error('Criador do vídeo não identificado');
      }
  
      const request = {
        userId: userId,
        criadorId: videoData.criador.id,
        inscrever: !isSubscribed
      };
  
      const response = await axios.post('/criador/inscricao', request, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setIsSubscribed(!isSubscribed);
      setVideoData(prev => ({
        ...prev,
        criador: {
          ...prev.criador,
          totalInscritos: response.data.totalInscritos
        }
      }));
  
      setRatingMessage(isSubscribed ? 'Inscrição removida com sucesso!' : 'Inscrito com sucesso!');
    } catch (err) {
      console.error('Erro na inscrição:', err);
      setRatingMessage(err.response?.data?.message || 'Erro ao processar inscrição. Tente novamente.');
    } finally {
      setTimeout(() => setRatingMessage(''), 3000);
    }
  };
  
  useEffect(() => {
    const fetchTotalInscritos = async () => {
      if (!videoData?.criador?.id) return;
      
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`/criador/${videoData.criador.id}/inscritos`, { headers });
        
        setVideoData(prev => ({
          ...prev,
          criador: {
            ...prev.criador,
            totalInscritos: response.data
          }
        }));
      } catch (error) {
        console.error('Erro ao buscar total de inscritos:', error);
      }
    };
  
    fetchTotalInscritos();
  }, [videoData?.criador?.id]);
  
  useEffect(() => {
    const checkSubscription = async () => {
      if (!videoData?.criador?.id || !currentUserId) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/subscriptions/check/${videoData.criador.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsSubscribed(response.data?.isSubscribed || false);
      } catch (error) {
        console.error('Erro ao verificar inscrição:', error);
        setIsSubscribed(false);
      }
    };
  
    checkSubscription();
  }, [videoData?.criador?.id, currentUserId]);

  const handleStarClick = (rating) => {
    if (!hasRated) {
      setUserRating(rating);
    }
  };

  const handleSubmitEvaluation = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); 
    
    try {    
      if (!userId || userId === "undefined" || isNaN(userId)) {
        setRatingMessage('ID de usuário inválido. Faça login novamente.');
        localStorage.removeItem('userId');
        navigate('/login');
        return;
      }
  
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
  
      setRatingMessage('Enviando sua avaliação...');
  
      await Promise.all([
        axios.post('/avaliacoes/create', {
          userId: Number(userId),
          videoId: Number(videoId),
          nota: userRating,
          comentario: comment
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        axios.get(`/file/${videoId}/avaliacao-media`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
  
      const [evalResponse, mediaResponse] = await Promise.all([
        axios.get(`/avaliacoes/usuario/${userId}/video/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/file/${videoId}/avaliacao-media`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
  
      if (evalResponse.data) {
        setExistingEvaluation({
          ...evalResponse.data,
          dataAvaliacao: evalResponse.data.dataAvaliacao || new Date().toISOString()
        });
        setHasRated(true);
        setUserRating(evalResponse.data.nota);
        setComment(evalResponse.data.comentario);
      }
  
      setVideoData(prev => ({
        ...prev,
        avaliacaoMedia: mediaResponse.data
      }));
  
      setRatingMessage('Obrigado pela sua avaliação!');
  
    } catch (err) {
      console.error('Erro ao avaliar o vídeo:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setRatingMessage('Sessão expirada. Faça login novamente.');
        navigate('/login', { state: { from: location.pathname } });
        
      } else if (err.response?.status === 409) {
        setRatingMessage('Você já avaliou este vídeo anteriormente.');
        setHasRated(true);
        
        try {
          if (!token) throw new Error('Token não encontrado');
  
          const [evalResponse, mediaResponse] = await Promise.all([
            axios.get(`/avaliacoes/usuario/${userId}/video/${videoId}`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`/file/${videoId}/avaliacao-media`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
  
          if (evalResponse.data) {
            setExistingEvaluation({
              ...evalResponse.data,
              dataAvaliacao: evalResponse.data.dataAvaliacao || new Date().toISOString()
            });
            setUserRating(evalResponse.data.nota);
            setComment(evalResponse.data.comentario);
          }
  
          setVideoData(prev => ({
            ...prev,
            avaliacaoMedia: mediaResponse.data
          }));
  
        } catch (fetchErr) {
          console.error('Erro ao buscar avaliação existente:', fetchErr);
          setRatingMessage('Erro ao carregar avaliação existente.');
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
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    await axios.delete(`/avaliacoes/${existingEvaluation.id}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-User-Id': userId
      }
    });

    const mediaResponse = await axios.get(`/file/${videoId}/avaliacao-media`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const mediaAtualizada = mediaResponse.data;

    setExistingEvaluation(null);
    setHasRated(false);
    setUserRating(0);
    setComment('');
    
    setVideoData(prev => ({
      ...prev,
      avaliacaoMedia: mediaAtualizada
    }));

    setRatingMessage('Avaliação removida com sucesso!');
  } catch (err) {
    console.error('Erro ao remover avaliação:', err);
    setRatingMessage(err.response?.data?.message || 'Erro ao remover avaliação. Tente novamente.');
  } finally {
    setIsDeleting(false);
    setTimeout(() => setRatingMessage(''), 3000);
  }
};

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
            src={getVideoSource(videoData)}
            onError={(e) => {
              console.error('Erro ao carregar vídeo:', e);
              e.target.parentElement.innerHTML = `
                <div class="${styles.videoError}">
                  <p>Erro ao carregar o vídeo</p>
                  <button
                    class="${styles.retryButton}"
                    onClick={() => window.location.reload()}
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

              <div className={styles.videoStatsContainer}>
                <div className={styles.videoMetadata}>
                  <span className={styles.videoStat}>
                    <span>{videoViews} visualizações</span>
                  </span>
                  <span className={styles.videoStat}>•</span>
                  <span className={styles.videoStat}>
                    <span>{formatDate(videoData.dataPublicacao)}</span>
                  </span>
                  <div className={styles.ratingContainer}>
                  <span className={styles.videoStat}>
                    {videoData.avaliacaoMedia?.toFixed(1) || '0.0'} <FaStar />
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.creatorInfo}>
            <div className={styles.creatorLeft}>
              <img
                src={creatorProfilePhoto}
                alt={videoData.criador?.nome || 'Criador'}
                className={styles.creatorAvatar}
                onClick={() => navigate(`/perfil/${videoData.criador?.id}`)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  e.target.src = 'https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg';
                }}
              />
                <div>
                <h3 className={styles.creatorName}>
                  {videoData.criador?.nome || videoData.nomeCriador || 'Criador desconhecido'}
                </h3>
                  <div className={styles.subscriberContainer}>
                    <p className={styles.subscriberCount}>
                      {videoData.criador?.totalInscritos || 0} inscritos
                    </p>
                    {videoData.criador?.id && (
                      <button
                        className={`${styles.subscribeButton} ${isSubscribed ? styles.subscribed : ''}`}
                        onClick={handleSubscribe}
                        disabled={!videoData.criador.id}
                      >
                        {isSubscribed ? 'Inscrito' : 'Inscrever-se'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.actionButtons}>
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
                      {existingEvaluation?.dataAvaliacao 
                        ? `Avaliado em: ${formatDate(existingEvaluation.dataAvaliacao)}`
                        : 'Data de avaliação indisponível'}
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
          {playlistVideos.length > 0 ? (
              <div className={styles.playlistVideosSection}>
                <h3 className={styles.playlistVideosTitle}>
                  Vídeos da Playlist: {playlistName}
                </h3>
                <div className={styles.playlistVideosList}>
                {playlistVideos
                  .filter(video => {
                    const currentVideoIdStr = String(currentVideoId || videoId);
                    const videoIdStr = String(video.id || video.videoId || video.id_video);
                    return videoIdStr !== currentVideoIdStr;
                  })
                  .length > 0 ? (
                  playlistVideos
                    .filter(video => {
                      const currentVideoIdStr = String(currentVideoId || videoId);
                      const videoIdStr = String(video.id || video.videoId || video.id_video);
                      return videoIdStr !== currentVideoIdStr;
                    })
                    .map((video) => (
                      <div
                        key={video.id}
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
                            {(video.avaliacaoMedia || video.rating || video.avaliacao?.media || 0).toFixed(1)} 
                            <FaStar size={12} />
                          </span>
                          </div>
                        </div>
                        <div className={styles.recommendedVideoInfo}>
                          <h4 className={styles.recommendedVideoTitle}>
                            {video.titulo || 'Vídeo sem título'}
                          </h4>
                          <p className={styles.recommendedVideoCreator}>
                            {video.criador?.nome || video.nomeCriador || 'Criador desconhecido'}
                          </p>
                          <p className={styles.recommendedVideoStats}>
                            {video.visualizacoes || 0} visualizações • {formatDate(video.dataPublicacao)}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className={styles.emptyPlaylistMessage}>Nenhum outro vídeo nesta playlist</p>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.playlistVideosSection}>
              <h3 className={styles.playlistVideosTitle}>
                Vídeos da Playlist: {playlistName}
              </h3>
              <p className={styles.emptyPlaylistMessage}>Esta playlist não contém vídeos</p>
            </div>
          )}

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
              <p className={styles.noRecommendations}>Nenhum vídeo recomendado disponível</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistVideo;