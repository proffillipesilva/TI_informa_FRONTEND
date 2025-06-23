import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import axios from '../../../api/axios-config';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const carregarDados = async () => {
      try {
        const meResponse = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!meResponse.data.isAdmin) {
          setError('Você não tem permissão para acessar esta página.');
          setLoading(false);
          return;
        }

        const solicitacoesResponse = await axios.get('/usuario/solicitacoes-criador', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSolicitacoes(solicitacoesResponse.data);
      } catch (error) {
        setError('Erro ao carregar dados');
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [navigate]);

  const showNotificationModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
    // Optionally close modal automatically after a few seconds
    setTimeout(() => {
      setShowModal(false);
      setModalMessage('');
      setModalType('');
    }, 3000);
  };

  const handleAprovar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/usuario/aprovar-criador/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitacoes(solicitacoes.filter(s => s.id !== id));
      showNotificationModal('Solicitação aprovada com sucesso!', 'success');
    } catch {
      showNotificationModal('Erro ao aprovar solicitação.', 'error');
    }
  };

  const handleRecusar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/usuario/reprovar-criador/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitacoes(solicitacoes.filter(s => s.id !== id));
      showNotificationModal('Solicitação recusada com sucesso!', 'success');
    } catch {
      showNotificationModal('Erro ao recusar solicitação.', 'error');
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <>
      <Layout />
      <div className={styles.container}>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.solicitacoesContainer}>
            <h1>Painel de Administração</h1>
            <h2>Solicitações para ser Criador</h2>
            {solicitacoes.length === 0 ? (
              <p>Não há solicitações pendentes</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Formação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id}>
                      <td>{solicitacao.id}</td>
                      <td>{solicitacao.nome}</td>
                      <td>{solicitacao.email}</td>
                      <td>{solicitacao.cpf}</td>
                      <td>{solicitacao.formacao}</td>
                      <td>
                        <button
                          onClick={() => handleAprovar(solicitacao.id)}
                          className={styles.btnAprovar}
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleRecusar(solicitacao.id)}
                          className={styles.btnRecusar}
                        >
                          Recusar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles[modalType]}`}>
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)} className={styles.modalCloseButton}>
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;