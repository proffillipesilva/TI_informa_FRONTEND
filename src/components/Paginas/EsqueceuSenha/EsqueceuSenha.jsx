import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EsqueceuSenha.module.css';
import Layout from '../../Layout/Layout';
import axios from '../../../api/axios-config';

const EsqueceuSenha = () => {
  const [email, setEmail] = useState('');
  const [etapa, setEtapa] = useState(1);
  const [perguntaSeguranca, setPerguntaSeguranca] = useState('');
  const [respostaSeguranca, setRespostaSeguranca] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const buscarPerguntaSeguranca = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const response = await axios.get('/auth/recuperar-senha/pergunta', {
        params: { email }
      });
      
      if (response.data) {
        setPerguntaSeguranca(response.data);
        setEtapa(2);
      } else {
        setErro('Pergunta de segurança não configurada para este e-mail.');
      }
    } catch (error) {
      console.error('Erro na requisição de pergunta de segurança:', error);
      setErro(error.response?.data || 'E-mail não encontrado ou erro desconhecido.');
    }
  };

  const verificarResposta = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await axios.post('/auth/recuperar-senha/verificar-resposta', {
        email,
        resposta: respostaSeguranca
      });
      
      navigate('/RedefinirSenha', { state: { email } });
    } catch (error) {
      console.error('Erro na verificação de resposta:', error);
      setErro(error.response?.data || 'Resposta incorreta. Tente novamente.');
    }
  };

  return (
    <div>
      <Layout />
      <div className={styles.container} style={{ justifyContent: 'center' }}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h2 className={styles.title}>Recuperar Senha</h2>
            {etapa === 1 && (
              <>
                <p className={styles.instructionText}>
                  Digite seu e-mail para verificar se existe uma pergunta de segurança.
                </p>
                <form onSubmit={buscarPerguntaSeguranca}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                  />
                  <button type="submit" className={styles.button}>
                    Verificar E-mail
                  </button>
                </form>
                {erro && <p className={styles.erroResposta}>{erro}</p>}
              </>
            )}
            {etapa === 2 && (
              <>
                <p className={styles.instructionText}>
                  Responda à pergunta de segurança:
                </p>
                <p className={styles.perguntaSeguranca}>{perguntaSeguranca}</p>
                <form onSubmit={verificarResposta}>
                  <input
                    type="text"
                    name="respostaSeguranca"
                    placeholder="Sua resposta"
                    value={respostaSeguranca}
                    onChange={(e) => setRespostaSeguranca(e.target.value)}
                    className={styles.input}
                    required
                  />
                  <button type="submit" className={styles.button}>
                    Verificar Resposta
                  </button>
                </form>
                {erro && <p className={styles.erroResposta}>{erro}</p>}
              </>
            )}
          </div>
          <div className={styles.register}>
            <span className={styles.registerText}>
              Lembrou sua senha?{' '}
              <button
                onClick={() => navigate('/login')}
                className={styles.registerLink}
              >
                Fazer Login
              </button>
            </span>
          </div>
        </div>
      </div>
      <div className={`${styles.bar} ${styles.bottom}`}></div>
    </div>
  );
};

export default EsqueceuSenha;