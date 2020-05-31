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
  const [idToken, setIdToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      console.log(user);
      if (!user) {
        setPending(false);
        setLoggedIn(false);
        setIdToken(null);
      }
      user?.getIdToken().then((idToken) => {
        setLoggedIn(true);
        setPending(false);
        setIdToken(idToken);
      });
    });
  }, []);

  const attemptLogin = (
    username: string,
    password: string
  ): Promise<boolean> => {
    setPending(true);
    return firebase
      .auth()
      .signInWithEmailAndPassword(username, password)
      .then((user) => {
        return !!user;
      })
      .catch((e) => {
        setLoggedIn(false);
        setPending(false);
        return false;
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
      value={{
        isLoggedIn,
        isPending,
        attemptLogin,
        attemptLogout,
        idToken,
      }}
      {...props}
    />
  );
};

export { AuthProvider, useAuth };
