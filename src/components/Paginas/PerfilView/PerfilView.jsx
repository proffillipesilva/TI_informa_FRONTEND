import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PerfilView.module.css';
import { HiChevronDown } from 'react-icons/hi';
import Layout from '../../Layout/Layout';
import axios from '../../../api/axios-config';

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

const PerfilView = () => {
  const { userId } = useParams();
  const [descricaoUsuario, setDescricaoUsuario] = useState('');
  const [videosUsuario, setVideosUsuario] = useState([]);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCriador, setIsCriador] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [secoesAtivas, setSecoesAtivas] = useState(['videos']);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const userResponse = await axios.get(`/auth/user/${userId}`);
        setNomeCompleto(userResponse.data.nome);
        setDescricaoUsuario(userResponse.data.descricao || '');
        setIsCriador(userResponse.data.isCriador || false);

        if (userResponse.data.isCriador) {
          try {
            const videosResponse = await axios.get(`/file/videos-usuario/${userId}`);
            setVideosUsuario(Array.isArray(videosResponse.data) ? videosResponse.data : []);
          } catch (error) {
            setVideosUsuario([]);
            if (error.response?.status !== 403) {
              console.error('Erro ao buscar vídeos do usuário:', error);
            }
          }

          try {
            const res = await axios.get(`/playlists/usuario/${userId}`);
            setPlaylists(res.data);
          } catch (error) {
            console.error('Erro ao buscar playlists do usuário:', error);
          }
        }
      } catch (error) {
        setError('Erro ao carregar os dados do perfil.');
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [userId]);

  const videosOrdenados = [...videosUsuario].sort((a, b) => {
    return new Date(b.dataPublicacao) - new Date(a.dataPublicacao); 
  });

  const alternarSecao = idSecao => {
    setSecoesAtivas(prev =>
      prev.includes(idSecao)
        ? prev.filter(id => id !== idSecao)
        : [...prev, idSecao]
    );
  };

  const secaoVideos = {
    id: 'videos',
    titulo: 'Vídeos',
    conteudo: (
      <div className={styles.listaVideos}>
        {Array.isArray(videosOrdenados) && videosOrdenados.map((video, index) => (
          <div 
            key={index} 
            className={styles.itemVideo}
          >
            <h3 className={styles.nomeArquivo}>{video.titulo}</h3>
            <div 
              className={styles.videoContainer}
              onClick={() => navigate(`/video/${video.id_video || video.id}`, { state: { video } })}
              style={{ cursor: 'pointer' }}
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
        ))}
        {videosOrdenados.length === 0 && <p>Nenhum vídeo disponível.</p>}
      </div>
    ),
  };

  const secaoPlaylists = {
    id: 'playlists',
    titulo: 'Playlists',
    conteudo: (
      <div className={styles.listaPlaylistsGrid}>
        {playlists.length === 0 && <p>Nenhuma playlist disponível.</p>}
        {playlists.map(playlist => (
          <div
            key={playlist.id_playlist || playlist.id}
            className={styles.playlistCard}
            onClick={() => navigate(`/playlist/${playlist.id_playlist || playlist.id}`, { state: { playlist } })}
          >
            <h4>{playlist.nome}</h4>
            <p>Visibilidade: {playlist.visibilidade}</p>
            <p>{playlist.videos?.length || 0} vídeos</p>
          </div>
        ))}
      </div>
    ),
  };

  const secoesFiltradas = isCriador 
    ? [secaoVideos, ...(playlists.length > 0 ? [secaoPlaylists] : [])]
    : [];

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className={styles.container}>
        <div className={styles.cartaoPerfil}>
          <img
            src="https://st4.depositphotos.com/29453910/37778/v/450/depositphotos_377785374-stock-illustration-hand-drawn-modern-man-avatar.jpg"
            alt="Foto de Perfil"
            className={styles.imagemPerfil}
          />
          <div className={styles.infoPerfil}>
            <h2 className={styles.nomeUsuario}>{nomeCompleto}</h2>
            <p className={styles.descricaoUsuario} readOnly>
              {descricaoUsuario || 'Este usuário não possui uma descrição.'}
            </p>
            {isCriador && (
              <p className={styles.tipoUsuario}>Criador de Conteúdo</p>
            )}
          </div>
        </div>

        {isCriador ? (
          <div className={styles.linksNavegacao}>
            {secoesFiltradas.map(secao => (
              <div
                key={secao.id}
                className={`${styles.secao} ${secoesAtivas.includes(secao.id) ? styles.aberta : ''}`}
              >
                <p onClick={() => alternarSecao(secao.id)}>
                  {secao.titulo} <HiChevronDown />
                </p>
                <div
                  className={`${styles.conteudoSecao} ${
                    secoesAtivas.includes(secao.id) ? styles.aberta : ''
                  }`}
                >
                  {secao.conteudo}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.container}>
            <p>Este usuário não é um criador de conteúdo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilView;