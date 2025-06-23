import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './RedefinirSenha.module.css';
import Layout from '../../Layout/Layout';
import axios from '../../../api/axios-config';

const RedefinirSenha = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const SuccessModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3>Senha Redefinida!</h3>
          <p>Sua senha foi alterada com sucesso.</p>
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
    if (!email) {
      navigate('/EsqueceuSenha');
    }
  }, [email, navigate]);

  const validatePassword = (senha) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    return regex.test(senha);
  };

  const redefinirSenha = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (!validatePassword(novaSenha)) {
      setErro('A senha deve conter: 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.');
      setLoading(false);
      return;
    }

    try {
      await axios.put('/auth/recuperar-senha/redefinir', { 
        email, 
        novaSenha 
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setErro(error.response?.data || 'Erro ao redefinir senha. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <div>
      <Layout />
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Redefinir Senha</h2>
          <form onSubmit={redefinirSenha}>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
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
                placeholder="Confirmar nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
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
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Redefinir Senha'}
            </button>
          </form>
          {erro && <p className={styles.erro}>{erro}</p>}
        </div>
      </div>

      <SuccessModal 
        show={showSuccessModal}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default RedefinirSenha;