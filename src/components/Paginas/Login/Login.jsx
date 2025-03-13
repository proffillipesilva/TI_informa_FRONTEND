import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import logo from '../../Layout/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const acesso = useNavigate();

  const Mudanca = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const VisibilidadePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const Envio = (e) => {
    e.preventDefault();
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

      <div className={styles.container} style={{ justifyContent: 'center' }}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h2 className={styles.title}>Entrar</h2>
            <form onSubmit={Envio}>
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={Mudanca}
                className={styles.input}
                required
              />
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={Mudanca}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={VisibilidadePassword}
                >
                  {showPassword ? 'Esconder' : 'Mostrar'}
                </button>
              </div>
              <button type="submit" className={styles.button}>
                Entrar
              </button>
            </form>
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

export default Login;
