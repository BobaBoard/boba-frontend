import React, { useEffect } from "react";
import { extractImageExtension, uploadImage } from "utils/image-upload";

import { AdminPanelIds } from "pages/realms/admin/[[...panelId]]";
import { UserDetails } from "@bobaboard/ui-components";
import debug from "debug";
import { format } from "date-fns";
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

  const invites = [
    {
      realm_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
      invite_url: "https://twisted_minds.boba.social/invites/123invite_code456",
      invitee_email: "ms.boba@bobaboard.com",
      own: false,
      issued_at: "2021-06-09T04:20:00Z",
      expires_at: "2021-06-09T16:20:00Z",
      label: "This is a test invite.",
    },
    {
      realm_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
      invite_url: "https://twisted_minds.boba.social/invites/456invite_code789",
      invitee_email: "nolabels@bobaboard.com",
      own: true,
      issued_at: "2021-06-09T04:20:00Z",
      expires_at: "2021-06-09T16:20:00Z",
    },
    {
      realm_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
      invite_url: "https://twisted_minds.boba.social/invites/789invite_code456",
      invitee_email: "someone.else@bobaboard.com",
      own: true,
      issued_at: "2021-06-09T04:20:00Z",
      expires_at: "2021-06-09T16:20:00Z",
      label: "This is test invite 3",
    },
  ];

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
      <table className="invite-grid">
        <thead>
          <tr>
            <th>Created</th>
            <th>Expires</th>
            <th>Invite URL</th>
            <th>Label</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <tr key={invite.invite_url}>
              <td>{format(new Date(invite.issued_at), "MMM d, yyyy")}</td>
              <td>{format(new Date(invite.expires_at), "MMM d, yyyy")}</td>
              <td>{invite.invite_url}</td>
              <td>{invite.label ? invite.label : ""}</td>
              <td>{invite.own ? "You" : "Another Admin"}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

        th {
          font-size: var(--font-size-regular);
          justify-content: start;
          text-align: start;
        }

        .invite-form {
          width: 100%;
        }

        .description {
          margin-bottom: 3.5rem;
          font-size: var(--font-size-regular);
        }

        thead,
        tbody,
        tr {
          display: contents;
        }

        .invite-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1em;
          background-color: rgb(73, 12, 25);
          border-radius: 15px;
          width: 100%;
          padding: 1em;
        }
      `}</style>
    </>
  );
};
export default InvitesPanel;
