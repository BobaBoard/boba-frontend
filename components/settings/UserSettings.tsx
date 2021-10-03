import React, { useEffect } from "react";
import { updateUserData, getBobadex } from "utils/queries/user";
import { useQuery, useMutation } from "react-query";
import { UserDetails, BobaDex } from "@bobaboard/ui-components";
import { v4 as uuidv4 } from "uuid";
import firebase from "firebase/app";
import debug from "debug";
import { useAuth } from "components/Auth";
import { useRouter } from "next/router";
import { SettingPageIds } from "pages/users/settings/[[...settingId]]";
import { BobadexSeasonType } from "types/Types";
import { makeClientData } from "utils/client-data";

const log = debug("bobafrontend:settings:UserSettings-log");

const SeasonDisplay = (props: {
  name: string;
  totalIdentities: number;
  revealedIdentities: BobadexSeasonType["caughtIdentities"];
}) => {
  return (
    <>
      <h3>{props.name}</h3>
      <BobaDex
        totalIdentities={props.totalIdentities}
        revealedIdentities={props.revealedIdentities}
      />
      <style jsx>{`
        h3 {
          margin-top: 2rem;
          margin-bottom: 2.5rem;
          text-transform: uppercase;
          letter-spacing: 0.15rem;
          font-size: var(--font-size-small);
        }
      `}</style>
    </>
  );
};

const UserSettings = () => {
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

  const { data } = useQuery(["bobadex"], async () => {
    return makeClientData(await getBobadex()) as {
      seasons: BobadexSeasonType[];
    };
  });

  useEffect(() => {
    if (!isUserPending && isLoggedIn) {
      setUsername(user!.username);
      setAvatar(user!.avatarUrl);
    }
    if (!isUserPending && !isLoggedIn) {
      router.push("/").then(() => window.scrollTo(0, 0));
    }
  }, [isLoggedIn, isUserPending, router, user]);

  return (
    <>
      <h2 id={SettingPageIds.DISPLAY_DATA}>You</h2>
      <div className="description">
        This is how your own posts will appear to yourself. In the future,
        you'll be able to share this identity with your friends.
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
      <h2 id={SettingPageIds.BOBADEX}>BobaDex</h2>
      <div className="description">
        A random identity is assigned to you on each thread you make (or join!)
        on BobaBoard. Collect them all!
      </div>
      <div>
        {data &&
          data.seasons.map((season: BobadexSeasonType) => (
            <SeasonDisplay
              key={season.id}
              name={season.name}
              totalIdentities={season.identitiesCount}
              revealedIdentities={season.caughtIdentities}
            />
          ))}
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
          font-size: var(--font-size-x-large);
          margin-top: 50px;
        }

        .user-details {
          width: 100%;
        }

        .description {
          margin-bottom: 3.5rem;
          font-size: var(--font-size-regular);
        }
      `}</style>
    </>
  );
};
export default UserSettings;
