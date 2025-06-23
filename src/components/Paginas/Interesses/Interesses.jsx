import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Interesses.module.css';
import Layout from '../../Layout/Layout';
import axios from '../../../api/axios-config';

const Interesses = () => {
  const navigate = useNavigate();
  const [interessesSelecionados, setInteressesSelecionados] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const SuccessModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3>Interesses Atualizados!</h3>
          <p>Seus interesses foram salvos com sucesso.</p>
          <button 
            onClick={onClose}
            className={styles.modalButton}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const buscarInteressesDoUsuario = async () => {
      try {
        const response = await axios.get('/auth/me', { 
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.interesses) {
          setInteressesSelecionados(response.data.interesses.split(',').map(item => item.trim()));
        }
      } catch (error) {
        console.error('Erro ao buscar interesses do usuário:', error);
      }
    };

    buscarInteressesDoUsuario();
  }, [navigate]);

  const selecionarInteresse = (interesse) => {
    if (interessesSelecionados.includes(interesse)) {
      setInteressesSelecionados(interessesSelecionados.filter((item) => item !== interesse));
    } else {
      setInteressesSelecionados([...interessesSelecionados, interesse]);
    }
    setMensagemErro('');
  };

  const estaSelecionado = (interesse) => interessesSelecionados.includes(interesse);

  const salvarInteresses = async () => { 
    if (interessesSelecionados.length === 0) {
      setMensagemErro('Por favor, selecione ao menos um interesse para continuar.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      await axios.put('/auth/usuario/interesses', {
        interesses: interessesSelecionados.join(','),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar interesses:', error);
      setMensagemErro(error.response?.data?.message || 'Erro ao salvar interesses');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/perfil');
  };

  return (
    <div>
      <Layout />
      <div className={styles.container}>
        <div className={styles.secaoFormulario}>
          <div className={styles.cartao}>
            <h2 className={styles.titulo}>Interesses</h2>
            <p className={styles.textoBoasVindas}>
              Altere seus interesses aqui para recomendarmos os melhores cursos para você
            </p>
            <div className={styles.secao}>
              <h3 className={styles.tituloSecao}>Linguagens de Programação</h3>
              <div className={styles.linha}></div>
              <div className={styles.linhaBotoes}>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('Python') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('Python')}
                >
                  Python
                </button>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('Java') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('Java')}
                >
                  Java
                </button>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('C++') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('C++')}
                >
                  C++
                </button>
              </div>
            </div>
            <div className={styles.secao}>
              <h3 className={styles.tituloSecao}>Desenvolvimento Web</h3>
              <div className={styles.linha}></div>
              <div className={styles.linhaBotoes}>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('HTML') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('HTML')}
                >
                  HTML
                </button>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('CSS') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('CSS')}
                >
                  CSS
                </button>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('React') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('React')}
                >
                  React
                </button>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('Angular') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('Angular')}
                >
                  Angular
                </button>
              </div>
            </div>
            <div className={styles.secao}>
              <h3 className={styles.tituloSecao}>Banco de Dados</h3>
              <div className={styles.linha}></div>
              <div className={styles.linhaBotoes}>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('SQL') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('SQL')}
                >
                  SQL
                </button>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('NoSQL') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('NoSQL')}
                >
                  NoSQL
                </button>
                <button
                  className={`${styles.botaoInteresse} ${estaSelecionado('MongoDB') ? styles.selecionado : ''}`}
                  onClick={() => selecionarInteresse('MongoDB')}
                >
                  MongoDB
                </button>
              </div>
            </div>
            {mensagemErro && <p className={styles.mensagemErro}>{mensagemErro}</p>}
            <button 
              className={styles.botaoPronto} 
              onClick={salvarInteresses}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Pronto'}
            </button>
          </div>
        </div>
      </div>
      <div className={`${styles.barra} ${styles.inferior}`}></div>

      <SuccessModal 
        show={showSuccessModal}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Interesses;