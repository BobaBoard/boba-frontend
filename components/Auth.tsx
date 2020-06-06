import React from "react";

import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";

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
  const [status, setStatus] = React.useState<{
    isLoggedIn: boolean;
    isPending: boolean;
    idToken?: string;
    user?: {
      username: string;
      avatarUrl?: string;
    };
  }>({
    isLoggedIn: false,
    isPending: true,
  });

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        setStatus({
          isLoggedIn: false,
          isPending: false,
        });
        return;
      }
      Promise.all([axios.get("users/me/"), user?.getIdToken()]).then(
        ([userResponse, idToken]) => {
          setStatus({
            isLoggedIn: true,
            isPending: false,
            idToken,
            user: userResponse.data,
          });
        }
      );
    });
  }, []);

  const attemptLogin = (
    username: string,
    password: string
  ): Promise<boolean> => {
    setStatus({
      ...status,
      isPending: false,
    });

    return firebase
      .auth()
      .signInWithEmailAndPassword(username, password)
      .then((user) => {
        return !!user;
      })
      .catch((e) => {
        setStatus({
          isLoggedIn: false,
          isPending: false,
        });
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
        ...status,
        attemptLogin,
        attemptLogout,
      }}
      {...props}
    />
  );
};

export { AuthProvider, useAuth };
