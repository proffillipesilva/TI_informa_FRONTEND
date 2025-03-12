import React from 'react';
import styles from './Home.module.css';
import logo from '../../Layout/logo.png';

const Home = () => {
  const abrirMenu = () => {
    alert('Menu clicado!');
  };

  const navegarPara = (pagina) => {
    alert(`Navegando para: ${pagina}`);
  };

  return (
    <div>
      <div className={styles.cabecalho}>
        <button className={styles.botaoMenu} onClick={abrirMenu}>
          <span className={styles.ponto}>&#8226;</span>
          <span className={styles.ponto}>&#8226;</span>
          <span className={styles.ponto}>&#8226;</span>
        </button>
        <span className={styles.tituloCabecalho}>T.I Informa</span>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>
    </div>
  );
};

export default Home;
