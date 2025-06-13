import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import Layout from '../../Layout/Layout';
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

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [showInteresses, setShowInteresses] = useState(false);
  const [interessesSelecionados, setInteressesSelecionados] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuestionChange = (e) => {
    setSelectedQuestion(e.target.value);
  };

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    return regex.test(password);
  };

  const handleFirstSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem!');
      return;
    }
    if (!validatePassword(formData.senha)) {
      setError('A senha deve conter: 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial');
      return;
    }
    setShowQuestions(true);
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

  const selecionarInteresse = (interesse) => {
    if (interessesSelecionados.includes(interesse)) {
      setInteressesSelecionados(interessesSelecionados.filter((item) => item !== interesse));
    } else {
      setInteressesSelecionados([...interessesSelecionados, interesse]);
    }
  };

  const estaSelecionado = (interesse) => interessesSelecionados.includes(interesse);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedQuestion || !answer) {
      setError('Pergunta e resposta de segurança são obrigatórias.');
      return;
    }
    const pergunta_resposta = [{
      pergunta: selectedQuestion,
      resposta: answer
    }];
    try {
      const response = await axios.post('/auth/register/usuario', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        pergunta_resposta: pergunta_resposta,
        interesses: interessesSelecionados.join(',')
      });
      if (response.status === 200) {
        localStorage.setItem('nomeCompleto', formData.nome);
        localStorage.setItem('email', formData.email);
        navigate('/login', { state: { registrationSuccess: true } });
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'object' ? err.response.data.message || 'Erro ao cadastrar usuário' : err.response.data);
      } else if (err.request) {
        setError('Sem resposta do servidor');
      } else {
        setError('Erro ao configurar requisição');
      }
    }
  };

  return (
    <div>
      <Layout />
      <div className={styles.container}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h2 className={styles.title}>Criar Conta</h2>
            {error && (
              <p className={styles.errorMessage}>
                {typeof error === 'object' ? error.message : error}
              </p>
            )}
            {!showQuestions ? (
              <form onSubmit={handleFirstSubmit}>
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome Completo"
                  value={formData.nome}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="senha"
                    placeholder="Senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Esconder' : 'Mostrar'}
                  </button>
                </div>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmarSenha"
                    placeholder="Confirmar Senha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Esconder' : 'Mostrar'}
                  </button>
                </div>
                <button type="submit" className={styles.button}>
                  Próximo
                </button>
              </form>
            ) : !showInteresses ? (
              <form onSubmit={handleQuestionSubmit}>
                <label className={styles.securityQuestionsLabel}>
                  Pergunta de Segurança:
                </label>
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
                <button type="submit" className={styles.button} disabled={!selectedQuestion}>
                  Próximo
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                  Escolha seus interesses para personalizarmos sua experiência.
                </p>
                {InteressesOpcoes.map((secao) => (
                  <div key={secao.tituloSecao} style={{ marginBottom: '30px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px', display: 'inline-block' }}>
                      {secao.tituloSecao}
                    </h3>
                    <div style={{ display: 'inline-block', width: 'calc(100% - 150px)', height: '1px', backgroundColor: '#ccc', marginLeft: '10px', verticalAlign: 'middle' }}></div>
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
                <button type="submit" className={styles.button}>
                  Finalizar Cadastro
                </button>
              </form>
            )}
          </div>
          <div className={styles.register}>
            <span className={styles.registerText}>
              Já possui uma conta?{' '}
              <button
                onClick={() => navigate('/login')}
                className={styles.registerLink}
              >
                Conecte-se
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;