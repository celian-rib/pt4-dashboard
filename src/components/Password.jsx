import React from 'react';
import { useGlobal } from 'reactn';

import { signInWithEmailAndPassword } from 'firebase/auth';

import '../stylesheets/password.css';
import { toast } from 'react-toastify';

function Password() {

  const [, setUser] = useGlobal('user');
  const [auth] = useGlobal('auth');

  const signIn = () => {
    const pswd = prompt('Mot de passe');
    signInWithEmailAndPassword(auth, 'pt4admin@admin.com', pswd)
      .then((userCredential) => {
        const user = userCredential.user;
        toast.success('Connecté');
        console.log(user);
        setUser(user);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  return (
    <div onClick={signIn} className="password">
      <p>Se connecter</p>
    </div >
  );
}

export default Password;
