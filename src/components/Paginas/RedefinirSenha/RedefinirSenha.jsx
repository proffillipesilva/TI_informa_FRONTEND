import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './RedefinirSenha.module.css';
import Layout from '../../Layout/Layout';

const RedefinirSenha = () => {
  const location = useLocation();
  const navegarPara = useNavigate();
  const email = location.state?.email;

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    if (!email) {
      navegarPara('/EsqueceuSenha');
    }
  }, [email, navegarPara]);

  const validatePassword = (senha) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    return regex.test(senha);
  };

  const redefinirSenha = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (!validatePassword(novaSenha)) {
      setErro('A senha deve conter: 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.');
      return;
    }

    try {
      const resp = await fetch('http://localhost:8080/auth/recuperar-senha/redefinir', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, novaSenha }),
      });


      if (resp.ok) {
        setSucesso('Senha redefinida com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          navegarPara('/login');
        }, 2000);
      } else {
        const errorText = await resp.text();
        setErro(errorText || 'Erro ao redefinir senha.');
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao redefinir senha. Verifique sua conexão.');
    }
  };

  return (
    <div>
      <Layout />
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Redefinir Senha</h2>
          <form onSubmit={redefinirSenha}>
            <input
              type="password"
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.button}>Redefinir Senha</button>
          </form>
          {erro && <p className={styles.erro}>{erro}</p>}
          {sucesso && <p className={styles.sucesso}>{sucesso}</p>}
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
