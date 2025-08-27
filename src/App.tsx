import { useState } from 'react';
import './App.css'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from "./firebase/config";

function App() {

  const [user, setUser] = useState<any>(null);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <>
      <div style={{ padding: 20 }}>
        {user ? (
          <>
            <p>Olá, {user.displayName}</p>
            <img src={user.photoURL} alt="user" width={50} />
            <button onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <button onClick={handleLogin}>Login com Google</button>
        )}
      </div>
    </>
  )
}

export default App
