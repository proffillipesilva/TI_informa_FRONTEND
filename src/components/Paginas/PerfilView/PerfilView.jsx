import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiChevronDown } from 'react-icons/hi';
import Layout from '../../Layout/Layout';
import axios from '../../../api/axios-config';
import styles from './PerfilView.module.css';

const PerfilView = () => {
  const { criadorId } = useParams();
  const [perfil, setPerfil] = useState({
    nome: '',
    descricao: '',
    fotoUrl: 'https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg',
    formacao: '',
    isCriador: false,
    usuarioId: null,
    totalInscritos: 0
  });
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secoesAtivas, setSecoesAtivas] = useState(['videos']);
  const navigate = useNavigate();

  const getThumbnailSource = (video) => {
    const s3BaseUrl = 'https://tiinformafiec.s3.us-east-1.amazonaws.com/';
    if (video?.thumbnail) return `${s3BaseUrl}${video.thumbnail}`;
    if (video?.key) return `${s3BaseUrl}${video.key}`;
    return 'https://placehold.co/300x169?text=Thumbnail+Indispon%C3%ADvel';
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError('');
        
        const perfilResponse = await axios.get(`/auth/criador/${criadorId}`);
        const perfilData = perfilResponse.data;
        
        setPerfil({
          nome: perfilData.nome,
          descricao: perfilData.descricao || 'Este criador não possui uma descrição.',
          fotoUrl: perfilData.fotoUrl || 'https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg',
          formacao: perfilData.formacao,
          isCriador: true,
          usuarioId: perfilData.usuarioId,
          totalInscritos: perfilData.totalInscritos || 0 
        });

        const requests = [
          axios.get(`/file/criador/${criadorId}/videos`)
        ];

        if (perfilData.usuarioId) {
          requests.push(
            axios.get(`/playlists/usuario/${perfilData.usuarioId}`)
          );
        }

        const [videosResponse, playlistsResponse] = await Promise.all(requests);

        setVideos(Array.isArray(videosResponse?.data) ? videosResponse.data : []);

        if (playlistsResponse?.data) {
          const filteredPlaylists = playlistsResponse.data.filter(p => 
            p.criadorId?.toString() === criadorId.toString() && 
            p.visibilidade === 'PUBLICA'
          );
          setPlaylists(filteredPlaylists);
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.response?.data?.message || err.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [criadorId]);

  const formatSubscribers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
  };

  const videosOrdenados = [...videos].sort((a, b) => 
    new Date(b.dataPublicacao) - new Date(a.dataPublicacao)
  );

  const alternarSecao = idSecao => {
    setSecoesAtivas(prev =>
      prev.includes(idSecao)
        ? prev.filter(id => id !== idSecao)
        : [...prev, idSecao]
    );
  };

  const getVisibilidadeLabel = (visibilidade) => {
    switch (visibilidade) {
      case 'PUBLICA': return 'Pública';
      case 'NAO_LISTADA': return 'Não Listada';
      case 'PRIVADA': return 'Privada';
      default: return visibilidade;
    }
  };

  const secaoVideos = {
    id: 'videos',
    titulo: 'Vídeos',
    conteudo: (
      <div className={styles.listaVideos}>
        {videosOrdenados.length > 0 ? (
          videosOrdenados.map((video, index) => (
            <div key={index} className={styles.itemVideo}>
              <h3 className={styles.videoTitulo}>{video.titulo}</h3>
              <div 
                className={styles.videoContainer}
                onClick={() => navigate(`/video/${video.id_video || video.id}`, { state: { video } })}
              >
                <img
                  src={getThumbnailSource(video)}
                  alt={`Thumbnail do vídeo ${video.titulo}`}
                  className={styles.videoThumbnail}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300x169?text=Thumbnail+Indispon%C3%ADvel';
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className={styles.semConteudo}>Nenhum vídeo disponível</p>
        )}
      </div>
    ),
  };

  const secaoPlaylists = {
    id: 'playlists',
    titulo: 'Playlists',
    conteudo: (
      <div className={styles.listaPlaylists}>
        {playlists.length > 0 ? (
          playlists.map(playlist => (
            <div
              key={playlist.id}
              className={styles.playlistCard}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <h4>{playlist.nome}</h4>
              <div className={styles.playlistMeta}>
                <span className={`${styles.visibilidade} ${styles[`visibilidade_${playlist.visibilidade}`]}`}>
                  {getVisibilidadeLabel(playlist.visibilidade)}
                </span>
                <span className={styles.videoCount}>
                  {playlist.videos?.length || 0} vídeo(s)
                </span>
              </div>
              <span className={styles.criadorBadge}>
                Playlist oficial
              </span>
            </div>
          ))
        ) : (
          <p className={styles.semConteudo}>Nenhuma playlist disponível</p>
        )}
      </div>
    ),
  };

  const secoes = [
    secaoVideos,
    ...(playlists.length > 0 ? [secaoPlaylists] : [])
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Layout />
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
        <img
            src={perfil.fotoUrl}
            alt={`Foto de ${perfil.nome}`}
            className={styles.profileImage}
            onError={(e) => {
              e.target.src = 'https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg';
            }}
          />
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{perfil.nome}</h1>
            <div className={styles.subscriberCount}>
              {formatSubscribers(perfil.totalInscritos)} inscritos
            </div>
            
            <p className={styles.profileDescription}>{perfil.descricao}</p>
            {perfil.formacao && (
              <p className={styles.profileEducation}>
                <strong>Formação:</strong> {perfil.formacao}
              </p>
            )}
            <div className={styles.profileBadge}>Criador de Conteúdo</div>
            
          </div>
        </div>

        <div className={styles.contentSections}>
          {secoes.map(secao => (
            <div key={secao.id} className={styles.section}>
              <div 
                className={styles.sectionHeader}
                onClick={() => alternarSecao(secao.id)}
              >
                <h2>{secao.titulo}</h2>
                <HiChevronDown className={`${styles.sectionIcon} ${
                  secoesAtivas.includes(secao.id) ? styles.rotated : ''
                }`}/>
              </div>
              <div className={`${styles.sectionContent} ${
                secoesAtivas.includes(secao.id) ? styles.active : ''
              }`}>
                {secao.conteudo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerfilView;