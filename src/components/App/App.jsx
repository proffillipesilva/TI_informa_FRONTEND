import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicial from "../Paginas/Inicial/Inicial";
import Register from "../Paginas/Register/Register";
import Login from "../Paginas/Login/Login"
import Home from "../Paginas/Home/Home";
import Perfil from "../Paginas/Perfil/Perfil";
import PerfilView from "../Paginas/PerfilView/PerfilView"; 
import Assinatura from "../Paginas/Assinatura/Assinatura"
import Interesses from "../Paginas/Interesses/Interesses"
import EsqueceuSenha from '../Paginas/EsqueceuSenha/EsqueceuSenha';
import RegisterCriador from '../Paginas/RegisterCriador/RegisterCriador';
import UploadVideo from '../Paginas/UploadVideo/UploadVideo'; 
import PlaylistView from '../Paginas/PlaylistView/PlaylistView';
import VideoPage from '../Paginas/VideoPage/VideoPage';
import RedefinirSenha from '../Paginas/RedefinirSenha/RedefinirSenha';
import ErrorBoundary from './ErrorBoundary';
import AdminPage from '../Paginas/Admin/AdminPage';
import PlaylistVideo from '../Paginas/PlaylistVideo/PlaylistVideo';

function App() {
    return (
        <Router>
            <ErrorBoundary>
                <Routes>
                    <Route path="/" element={<Inicial />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/interesses" element={<Interesses />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/perfil/:userId" element={<PerfilView />} />
                    <Route path="/assinatura" element={<Assinatura />} />
                    <Route path="/EsqueceuSenha" element={<EsqueceuSenha />} />
                    <Route path="/RedefinirSenha" element={<RedefinirSenha />} />
                    <Route path="/RegisterCriador" element={<RegisterCriador />} />
                    <Route path="/upload-video" element={<UploadVideo />} />
                    <Route path="/playlist/:playlistId" element={<PlaylistView />} />
                    <Route path="/video/:videoId" element={<VideoPage />} /> 
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/playlist/:playlistId/video/:videoId" element={<PlaylistVideo />} />
                </Routes>
            </ErrorBoundary>
        </Router>
    );
}

export default App;
