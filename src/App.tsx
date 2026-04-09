import React from 'react';

function App() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#1a1a1a', 
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#646cff' }}>🚀 Sumka</h1>
      <p>Pokud vidíš tohle, tvůj React konečně žije!</p>
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
        Tady začneš stavět své komponenty.
      </div>
    </div>
  );
}

export default App;