import React, { useEffect } from 'react';
import styles from './Assinatura.module.css';
import Layout from '../../Layout/Layout';
import { useNavigate } from 'react-router-dom';

const Assinatura = () => {
  const planos = [
    {
      titulo: 'Inscrição',
      descricao: ['Vantagem 1', 'Vantagem 2', 'Vantagem 3'],
      tipo: 'Mensal',
      preco: 'R$ 4,00',
    },
    {
      titulo: 'Inscrição Plus',
      descricao: ['Vantagem 1', 'Vantagem 2', 'Vantagem 3'],
      tipo: 'Mensal',
      preco: 'R$ 10,00',
    },
    {
      titulo: 'Doação',
      descricao: ['Ao doar para o T.I Informa, você se torna parte fundamental da nossa missão de construir um ecossistema de aprendizado e troca de informações cada vez mais rico e engajador.'],
      tipo: 'Mínimo',
      preco: 'R$ 5,00',
    },
  ];

  const navegarPara = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navegarPara('/login');
    }
  }, [navegarPara]);

  const handleCardClick = (titulo) => {
    alert(`Você selecionou: ${titulo}`);
  };

  return (
    <div>
      <Layout />
      <div className={styles.container}>
        <div className={styles.cardsContainer}>
          {planos.map((plano, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => handleCardClick(plano.titulo)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCardClick(plano.titulo);
              }}
            >
              <h2 className={styles.titulo}>{plano.titulo}</h2>
              <div className={styles.listaVantagens}>
                <h3>Descrição</h3>
                <ul>
                  {plano.descricao.map((vantagem, idx) => (
                    <li key={idx}>{vantagem}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.tipoPrecoContainer}>
                <span className={styles.preco}>
                  {plano.tipo} {plano.preco}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assinatura;