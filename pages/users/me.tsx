import React, { useEffect } from "react";
import Layout from "components/Layout";
import { updateUserData, getBobadex } from "utils/queries/user";
import { useQuery, useMutation } from "react-query";
import { UserDetails, BobaDex, TabsGroup } from "@bobaboard/ui-components";
import { v4 as uuidv4 } from "uuid";
import firebase from "firebase/app";
import debug from "debug";
import { useAuth } from "components/Auth";
import { useRouter } from "next/router";
import { FeedWithMenu } from "@bobaboard/ui-components";
import { faHollyBerry, faUser } from "@fortawesome/free-solid-svg-icons";

const log = debug("bobafrontend:index-log");

function UserPage() {
  const {
    isPending: isUserPending,
    user,
    isLoggedIn,
    refreshUserData,
  } = useAuth();
  const [editing, setEditing] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const { mutate: updateData } = useMutation(
    (data: { avatarUrl: string; username: string }) => updateUserData(data),
    {
      onSuccess: ({ avatarUrl, username }) => {
        setAvatar(avatarUrl);
        setUsername(username);
        refreshUserData?.({ username, avatarUrl });
        setEditing(false);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    }
  );

  const { data } = useQuery(["bobadex"], getBobadex);

  const link = React.useMemo(
    () => ({
      onClick: () => console.log("click"),
    }),
    []
  );

  useEffect(() => {
    if (!isUserPending && isLoggedIn) {
      setUsername(user!.username);
      setAvatar(user!.avatarUrl);
    }
    if (!isUserPending && !isLoggedIn) {
      router.push("/").then(() => window.scrollTo(0, 0));
    }
  }, [isLoggedIn, isUserPending]);

  return (
    <div className="main">
      <Layout title={`User Settings`}>
        <Layout.MainContent>
          <FeedWithMenu>
            <FeedWithMenu.Sidebar>
              <div className="sidebar-container">
                <TabsGroup title="User Settings" icon={faUser}>
                  <TabsGroup.Option link={link} selected>
                    Name & Avatar
                  </TabsGroup.Option>
                  <TabsGroup.Option link={link}>BobaDex</TabsGroup.Option>
                </TabsGroup>
                <TabsGroup title="Decorations" icon={faHollyBerry}>
                  <TabsGroup.Option link={link}>Global</TabsGroup.Option>
                </TabsGroup>
                <style jsx>{`
                  .sidebar-container {
                    padding: 30px 20px;
                  }
                `}</style>
              </div>
            </FeedWithMenu.Sidebar>
            <FeedWithMenu.FeedContent>
              <div className="page">
                <h2>You</h2>
                <div className="description">
                  This is how your own posts will appear to yourself. In the
                  future, you'll be able to share this identity with your
                  friends.
                </div>
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
                        } else if (editedImg == avatar) {
                          updateData({
                            avatarUrl: avatar,
                            username: newUsername,
                          });
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
                <h2>BobaDex</h2>
                <div className="description">
                  A random identity is assigned to you on each thread you make
                  (or join!) on BobaBoard. Collect them all!
                </div>
                <div>
                  {data && (
                    <BobaDex
                      totalIdentities={data.identities_count}
                      revealedIdentities={data.user_identities || []}
                    />
                  )}
                </div>
                <style jsx>{`
                  .page {
                    width: 80%;
                    max-width: 800px;
                    color: white;
                    margin: 0 auto;
                    padding-bottom: 100px;
                  }

                  h2 {
                    margin-top: 50px;
                  }

                  .user-details {
                    width: 100%;
                  }

                  .description {
                    margin-bottom: 30px;
                    font-size: large;
                  }
                `}</style>
              </div>
            </FeedWithMenu.FeedContent>
          </FeedWithMenu>
        </Layout.MainContent>
      </Layout>
    </div>
  );
}

export default UserPage;
