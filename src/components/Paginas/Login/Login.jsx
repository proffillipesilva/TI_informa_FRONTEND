import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Login.module.css';
import Layout from '../../Layout/Layout';
import { auth, googleProvider } from '../../../../firebaseConfig';
import { signInWithPopup } from 'firebase/auth'; 
import axios from '../../../api/axios-config';

const Perguntas = [
  "Qual foi a sua primeira viagem inesquecível?",
  "Qual foi o seu brinquedo preferido na infância?",
  "Qual foi o seu primeiro filme no cinema?",
  "Qual foi o nome do seu primeiro animal de estimação?"
];

const InteressesOpcoes = [
  {
    tituloSecao: 'Linguagens de Programação',
    interesses: ['Python', 'Java', 'C++'],
  },
  {
    tituloSecao: 'Desenvolvimento Web',
    interesses: ['HTML', 'CSS', 'React', 'Angular'],
  },
  {
    tituloSecao: 'Banco de Dados',
    interesses: ['SQL', 'NoSQL', 'MongoDB'],
  },
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [showInteresses, setShowInteresses] = useState(false);
  const [interessesSelecionados, setInteressesSelecionados] = useState([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navegarPara = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUsuarioLogado(true);
    }
    
    if (location.state?.registrationSuccess) {
      setRegistrationSuccess(true);
      const timer = setTimeout(() => setRegistrationSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleQuestionChange = (e) => {
    setSelectedQuestion(e.target.value);
  };

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
  };

  const selecionarInteresse = (interesse) => {
    setInteressesSelecionados(prevInteresses =>
      prevInteresses.includes(interesse)
        ? prevInteresses.filter((item) => item !== interesse)
        : [...prevInteresses, interesse]
    );
  };

  const estaSelecionado = (interesse) => interessesSelecionados.includes(interesse);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', {
        email: formData.email,
        senha: formData.password,
      });
      
      localStorage.setItem('token', response.data.token);
      
      if (response.data.cadastroCompleto) {
        setUsuarioLogado(true);
        navegarPara('/home');
      } else {
        navegarPara('/home');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.status === 401 ? 'E-mail ou senha incorretos' : 'Erro ao fazer login');
      } else {
        setError('Não foi possível conectar ao servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const backendResponse = await axios.post('/auth/google-auth', {
        idToken: idToken
      });

      localStorage.setItem('token', backendResponse.data.token);

      if (backendResponse.data.cadastroCompleto) {
        setUsuarioLogado(true);
        navegarPara('/home');
      } else {
        setIsNewUser(true);
        setShowQuestions(true);
        setGoogleUserData({
          email: user.email,
          name: user.displayName,
          idToken: idToken
        });

        try {
          const userCheck = await axios.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${backendResponse.data.token}`
            }
          });

          if (userCheck.data.interesses) {
            setInteressesSelecionados(
              userCheck.data.interesses.split(',')
                .map(item => item.trim())
                .filter(item => item)
            );
          }

          if (userCheck.data.pergunta_resposta) {
            try {
              const perguntas = JSON.parse(userCheck.data.pergunta_resposta);
              const primeiraPergunta = Object.keys(perguntas)[0];
              if (primeiraPergunta) {
                setSelectedQuestion(primeiraPergunta);
                setAnswer(perguntas[primeiraPergunta]);
              }
            } catch (e) {
              console.error("Erro ao analisar perguntas:", e);
            }
          }
        } catch (err) {
          console.error("Erro ao verificar dados do usuário:", err);
        }
      }
    } catch (err) {
      console.error("Erro no login com Google:", err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login com Google cancelado.');
      } else if (err.response) {
        const backendError = err.response.data;
        setError(typeof backendError === 'string' ? backendError : backendError.message || 'Erro ao fazer login com Google');
      } else {
        setError(`Erro ao fazer login com Google: ${err.message || 'Tente novamente.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedQuestion) {
      setError('Selecione uma pergunta de segurança.');
      return;
    }
    if (!answer || answer.trim() === '') {
      setError('Por favor, responda à pergunta de segurança.');
      return;
    }
    
    setShowInteresses(true);
  };

  const handleGoogleRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!selectedQuestion || !answer) {
      setError('Pergunta e resposta de segurança são obrigatórias.');
      setLoading(false);
      return;
    }

    const pergunta_resposta = [{
      pergunta: selectedQuestion,
      resposta: answer
    }];
  
    try {
      const response = await axios.post('/auth/register/google', {
        idToken: googleUserData.idToken,
        pergunta_resposta: pergunta_resposta, 
        interesses: interessesSelecionados.join(','),
        nome: googleUserData.name,
        email: googleUserData.email
      });
  
      localStorage.setItem('token', response.data.token);
      setUsuarioLogado(true);
      navegarPara('/home');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'object' ? 
          err.response.data.message || 'Erro ao registrar usuário' : 
          err.response.data);
      } else if (err.request) {
        setError('Sem resposta do servidor');
      } else {
        setError('Erro ao configurar requisição');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('token');
      await auth.signOut();
      setUsuarioLogado(false);
      navegarPara('/');
    } finally {
      setLoading(false);
    }
  };

  if (usuarioLogado) {
    return (
      <div>
        <Layout />
        <div className={styles.container}>
          <div className={styles.formSection}>
            <div className={styles.card}>
              <div className={styles.logadoMessage}>
                Você já está logado em uma conta.
              </div>
              <button 
                className={styles.logoutButton} 
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? 'Saindo...' : 'Sair da conta'}
              </button>
            </div>
          </div>
        </div>
        <div className={`${styles.bar} ${styles.bottom}`}></div>
      </div>
    );
  }

  if (isNewUser && showQuestions && !showInteresses) {
    return (
      <div>
        <Layout/>
        <div className={styles.perguntas}>
          <div className={styles.formSection}>
            <div className={styles.card_perguntas}>
              <h2 className={styles.title}>Informações Adicionais</h2>
              <p className={styles.introParagraph}>Como é sua primeira vez (via Google), por favor complete seu cadastro:</p>
              <h3 className={styles.subtitle}>Pergunta de Segurança</h3>
              {error && <div className={styles.errorMessage}>{error}</div>}
              <form onSubmit={handleQuestionSubmit}>
                <div className={styles.securityQuestionsList}>
                  <select
                    className={styles.input}
                    value={selectedQuestion}
                    onChange={handleQuestionChange}
                    required
                  >
                    <option value="">Selecione uma pergunta</option>
                    {Perguntas.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                {selectedQuestion && (
                  <div style={{ marginTop: 20 }}>
                    <label htmlFor="answer" className={styles.securityQuestionsLabel}>Sua Resposta:</label>
                    <input
                      type="text"
                      id="answer"
                      className={styles.input}
                      placeholder="Sua resposta"
                      value={answer}
                      onChange={handleAnswerChange}
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className={styles.button}
                  disabled={!selectedQuestion || loading}
                >
                  {loading ? 'Carregando...' : 'Próximo'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isNewUser && showInteresses) {
    return (
      <div>
        <Layout />
        <div className={styles.perguntas}>
          <div className={styles.formSection}>
            <div className={styles.card_perguntas}>
              <h2 className={styles.title}>Seus Interesses</h2>
              <p className={styles.introParagraph}>Escolha seus interesses para personalizarmos sua experiência.</p>
              {error && <div className={styles.errorMessage}>{error}</div>}
              <form onSubmit={handleGoogleRegistration}>
                {InteressesOpcoes.map((secao) => (
                  <div key={secao.tituloSecao} style={{ marginBottom: '30px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px', display: 'inline-block' }}>
                      {secao.tituloSecao}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {secao.interesses.map((interesse) => (
                        <button
                          key={interesse}
                          type="button"
                          className={`${styles.interesseBotao} ${estaSelecionado(interesse) ? styles.selecionadoInteresse : ''}`}
                          onClick={() => selecionarInteresse(interesse)}
                        >
                          {interesse}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className={styles.container}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h2 className={styles.title}>T.I Informa</h2>
            <button 
              className={styles.googleButton} 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Login com Google'}
            </button>
            <div className={styles.separator}>
              <div className={styles.line}></div>
              <span className={styles.orText}>OU</span>
              <div className={styles.line}></div>
            </div>
            {registrationSuccess && (
              <div className={styles.successMessage}>
                Cadastro realizado com sucesso! Faça login para continuar.
              </div>
            )}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
                disabled={loading}
              />
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? 'Esconder' : 'Mostrar'}
                </button>
              </div>
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <button
              type="button"
              onClick={() => navegarPara('/EsqueceuSenha')}
              className={styles.forgotPassword}
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className={styles.register}>
            <span className={styles.registerText}>
              Não tem uma conta?{' '}
              <button
                onClick={() => navegarPara('/register')}
                className={styles.registerLink}
              >
                Cadastre-se
              </button>
            </span>
          </div>
        </div>
      </div>
      <div className={`${styles.bar} ${styles.bottom}`}></div>
    </div>
  );
};

export default Login;