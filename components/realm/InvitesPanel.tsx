import React, { useEffect } from "react";
import { extractImageExtension, uploadImage } from "utils/image-upload";

import { AdminPanelIds } from "pages/realms/admin/[[...panelId]]";
import { UserDetails } from "@bobaboard/ui-components";
import debug from "debug";
import { updateUserData } from "utils/queries/user";
import { useAuth } from "components/Auth";
import { useMutation } from "react-query";
import { useRouter } from "next/router";

const log = debug("bobafrontend:realms:RealmAdmin-log");

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
      <h2 id={AdminPanelIds.INVITE_FORM}>Create Realm Invite</h2>
      <div className="description">
        Invite Boba users to your realm. Each invite is single use.
      </div>
      <div className="invite-form">
        {/* TODO: Replace with correct inputs. UserDetail currently acting as placeholder */}
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
      <h2 id={AdminPanelIds.PENDING_INVITES}>Pending Realm Invites</h2>
      <div className="description">
        A list of all currently pending invites for the realm
      </div>
      <div className="invite-grid">
        <h3>Date Created</h3>
        <h3>Date of Expiry</h3>
        <h3>Invite URL</h3>
        <h3>Label</h3>
        <h3>Created By</h3>
        {/* TODO: Get invites and put them here */}
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

        h3 {
          font-size: var(--font-size-regular);
        }

        .invite-form {
          width: 100%;
        }

        .description {
          margin-bottom: 3.5rem;
          font-size: var(--font-size-regular);
        }

        .invite-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1em;
          background-color: rgb(73, 12, 25);
          width: 100%;
          height: 400px;
        }
      `}</style>
    </>
  );
};
export default InvitesPanel;
