import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PlaylistPage from './pages/PlaylistPage';
import YouTubePage from './pages/YouTubePage';
import { PlayerContext } from './context/PlayerContext';

const App = () => {
  console.log("App component rendering");
  const { audioRef, track } = useContext(PlayerContext);

  return (
    <div className="h-screen bg-black">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/youtube" element={<YouTubePage />} />
        </Routes>
      </Layout>
      <audio ref={audioRef} src={track.src} preload="auto"></audio>
    </div>
  );
};

export default App;
