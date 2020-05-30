import React from "react";

import firebase from "firebase/app";
import "firebase/auth";

if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyA8UreGu624GJbczXgT3xmeYBqoX9Z6wZA",
    authDomain: "bobaboard-fb.firebaseapp.com",
    databaseURL: "https://bobaboard-fb.firebaseio.com",
    projectId: "bobaboard-fb",
    storageBucket: "bobaboard-fb.appspot.com",
    messagingSenderId: "148314730930",
    appId: "1:148314730930:web:3e9d2e94a0e94bf1b0b4ab",
  };
  firebase.initializeApp(firebaseConfig);
}

const AuthContext = React.createContext({} as any);

const useAuth = () => React.useContext(AuthContext);

const AuthProvider: React.FC<{}> = (props) => {
  const [isLoggedIn, setLoggedIn] = React.useState(false);
  const [isPending, setPending] = React.useState(true);

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      console.log(user);
      setPending(false);
      setLoggedIn(!!user);
    });
  }, []);

  const attemptLogin = (
    username: string,
    password: string
  ): Promise<{ username: string } | false> => {
    setPending(true);
    return firebase
      .auth()
      .signInWithEmailAndPassword(username, password)
      .then(() => {
        console.log("fb!");
        setLoggedIn(true);
        setPending(false);
        return { username: "tafa!" };
      })
      .catch((e) => {
        console.log(e);
        setLoggedIn(false);
        setPending(false);
        return Promise.reject(e.message);
      });
  };

  const attemptLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("logged out");
      });
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isPending, attemptLogin, attemptLogout }}
      {...props}
    />
  );
};

export { AuthProvider, useAuth };
