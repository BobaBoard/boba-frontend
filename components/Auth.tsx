import React from "react";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
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

// Here we have a firebase user promise which checks whether we are
// presently in a state where we don't effectively know the status
// of the current user. This could be because the page has just loaded
// or because an action like login or logout is pending.
// In any case, an operation based on knowing the current state of the user
// (like getting the id token or making a new post) cannot be performed
// until this promise is resolved.
let resolveFirebaseUserPromise: (user: firebase.User | null) => void;
const newFirebaseUserPromise = () =>
  new Promise<firebase.User | null>((resolve) => {
    resolveFirebaseUserPromise = resolve;
  });
let firebaseUserPromise = newFirebaseUserPromise();

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
        resolveFirebaseUserPromise(null);
        setStatus({
          isLoggedIn: false,
          isPending: false,
        });
        return;
      }
      resolveFirebaseUserPromise(user);
      axios.get("users/me/").then((userResponse) => {
        if (!userResponse) {
          // Error state
          setStatus({
            isLoggedIn: false,
            isPending: false,
          });
          return;
        }
        setStatus({
          isLoggedIn: true,
          isPending: false,
          user: userResponse.data,
        });
      });
    });
  }, []);

  const getAuthIdToken: () => Promise<string | undefined> = () => {
    return firebaseUserPromise.then((user) => {
      return user?.getIdToken().then((token) => {
        return token;
      });
    });
  };

  const attemptLogin = (
    username: string,
    password: string
  ): Promise<boolean> => {
    setStatus({
      ...status,
      isPending: true,
    });
    firebaseUserPromise = newFirebaseUserPromise();
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
        resolveFirebaseUserPromise(null);
        return false;
      });
  };

  const attemptLogout = () => {
    firebaseUserPromise = newFirebaseUserPromise();
    return firebase.auth().signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        ...status,
        getAuthIdToken,
        attemptLogin,
        attemptLogout,
      }}
      {...props}
    />
  );
};

export { AuthProvider, useAuth };
