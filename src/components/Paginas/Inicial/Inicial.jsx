import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Inicial.module.css';
import sampleImage from '../../Layout/Foto.jpg';
import logo from '../../Layout/logo.png';

const Inicial = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const acesso = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) {
      alert('Por favor, insira um e-mail válido.');
      return;
    }
    alert('Login realizado com sucesso!');
    acesso('/home');
  };

  const menu = () => {
    alert('Menu clicado!');
  };

  return (
    <div>
      <div className={styles.header}>
        <button className={styles.menuButton} onClick={menu}>
          <span className={styles.dot}>&#8226;</span>
          <span className={styles.dot}>&#8226;</span>
          <span className={styles.dot}>&#8226;</span>
        </button>
        <span className={styles.headerTitle}>T.I Informa</span>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>

      <div className={styles.container}>
        <div className={styles.imageSection}>
          <img src={sampleImage} className={styles.image} />
        </div>

        <div className={styles.formSection}>
          <div className={styles.card}>
            <h2 className={styles.title}>T.I Informa</h2>
            <form onSubmit={handleSubmit}>
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
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? 'Esconder' : 'Mostrar'}
                </button>
              </div>
              <button type="submit" className={styles.button}>
                Entrar
              </button>
            </form>

            <div className={styles.separator}>
              <div className={styles.line}></div>
              <span className={styles.orText}>OU</span>
              <div className={styles.line}></div>
            </div>

            <a href="#" className={styles.forgotPassword}>
              Esqueceu a senha?
            </a>
          </div>

          <div className={styles.register}>
            <span className={styles.registerText}>
              Não tem uma conta?{' '}
              <button onClick={() => acesso('/register')} className={styles.registerLink}>
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

export default Inicial;