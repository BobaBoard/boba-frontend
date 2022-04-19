import { BobaDex, UserDetails } from "@bobaboard/ui-components";
import React, { useEffect } from "react";
import { extractImageExtension, uploadImage } from "utils/image-upload";
import { getBobadex, updateUserData } from "utils/queries/user";
import { useMutation, useQuery } from "react-query";

import { BobadexSeasonType } from "types/Types";
import { SettingPageIds } from "pages/users/settings/[[...settingId]]";
import debug from "debug";
import { makeClientData } from "utils/client-data";
import { useAuth } from "components/Auth";
import { useRouter } from "next/router";

const log = debug("bobafrontend:settings:UserSettings-log");

const InvitesPanel = () => {
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
          onSubmit={async (
            promise: Promise<{ editedImg: string; username: string }>
          ) => {
            setLoading(true);
            const { editedImg, username: newUsername } = await promise;
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

            try {
              const url = await uploadImage({
                baseUrl: `images/users/avatar/`,
                extension: "." + extractImageExtension(editedImg),
                imageData: editedImg,
              });
              updateData({
                avatarUrl: url,
                username: newUsername,
              });
            } catch (e) {
              log(e);
              setEditing(false);
              setLoading(false);
            }
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
      {/* <div>
        {data &&
          data.seasons.map((season: BobadexSeasonType) => (
            <SeasonDisplay
              key={season.id}
              name={season.name}
              totalIdentities={season.identitiesCount}
              revealedIdentities={season.caughtIdentities}
            />
          ))}
      </div> */}
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
export default InvitesPanel;
