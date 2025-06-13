import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import axios from '../../../api/axios-config';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [solicitacoes, setSolicitacoes] = useState([]);
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

  const handleAprovar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/usuario/aprovar-criador/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitacoes(solicitacoes.filter(s => s.id !== id));
      alert('Solicitação aprovada com sucesso!');
    } catch {
      alert('Erro ao aprovar solicitação');
    }
  };

  const handleRecusar = async (id) => { // Renomeado de handleReprovar para handleRecusar
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/usuario/reprovar-criador/${id}`, {}, { // A rota da API ainda é "reprovar-criador"
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitacoes(solicitacoes.filter(s => s.id !== id));
      alert('Solicitação recusada com sucesso!'); // Mensagem de alerta atualizada
    } catch {
      alert('Erro ao recusar solicitação'); // Mensagem de alerta atualizada
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
    </>
  );
};

export default AdminPage;