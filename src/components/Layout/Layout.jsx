import React, { useState } from 'react';
import styles from "../Layout/Layout.module.css";

const Layout = ({ children, pageTitle }) => {
  const [sidebarOpen, setAbrir] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.menu}>
          <i
            id="menu-icon"
            className={`fas fa-bars ${styles.menuIcon}`}
            onMouseEnter={() => setAbrir(true)}
          ></i>
        </div>
        <h1>TI Informa</h1>
        <nav className={styles.nav}>
          <button className={styles.btn}>Login</button>
          <button className={styles.btn}>Registrar</button>
        </nav>
      </header>

      <div
        id="sidebar"
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
        onMouseLeave={() => setAbrir(false)}
      >
        <a href="/home">
          <i className="fas fa-home"></i> Home
        </a>
        <a href="/config">
          <i className="fas fa-cogs"></i> Configurações
        </a>
        <a href="/perfil">
          <i className="fas fa-user"></i> Perfil
        </a>
        <a href="/assinatura">
          <i className="fas fa-credit-card"></i> Assinatura
        </a>
      </div>

      <main className={styles.main}>
        <h2>{pageTitle}</h2>
        {children}
      </main>
    </div>
  );
};

export default Layout;
