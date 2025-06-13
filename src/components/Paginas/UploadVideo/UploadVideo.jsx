import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import styles from './uploadVideo.module.css';
import axios from '../../../api/axios-config';

const UploadVideo = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState('');
    const [selectedPalavrasChave, setSelectedPalavrasChave] = useState([]);
    const [isEnviando, setIsEnviando] = useState(false);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const categoriasPalavrasChave = {
        'Linguagens de Programação': ['Python', 'Java', 'C++'],
        'Desenvolvimento Web': ['HTML', 'CSS', 'React', 'Angular'],
        'Banco de Dados': ['SQL', 'NoSQL', 'MongoDB']
    };

    const aoSelecionarArquivo = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

            if (!validTypes.includes(file.type)) {
                setErro('Por favor, selecione um arquivo de vídeo válido (MP4, MOV, AVI)');
                setVideoFile(null);
                return;
            }

            setVideoFile(file);
            setErro('');
        }
    };

    const aoSelecionarThumbnail = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

            if (!validTypes.includes(file.type)) {
                setErro('Por favor, selecione uma imagem válida (JPEG, PNG)');
                setThumbnailFile(null);
                return;
            }

            setThumbnailFile(file);
            setErro('');
        }
    };

    const handleCheckboxChange = (palavra) => {
        setSelectedPalavrasChave(prev => {
            if (prev.includes(palavra)) {
                return prev.filter(p => p !== palavra);
            } else {
                return [...prev, palavra];
            }
        });
    };

    const aoEnviarVideo = async () => {
        if (!videoFile) {
            setErro('Selecione um arquivo de vídeo');
            return;
        }

        if (!thumbnailFile) {
            setErro('Selecione uma thumbnail para o vídeo');
            return;
        }

        if (!titulo || !descricao) {
            setErro('Título e descrição são obrigatórios');
            return;
        }

        if (selectedPalavrasChave.length === 0) {
            setErro('Selecione pelo menos uma palavra-chave');
            return;
        }

        setIsEnviando(true);
        setErro('');

        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('thumbnail', thumbnailFile);
        formData.append('titulo', titulo);
        formData.append('descricao', descricao);

        if (categoria) {
            formData.append('categoria', categoria);
        }

        if (selectedPalavrasChave.length > 0) {
            formData.append('palavra_chave', JSON.stringify(selectedPalavrasChave));
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.includes("File uploaded")) {
                alert('Vídeo enviado com sucesso!');
                navigate('/perfil');
            } else {
                throw new Error('Resposta inesperada do servidor');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            setErro(error.response?.data?.message ||
                error.message ||
                'Erro ao enviar vídeo. Por favor, tente novamente.');
        } finally {
            setIsEnviando(false);
        }
    };

    return (
        <>
            <Layout />
            <div className={styles.container}>
                <div className={styles.uploadCard}>
                    <h1>Enviar Novo Vídeo</h1>

                    {erro && <div className={styles.erroMensagem}>{erro}</div>}

                    <div className={styles.formGroup}>
                        <label htmlFor="videoFile">Selecionar Arquivo de Vídeo:*</label>
                        <input
                            type="file"
                            id="videoFile"
                            accept="video/mp4,video/quicktime,video/x-msvideo"
                            onChange={aoSelecionarArquivo}
                            required
                        />
                        {videoFile && (
                            <div className={styles.fileInfo}>
                                <p>Tamanho: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="thumbnailFile">Selecionar Thumbnail:*</label>
                        <input
                            type="file"
                            id="thumbnailFile"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={aoSelecionarThumbnail}
                            required
                        />
                        {thumbnailFile && (
                            <div className={styles.thumbnailPreview}>
                                <img
                                    src={URL.createObjectURL(thumbnailFile)}
                                    alt="Preview da thumbnail"
                                    className={styles.thumbnailImage}
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="titulo">Título:*</label>
                        <input
                            type="text"
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Título do vídeo"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="descricao">Descrição:*</label>
                        <textarea
                            id="descricao"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Descrição do conteúdo"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="categoria">Categoria (opcional):</label>
                        <input
                            type="text"
                            id="categoria"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            placeholder="Ex: Educação, Tecnologia"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Palavras-chave:*</label> {/* Adicionado * para indicar que é obrigatório */}
                        <div className={styles.checkboxGroupContainer}>
                            {Object.entries(categoriasPalavrasChave).map(([categoriaNome, palavras]) => (
                                <div key={categoriaNome} className={styles.categoriaCheckboxGroup}>
                                    <h3>{categoriaNome}</h3>
                                    <div className={styles.palavrasChaveCheckboxes}>
                                        {palavras.map(palavra => (
                                            <label key={palavra} className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    value={palavra}
                                                    checked={selectedPalavrasChave.includes(palavra)}
                                                    onChange={() => handleCheckboxChange(palavra)}
                                                />
                                                {palavra}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className={styles.enviarBotao}
                        onClick={aoEnviarVideo}
                        disabled={isEnviando}
                    >
                        {isEnviando ? 'Enviando...' : 'Enviar Vídeo'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default UploadVideo;