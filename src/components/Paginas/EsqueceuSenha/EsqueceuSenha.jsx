import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EsqueceuSenha.module.css';
import Layout from '../../Layout/Layout';

const EsqueceuSenha = () => {
  const [email, setEmail] = useState('');
  const [etapa, setEtapa] = useState(1);
  const [perguntaSeguranca, setPerguntaSeguranca] = useState('');
  const [respostaSeguranca, setRespostaSeguranca] = useState('');
  const [erro, setErro] = useState('');
  const navegarPara = useNavigate();

  const buscarPerguntaSeguranca = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const resp = await fetch(
        `http://localhost:8080/auth/recuperar-senha/pergunta?email=${encodeURIComponent(email)}`
      );
      if (resp.ok) {
        const pergunta = await resp.text();
        if (pergunta) {
          setPerguntaSeguranca(pergunta);
          setEtapa(2);
        } else {
          setErro('Pergunta de segurança não configurada para este e-mail.');
        }
      } else {
        const errorText = await resp.text();
        setErro(errorText || 'E-mail não encontrado ou erro desconhecido.');
      }
    } catch (fetchError) {
      console.error('Erro na requisição de pergunta de segurança:', fetchError);
      setErro('Erro ao buscar pergunta de segurança. Verifique sua conexão.');
    }
  };

  const verificarResposta = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const resp = await fetch(
        'http://localhost:8080/auth/recuperar-senha/verificar-resposta',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, resposta: respostaSeguranca }),
        }
      );
      if (resp.ok) {
        alert('Resposta correta! Redirecionando para redefinir senha.');
        navegarPara('/RedefinirSenha', { state: { email } });
      } else {
        const errorText = await resp.text(); 
        setErro(errorText || 'Resposta incorreta. Tente novamente.');
      }
    } catch (fetchError) {
      console.error('Erro na requisição de verificação de resposta:', fetchError);
      setErro('Erro ao verificar resposta. Verifique sua conexão.');
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
                onClick={() => navegarPara('/login')}
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