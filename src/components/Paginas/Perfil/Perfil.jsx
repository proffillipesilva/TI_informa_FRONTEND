import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Perfil.module.css';
import { HiChevronDown, HiPlus } from 'react-icons/hi';
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

const ConfirmationModal = ({ show, message, onConfirm, onCancel, showConfirmButton = true, showCancelButton = true }) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p>{message}</p>
        <div className={styles.modalActions}>
          {showConfirmButton && <button onClick={onConfirm} className={styles.modalConfirmButton}>Confirmar</button>}
          {showCancelButton && <button onClick={onCancel} className={styles.modalCancelButton}>Cancelar</button>}
        </div>
      </div>
    </div>
  );
};

// New SuccessModal Component
const SuccessModal = ({ show, message, onClose }) => {
  useEffect(() => {
    let timer;
    if (show) {
      timer = setTimeout(() => {
        onClose();
      }, 2000); // Automatically close after 2 seconds
    }
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.successModal}`}>
        <p>{message}</p>
      </div>
    </div>
  );
};


const AddToPlaylistButton = ({ videoId, playlists }) => {
  const [showSelect, setShowSelect] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!selectedPlaylist || !videoId) {
      alert('Selecione uma playlist e verifique o vídeo');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/playlists/${selectedPlaylist}/adicionar-video`,
        {},
        {
          params: { videoId },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert('Vídeo adicionado à playlist!');
      setShowSelect(false);
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      alert(error.response?.data || 'Erro ao adicionar vídeo à playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className={styles.botaoAdicionarPlaylist}
        onClick={() => setShowSelect(!showSelect)}
      >
        Adicionar à Playlist
      </button>
      {showSelect && (
        <div className={styles.playlistSelectContainer}>
          <select
            value={selectedPlaylist}
            onChange={e => setSelectedPlaylist(e.target.value)}
            className={styles.playlistSelect}
          >
            <option value="">Selecione uma playlist</option>
            {playlists.map(pl => (
              <option key={pl.id_playlist || pl.id} value={pl.id_playlist || pl.id}>
                {pl.nome}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedPlaylist || loading}
            className={styles.playlistAddButton}
          >
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      )}
    </div>
  );
};

const Perfil = () => {
  const [descricaoUsuario, setDescricaoUsuario] = useState('');
  const [videosUsuario, setVideosUsuario] = useState([]);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCriador, setIsCriador] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [novaPlaylistNome, setNovaPlaylistNome] = useState('');
  const [secoesAtivas, setSecoesAtivas] = useState([]);
  const [interessesUsuario, setInteressesUsuario] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [newVisibility, setNewVisibility] = useState('');
  const navigate = useNavigate();
  const TamanhoNomePlaylist = 30;

  const [originalDescricaoUsuario, setOriginalDescricaoUsuario] = useState('');

  const [showConfirmVideoModal, setShowConfirmVideoModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [showVideoSuccessModal, setShowVideoSuccessModal] = useState(false);
  const [videoSuccessMessage, setVideoSuccessMessage] = useState('');

  const [showConfirmPlaylistModal, setShowConfirmPlaylistModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [showPlaylistSuccessModal, setShowPlaylistSuccessModal] = useState(false);
  const [playlistSuccessMessage, setPlaylistSuccessMessage] = useState('');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const carregarDados = async () => {
      try {
        const response = await axios.get('/auth/me', { headers });
        setNomeCompleto(response.data.nome);
        setEmailUsuario(response.data.email);
        setIsCriador(response.data.isCriador || false);
        setIsAdmin(response.data.isAdmin || false);
        setInteressesUsuario(response.data.interesses);
        setDescricaoUsuario(response.data.descricao || '');
        setOriginalDescricaoUsuario(response.data.descricao || '');

        if (response.data.isCriador) {
          setSecoesAtivas(['videos', 'playlists']);
          try {
            const videosResponse = await axios.get('/file/meus-videos', { headers });
            setVideosUsuario(Array.isArray(videosResponse.data) ? videosResponse.data : []);
          } catch (error) {
            setVideosUsuario([]);
            if (error.response?.status !== 403) {
              setError('Erro ao buscar vídeos do usuário.');
            }
          }
        } else {
          setSecoesAtivas(['playlists', 'interesses']);
          setVideosUsuario([]);
        }
      } catch (error) {
        setError('Erro ao carregar os dados do perfil.');
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('nomeCompleto');
          localStorage.removeItem('email');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }

      try {
        setLoadingPlaylists(true);
        const res = await axios.get('/playlists/minhas-playlists', { headers });
        setPlaylists(res.data);
      } catch {
        setError('Erro ao buscar playlists do usuário.');
      } finally {
        setLoadingPlaylists(false);
      }
    };

    carregarDados();
  }, [navigate]);

  const aoClicarEditar = async () => {
    if (isEditing) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          '/auth/me',
          { descricao: descricaoUsuario },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Descrição atualizada com sucesso!');
        setIsEditing(false);
        setOriginalDescricaoUsuario(descricaoUsuario);
      } catch (error) {
        console.error('Erro ao atualizar descrição:', error);
        alert('Erro ao atualizar descrição: ' + (error.response?.data?.message || 'Tente novamente mais tarde'));
      }
    } else {
      setIsEditing(true);
    }
  };

  const aoClicarCancelarEdicao = () => {
    setDescricaoUsuario(originalDescricaoUsuario);
    setIsEditing(false);
  };

  const aoClicarSair = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nomeCompleto');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const aoClicarAdicionarVideo = () => {
    navigate('/upload-video');
  };

  const criarPlaylist = async () => {
    const token = localStorage.getItem('token');
    if (!novaPlaylistNome.trim()) {
      alert('Por favor, insira um nome para a playlist');
      return;
    }
    if (novaPlaylistNome.length > TamanhoNomePlaylist) {
      alert(`O nome da playlist não pode exceder ${TamanhoNomePlaylist} caracteres.`);
      return;
    }

    try {
      setLoadingPlaylists(true);
      const res = await axios.post(
        '/playlists/criar',
        { nome: novaPlaylistNome, visibilidade: 'PRIVADA' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaylists([res.data, ...playlists]);
      setNovaPlaylistNome('');
      alert('Playlist criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar playlist: ' + (error.response?.data?.message || 'Tente novamente mais tarde'));
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const atualizarVisibilidade = async (playlistId) => {
    const token = localStorage.getItem('token');
    if (!newVisibility) {
      alert('Selecione uma visibilidade');
      return;
    }

    try {
      setLoadingPlaylists(true);
      await axios.patch(
        `/playlists/${playlistId}/visibilidade`,
        { visibilidade: newVisibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get('/playlists/minhas-playlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(res.data);

      setEditingPlaylistId(null);
      setNewVisibility('');
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      alert(error.response?.data || 'Erro ao atualizar visibilidade');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  // Function to handle opening the confirmation modal for video deletion
  const handleDeletarVideoClick = (video) => {
    setVideoToDelete(video);
    setShowConfirmVideoModal(true);
  };

  // Function to confirm video deletion
  const confirmDeletarVideo = async () => {
    if (!videoToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/file/delete/${videoToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const videosResponse = await axios.get('/file/meus-videos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideosUsuario(Array.isArray(videosResponse.data) ? videosResponse.data : []);

      setShowConfirmVideoModal(false);
      setVideoToDelete(null);
      setVideoSuccessMessage('Vídeo excluído com sucesso!');
      setShowVideoSuccessModal(true);
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error);
      alert('Erro ao excluir vídeo: ' + (error.response?.data?.message || 'Tente novamente mais tarde'));
    } finally {
      setShowConfirmVideoModal(false);
      setVideoToDelete(null);
    }
  };

  // Function to cancel video deletion
  const cancelDeletarVideo = () => {
    setShowConfirmVideoModal(false);
    setVideoToDelete(null);
  };

  // Function to handle opening the confirmation modal for playlist deletion
  const handleDeletarPlaylistClick = (playlist) => {
    setPlaylistToDelete(playlist);
    setShowConfirmPlaylistModal(true);
  };

  // Function to confirm playlist deletion
  const confirmDeletarPlaylist = async () => {
    if (!playlistToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/playlists/${playlistToDelete.id_playlist || playlistToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualiza a lista de playlists após a exclusão
      const res = await axios.get('/playlists/minhas-playlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(res.data);

      setShowConfirmPlaylistModal(false);
      setPlaylistToDelete(null);
      setPlaylistSuccessMessage('Playlist excluída com sucesso!');
      setShowPlaylistSuccessModal(true);
    } catch (error) {
      console.error('Erro ao excluir playlist:', error);
      alert('Erro ao excluir playlist: ' + (error.response?.data?.message || 'Tente novamente mais tarde'));
    } finally {
      setShowConfirmPlaylistModal(false);
      setPlaylistToDelete(null);
    }
  };

  // Function to cancel playlist deletion
  const cancelDeletarPlaylist = () => {
    setShowConfirmPlaylistModal(false);
    setPlaylistToDelete(null);
  };

  useEffect(() => {
    document.documentElement.classList.add(styles.htmlVideoPage);
    return () => {
      document.documentElement.classList.remove(styles.htmlVideoPage);
    };
  }, []);

  const videosOrdenados = [...videosUsuario].sort((a, b) => {
    return new Date(a.dataPublicacao) - new Date(b.dataPublicacao);
  });

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

  const secoesBase = [
    {
      id: 'playlists',
      titulo: 'Suas playlists',
      conteudo: (
        <div>
          <div className={styles.containerNovaPlaylist}>
            <input
              type="text"
              className={styles.inputNovaPlaylist}
              placeholder={`Nome da nova playlist (máx. ${TamanhoNomePlaylist} caracteres)`}
              value={novaPlaylistNome}
              onChange={e => {
                if (e.target.value.length <= TamanhoNomePlaylist) {
                  setNovaPlaylistNome(e.target.value);
                }
              }}
              maxLength={TamanhoNomePlaylist}
            />
            <button
              className={styles.botaoNovaPlaylist}
              onClick={criarPlaylist}
              disabled={loadingPlaylists}
            >
              {loadingPlaylists ? 'Criando...' : 'Nova Playlist'}
            </button>
          </div>
          {loadingPlaylists ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando playlists...</p>
            </div>
          ) : (
            <div className={styles.listaPlaylistsGrid}>
              {playlists.length === 0 && <p>Você não possui playlists.</p>}
              {playlists.slice().reverse().map(playlist => (
                <div
                  key={playlist.id_playlist || playlist.id}
                  className={styles.playlistCard}
                  onClick={() => navigate(`/playlist/${playlist.id_playlist || playlist.id}`, { state: { playlist } })}
                >
                  <h4 className={styles.playlistTitle}>
                    {playlist.nome}
                  </h4>

                  {editingPlaylistId === playlist.id ? (
                    <div
                      className={styles.visibilityEditor}
                      onClick={e => e.stopPropagation()}
                    >
                      <select
                        value={newVisibility}
                        onChange={e => setNewVisibility(e.target.value)}
                        className={styles.visibilitySelect}
                      >
                        <option value="" disabled>Escolha</option>
                        {['PUBLICA', 'NAO_LISTADA', 'PRIVADA']
                          .filter(visibilityOption => visibilityOption !== playlist.visibilidade)
                          .map(option => (
                            <option key={option} value={option}>
                              {getVisibilidadeLabel(option)}
                            </option>
                          ))}
                      </select>
                      <div className={styles.buttonContainer}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            atualizarVisibilidade(playlist.id);
                          }}
                          className={styles.visibilitySaveButton}
                        >
                          Salvar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlaylistId(null);
                            setNewVisibility('');
                          }}
                          className={styles.visibilityCancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={styles.visibilityContainer}
                      onClick={e => e.stopPropagation()}
                    >
                      <span className={`${styles.visibilityBadge} ${styles[`visibilityBadge_${playlist.visibilidade}`]}`}>
                        {getVisibilidadeLabel(playlist.visibilidade)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlaylistId(playlist.id);
                          setNewVisibility('');
                        }}
                        className={styles.editVisibilityButton}
                      >
                        Alterar
                      </button>
                    </div>
                  )}

                  <div className={styles.playlistFooter}>
                    <p className={styles.videoCount}>{playlist.videos?.length || 0} vídeo(s)</p>
                    <button
                      className={styles.botaoExcluirPlaylist}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletarPlaylistClick(playlist);
                      }}
                    >
                      Excluir Playlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  function extrairInteressesPorCategoria(interesses, categoria) {
    const categoriasMapa = {
      'Linguagens de Programação': ['Python', 'Java', 'C++'],
      'Desenvolvimento Web': ['HTML', 'CSS', 'React', 'Angular'],
      'Banco de Dados': ['SQL', 'NoSQL', 'MongoDB']
    };

    if (!interesses) return [];

    return interesses.split(',')
      .map(i => i.trim())
      .filter(interesse => categoriasMapa[categoria] && categoriasMapa[categoria].includes(interesse));
  }

  const secaoInteresses = {
    id: 'interesses',
    titulo: 'Interesses',
    conteudo: (
      <div className={styles.tabelaContainer}>
        {interessesUsuario ? (
          <div>
            {extrairInteressesPorCategoria(interessesUsuario, 'Linguagens de Programação').length > 0 && (
              <>
                <h3 className={styles.subtituloCategorias}>Linguagens de Programação</h3>
                <ul className={styles.listaInteresses}>
                  {extrairInteressesPorCategoria(interessesUsuario, 'Linguagens de Programação').map((interesse, index) => (
                    <li key={`prog-${index}`}>{interesse}</li>
                  ))}
                </ul>
              </>
            )}

            {extrairInteressesPorCategoria(interessesUsuario, 'Desenvolvimento Web').length > 0 && (
              <>
                <h3 className={styles.subtituloCategorias}>Desenvolvimento Web</h3>
                <ul className={styles.listaInteresses}>
                  {extrairInteressesPorCategoria(interessesUsuario, 'Desenvolvimento Web').map((interesse, index) => (
                    <li key={`web-${index}`}>{interesse}</li>
                  ))}
                </ul>
              </>
            )}

            {extrairInteressesPorCategoria(interessesUsuario, 'Banco de Dados').length > 0 && (
              <>
                <h3 className={styles.subtituloCategorias}>Banco de Dados</h3>
                <ul className={styles.listaInteresses}>
                  {extrairInteressesPorCategoria(interessesUsuario, 'Banco de Dados').map((interesse, index) => (
                    <li key={`db-${index}`}>{interesse}</li>
                  ))}
                </ul>
              </>
            )}
            {
              extrairInteressesPorCategoria(interessesUsuario, 'Linguagens de Programação').length === 0 &&
              extrairInteressesPorCategoria(interessesUsuario, 'Desenvolvimento Web').length === 0 &&
              extrairInteressesPorCategoria(interessesUsuario, 'Banco de Dados').length === 0 &&
              <p>Nenhum interesse definido.</p>
            }
          </div>
        ) : (
          <p>Nenhum interesse definido.</p>
        )}
      </div>
    ),
  };

  const secaoVideos = {
    id: 'videos',
    titulo: 'Seus vídeos',
    conteudo: (
      <div>
        <div className={styles.containerAdicionarVideo}>
          <button className={styles.botaoAdicionarVideo} onClick={aoClicarAdicionarVideo}>
            <HiPlus /> Adicionar novo vídeo
          </button>
        </div>
        <div className={styles.listaVideos}>
          {Array.isArray(videosOrdenados) && [...videosOrdenados].reverse().map((video, index) => (
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
              <div className={styles.videoActions}>
                <AddToPlaylistButton
                  videoId={video.id_video || video.id}
                  playlists={playlists}
                />
                <button
                  className={styles.botaoExcluir}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletarVideoClick(video); // Use the new handler
                  }}
                >
                  Excluir Vídeo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  const secoesFiltradas = isCriador
    ? [secaoVideos, ...secoesBase]
    : [...secoesBase, secaoInteresses];

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando dados do perfil...</p>
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
            <p className={styles.emailUsuario}>{emailUsuario}</p>
            <textarea
              className={styles.descricaoUsuario}
              placeholder="Descrição do usuário."
              value={descricaoUsuario}
              onChange={e => setDescricaoUsuario(e.target.value)}
              readOnly={!isEditing}
            />
            {isCriador ? (
              <p className={styles.tipoUsuario}>Criador de Conteúdo</p>
            ) : isAdmin ? (
              <p className={styles.tipoUsuario}>Administrador</p>
            ) : (
              <p className={styles.tipoUsuario}>Usuário</p>
            )}
          </div>
          <div className={styles.botoesContainer}>
            <button className={styles.botaoEditar} onClick={aoClicarEditar}>
              {isEditing ? 'Salvar Alterações' : 'Editar'}
            </button>
            {isEditing && (
              <button className={styles.botaoCancelar} onClick={aoClicarCancelarEdicao}>
                Cancelar
              </button>
            )}
            {!isCriador && !isAdmin && (
              <button
                className={styles.botaoRegister}
                onClick={() => navigate('/RegisterCriador')}
              >
                Registrar para ser criador
              </button>
            )}
            {isAdmin && (
              <button
                className={styles.botaoRegister}
                onClick={() => navigate('/admin')}
              >
                Solicitações
              </button>
            )}
          </div>
        </div>
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
                className={`${styles.conteudoSecao} ${secoesAtivas.includes(secao.id) ? styles.aberta : ''}`}
              >
                {secao.conteudo}
              </div>
            </div>
          ))}
        </div>
        <button className={styles.botaoSair} onClick={aoClicarSair}>
          Sair da conta
        </button>
      </div>

      <ConfirmationModal
        show={showConfirmVideoModal}
        message={`Tem certeza que deseja excluir o vídeo "${videoToDelete?.titulo}"?`}
        onConfirm={confirmDeletarVideo}
        onCancel={cancelDeletarVideo}
      />
      <SuccessModal
        show={showVideoSuccessModal}
        message={videoSuccessMessage}
        onClose={() => setShowVideoSuccessModal(false)}
      />

      <ConfirmationModal
        show={showConfirmPlaylistModal}
        message={`Tem certeza que deseja excluir a playlist "${playlistToDelete?.nome}"?`}
        onConfirm={confirmDeletarPlaylist}
        onCancel={cancelDeletarPlaylist}
      />
      <SuccessModal
        show={showPlaylistSuccessModal}
        message={playlistSuccessMessage}
        onClose={() => setShowPlaylistSuccessModal(false)}
      />
    </div>
  );
};

export default Perfil;