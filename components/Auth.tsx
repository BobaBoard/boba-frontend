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
  const [isFirebasePending, setFirebasePending] = React.useState(true);
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
        setFirebasePending(false);
        setStatus({
          isLoggedIn: false,
          isPending: false,
        });
        return;
      }
      user?.getIdToken().then((idToken) => {
        setStatus({
          isLoggedIn: true,
          isPending: true,
          idToken,
        });
        setFirebasePending(false);
        axios.get("users/me/").then((userResponse) => {
          console.log(userResponse.data);
          setStatus({
            isLoggedIn: true,
            isPending: false,
            idToken,
            user: userResponse.data,
          });
        });
      });
    });
  }, []);

  const attemptLogin = (
    username: string,
    password: string
  ): Promise<boolean> => {
    setStatus({
      ...status,
      isPending: true,
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
        setFirebasePending(false);
        return false;
      });
  };

  const attemptLogout = () => {
    return firebase.auth().signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        ...status,
        isFirebasePending,
        attemptLogin,
        attemptLogout,
      }}
      {...props}
    />
  );
};

export { AuthProvider, useAuth };
