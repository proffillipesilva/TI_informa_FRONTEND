import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterCriador.module.css';
import Layout from '../../Layout/Layout';
import axios from '../../../api/axios-config';

const RegisterCriador = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    senha: '',
    formacao: '',
  });

  const [errors, setErrors] = useState({
    nome: '',
    cpf: '',
    senha: '',
    formacao: '',
    general: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'nome':
        if (!value) return 'O nome é obrigatório';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Digite um nome válido (apenas letras)';
        return '';
      case 'cpf':
        if (!value) return 'O CPF é obrigatório';
        if (!/^\d{11}$/.test(value)) return 'O CPF deve conter 11 dígitos numéricos';
        return '';
      case 'senha':
        if (!value) return 'A senha é obrigatória';
        return '';
      case 'formacao':
        if (!value.trim()) return 'A formação é obrigatória';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value),
      general: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const newErrors = {
      nome: validateField('nome', formData.nome),
      cpf: validateField('cpf', formData.cpf),
      senha: validateField('senha', formData.senha),
      formacao: validateField('formacao', formData.formacao),
      general: ''
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/usuario/solicitar-criador', {
        nome: formData.nome,
        cpf: formData.cpf,
        senha: formData.senha,
        formacao: formData.formacao
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        alert('Solicitação enviada com sucesso! Aguarde a aprovação do administrador.');
        navigate('/perfil');
      }
    } catch (error) {
      if (error.response) {
        const backendError = error.response.data;
        
        if (typeof backendError === 'string') {
          setErrors(prev => ({ ...prev, general: backendError }));
        } else if (error.response.status === 400) {
          setErrors(prev => ({
            ...prev,
            ...(backendError.nome && { nome: backendError.nome }),
            ...(backendError.cpf && { cpf: backendError.cpf }),
            ...(backendError.senha && { senha: backendError.senha }),
            ...(backendError.formacao && { formacao: backendError.formacao }),
            general: backendError.message || 'Erro ao enviar solicitação'
          }));
        } else if (error.response.status === 401) {
          setErrors(prev => ({ ...prev, general: 'Você não tem permissão para esta ação' }));
        } else {
          setErrors(prev => ({ ...prev, general: 'Erro ao processar solicitação' }));
        }
      } else if (error.request) {
        setErrors(prev => ({ ...prev, general: 'Sem resposta do servidor' }));
      } else {
        setErrors(prev => ({ ...prev, general: error.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Layout />
      <div className={styles.container} style={{ justifyContent: 'center' }}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h2 className={styles.title}>Solicitação para ser Criador</h2>
            
            {errors.general && <p className={styles.error}>{errors.general}</p>}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {errors.nome && <p className={styles.error}>{errors.nome}</p>}

              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  placeholder="Confirme sua senha atual"
                  value={formData.senha}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={styles.togglePassword}
                >
                  {showPassword ? 'Esconder' : 'Mostrar'}
                </button>
              </div>
              {errors.senha && <p className={styles.error}>{errors.senha}</p>}

              <input
                type="text"
                name="cpf"
                placeholder="Digite seu CPF (apenas números)"
                value={formData.cpf}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {errors.cpf && <p className={styles.error}>{errors.cpf}</p>}

              <input
                type="text"
                name="formacao"
                placeholder="Formação acadêmica"
                value={formData.formacao}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {errors.formacao && <p className={styles.error}>{errors.formacao}</p>}

              <button
                type="submit"
                className={styles.button}
                disabled={loading || Object.values(errors).some(e => e !== '')}
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCriador;