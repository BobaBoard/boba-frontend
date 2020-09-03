import React, { useEffect } from "react";
import Layout from "components/Layout";
import { updateUserData } from "utils/queries/user";
import { useMutation } from "react-query";
// @ts-ignore
import { UserDetails } from "@bobaboard/ui-components";
import { v4 as uuidv4 } from "uuid";
import firebase from "firebase/app";
import debug from "debug";
import { useAuth } from "components/Auth";
import { useRouter } from "next/router";

const log = debug("bobafrontend:index-log");

function UserPage() {
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const [editing, setEditing] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const [updateData] = useMutation(
    (data: { avatarUrl: string; username: string }) => updateUserData(data),
    {
      onSuccess: ({ avatarUrl, username }) => {
        setAvatar(avatarUrl);
        setUsername(username);
        setEditing(false);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    }
  );

  useEffect(() => {
    if (!isUserPending && isLoggedIn) {
      setUsername(user.username);
      setAvatar(user.avatarUrl);
    }
    if (!isUserPending && !isLoggedIn) {
      router.push("/").then(() => window.scrollTo(0, 0));
    }
  }, [isLoggedIn, isUserPending]);

  return (
    <div className="main">
      <Layout
        mainContent={
          <div className="page">
            <div className="user-details">
              <UserDetails
                username={username}
                imageUrl={avatar}
                editable
                onEdit={() => {
                  setEditing(true);
                }}
                onCancel={() => {
                  setEditing(false);
                }}
                onSubmit={(
                  promise: Promise<{ editedImg: string; username: string }>
                ) => {
                  setLoading(true);
                  promise.then(({ editedImg, username: newUsername }) => {
                    const ref = firebase
                      .storage()
                      .ref(`images/users/avatar/`)
                      .child(uuidv4());

                    if (editedImg == avatar && username == newUsername) {
                      setEditing(false);
                      setLoading(false);
                      return;
                    }

                    ref
                      .putString(editedImg, "data_url")
                      .on(firebase.storage.TaskEvent.STATE_CHANGED, {
                        complete: () => {
                          ref.getDownloadURL().then((url) => {
                            updateData({
                              avatarUrl: url,
                              username: newUsername,
                            });
                          });
                        },
                        next: () => {},
                        error: (e) => {
                          log(e);
                          setEditing(false);
                          setLoading(false);
                        },
                      });
                  });
                }}
                editing={editing}
                loading={isUserPending || loading}
                accentColor={"#f96680"}
              />
            </div>
            <div>BobaDex</div>
            <style jsx>{`
              .page {
                width: 100%;
              }
              .user-details {
                max-width: 500px;
                width: 100%;
              }
            `}</style>
          </div>
        }
        title={`Hello!`}
        onTitleClick={() => {}}
      />
    </div>
  );
}

export default UserPage;
