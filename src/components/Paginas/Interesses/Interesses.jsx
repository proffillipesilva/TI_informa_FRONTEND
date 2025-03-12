import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Interesses.module.css';
import logo from '../../Layout/logo.png';

const Interesses = () => {
  const acesso = useNavigate();

  const abrirMenu = () => {
    alert('Menu clicado!');
  };

  const selecionarInteresse = (interesse) => {
    alert(`Você escolheu: ${interesse}`);
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

      <div className={styles.container}>
        <div className={styles.secaoFormulario}>
          <div className={styles.cartao}>
            <h2 className={styles.titulo}>Interesses</h2>
            <p className={styles.textoBoasVindas}>
              Bem-vindo! Escolha seus interesses para recomendarmos os melhores cursos para você
            </p>

            <div className={styles.secao}>
              <h3 className={styles.tituloSecao}>Linguagens de Programação</h3>
              <div className={styles.linha}></div>
              <div className={styles.linhaBotoes}>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('Python')}>Python</button>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('Java')}>Java</button>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('C++')}>C++</button>
              </div>
            </div>

            <div className={styles.secao}>
              <h3 className={styles.tituloSecao}>Desenvolvimento Web</h3>
              <div className={styles.linha}></div>
              <div className={styles.linhaBotoes}>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('HTML')}>HTML</button>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('CSS')}>CSS</button>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('React')}>React</button>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('Angular')}>Angular</button>
              </div>
            </div>

            <div className={styles.secao}>
              <h3 className={styles.tituloSecao}>Banco de Dados</h3>
              <div className={styles.linha}></div>
              <div className={styles.linhaBotoes}>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('SQL')}>SQL</button>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('NoSQL')}>NoSQL</button>
                <button className={styles.botaoInteresse} onClick={() => selecionarInteresse('MongoDB')}>MongoDB</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.barra} ${styles.inferior}`}></div>
    </div>
  );
};

export default Interesses;