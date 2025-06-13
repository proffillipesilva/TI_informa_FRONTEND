import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';
import logo from './Logo.png';
import { FaBars, FaTimes } from 'react-icons/fa';
import { HiAcademicCap, HiLogin, HiKey, HiCreditCard, HiAdjustments, HiUser, HiOutlineAcademicCap } from "react-icons/hi";

const Menu = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLogged(!!token);
  }, []);

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  const navegarPara = (rota) => {
    navigate(rota);
    setMenuAberto(false);
  };

  return (
    <div>
      <div className={styles.cabecalho}>

        <button className={styles.botaoMenu} onClick={toggleMenu}>
          {menuAberto ? <FaTimes /> : <FaBars />}
        </button>
        <span className={styles.tituloCabecalho}>T.I Informa</span>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>
      <div className={`${styles.menuLateral} ${menuAberto ? styles.menuAberto : ''}`}>
        <ul>
          {isLogged && (<li onClick={() => navegarPara('/home')}><HiAcademicCap /> Home</li>
          )}
          <li onClick={() => navegarPara('/login')}><HiLogin /> Login</li>
          {!isLogged && (
            <li onClick={() => navegarPara('/register')}><HiKey /> Cadastrar</li>
          )}
          {isLogged && (<li onClick={() => navegarPara('/assinatura')}><HiCreditCard /> Assinaturas</li>
          )}
          {isLogged && (<li onClick={() => navegarPara('/perfil')}><HiUser /> Perfil</li>
          )}
          {isLogged && (<li onClick={() => navegarPara('/interesses')}><HiOutlineAcademicCap /> Interesses</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Menu;