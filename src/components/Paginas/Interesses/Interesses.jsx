import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Interesses.module.css';
import Layout from '../../Layout/Layout';

const Interesses = () => {
  const navegarPara = useNavigate();
  const [interessesSelecionados, setInteressesSelecionados] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');

  // Efeito para buscar os interesses do usuário ao carregar o componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navegarPara('/login');
      return;
    }

    const buscarInteressesDoUsuario = async () => {
      try {
        const response = await fetch('http://localhost:8080/auth/me', { // Endpoint para buscar dados do usuário, incluindo interesses
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          // Assumindo que a resposta do backend tem um campo 'interesses' que é uma string separada por vírgulas
          if (userData.interesses) {
            setInteressesSelecionados(userData.interesses.split(',').map(item => item.trim()));
          }
        } else {
          console.error('Erro ao buscar interesses do usuário:', response.statusText);
        }
      } catch (error) {
        console.error('Erro de conexão ao buscar interesses:', error);
      }
    };

    buscarInteressesDoUsuario();
  }, [navegarPara]);

  const selecionarInteresse = (interesse) => {
    if (interessesSelecionados.includes(interesse)) {
      setInteressesSelecionados(interessesSelecionados.filter((item) => item !== interesse));
    } else {
      setInteressesSelecionados([...interessesSelecionados, interesse]);
    }
    setMensagemErro('');
  };

  const estaSelecionado = (interesse) => interessesSelecionados.includes(interesse);

  const irParaHome = async () => { // O nome da função continua 'irParaHome', mas vai para o perfil
    if (interessesSelecionados.length === 0) {
      setMensagemErro('Por favor, selecione ao menos um interesse para continuar.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navegarPara('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/auth/usuario/interesses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          interesses: interessesSelecionados.join(','),
        }),
      });

      if (response.ok) {
        // *** MUDANÇA AQUI: REDIRECIONA PARA /perfil ***
        navegarPara('/perfil');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao salvar interesses');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão');
    }
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
            <button className={styles.botaoPronto} onClick={irParaHome}>
              Pronto
            </button>
          </div>
        </div>
      </div>
      <div className={`${styles.barra} ${styles.inferior}`}></div>
    </div>
  );
};

export default Interesses;