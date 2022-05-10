import {
  Button,
  ButtonStyle,
  Input,
  InputStyle,
  toast,
} from "@bobaboard/ui-components";
import React, { useEffect } from "react";
import { createRealmInvite, getRealmInvites } from "utils/queries/realm";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { AdminPanelIds } from "pages/realms/admin/[[...panelId]]";
import classnames from "classnames";
import { copyText } from "utils/text-utils";
import debug from "debug";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { format } from "date-fns";
import { useAuth } from "components/Auth";
import { useHotkeys } from "react-hotkeys-hook";
import { useRealmId } from "contexts/RealmContext";
import { useRouter } from "next/router";

const log = debug("bobafrontend:realms:RealmAdmin-log");

const InvitesPanel = () => {
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const realmId = useRealmId();
  const [email, setEmail] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [createdInvite, setCreatedInvite] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [narrow, setNarrow] = React.useState(
    // 1060px is the width where the table headers start having trouble when the sidebar is there.
    // I'm not bothering for the moment to have it switch back to the table layout for the couple hundred pixels
    // between when the sidebar goes away and and when it would get too narrow again
    typeof window != "undefined" &&
      matchMedia("only screen and (max-width: 1060px)").matches
  );

  React.useEffect(() => {
    // I used FeedWithMenu in the ui codebase as my example for this.
    // You had a polyfill there that we don't have the package installed on this codebase for, so I left it off for now.
    // We can decide if it's necessary/if we want to install it here or move this component out to the ui codebase.
    const ResizeObserver = window.ResizeObserver;
    const resizeObserver = new ResizeObserver(() => {
      setNarrow(matchMedia(`only screen and (max-width: 1060px)`).matches);
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const router = useRouter();

  const queryClient = useQueryClient();

  const REALM_INVITES_KEY = "realmInvites";
  const { data: invites } = useQuery([REALM_INVITES_KEY, { realmId }], () =>
    getRealmInvites({ realmId })
  );

  const { mutate: createInvite } = useMutation(
    (data: { realmId: string; email: string; label?: string }) =>
      createRealmInvite(data),
    {
      onSuccess: ({ inviteUrl }) => {
        setEmail("");
        setLabel("");
        setCreatedInvite(inviteUrl);
        queryClient.invalidateQueries(REALM_INVITES_KEY);
        setLoading(false);
        setErrorMessage("");
      },
      onError: (error: Error) => {
        setLoading(false);
        toast.error(`Error while creating invite`);
        log("failed to create invite");
        log(error);
      },
    }
  );
  useHotkeys(
    "ctrl+enter, cmd+enter",
    () => {
      setLoading(true);
      createInvite({
        realmId,
        email,
        label,
      });
    },
    { enableOnTags: ["INPUT"] },
    [realmId, email, label]
  );

  // This was in the UserSettings component that I was using as my example,
  // but if the parent page is already checking this does it still need to be here?
  useEffect(() => {
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
      <div
        role="form"
        aria-labelledby={AdminPanelIds.INVITE_FORM}
        className="invite-form"
      >
        <Input
          id="email"
          value={email}
          label="Email*"
          onTextChange={setEmail}
          theme={InputStyle.DARK}
          errorMessage={errorMessage}
        />
        <Input
          id="label"
          value={label}
          label="Label"
          helper="All Realm admins will be able to see this label."
          onTextChange={setLabel}
          theme={InputStyle.DARK}
        />
        <div className="submit-button">
          <Button
            onClick={() => {
              if (!email) {
                setErrorMessage("Email required");
                return;
              }
              setLoading(true);
              createInvite({
                realmId,
                email,
                label,
              });
            }}
            theme={ButtonStyle.DARK}
          >
            Create Invite
          </Button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div
            className={classnames("created-invite", {
              visible: createdInvite?.length > 0,
            })}
          >
            <input
              type="text"
              value={createdInvite}
              readOnly
              className="invite-url"
            />
            <div className="copy-button">
              <Button
                icon={faCopy}
                onClick={() => {
                  copyText(createdInvite);
                  toast.success("Invite URL copied!");
                }}
                theme={ButtonStyle.DARK}
              >
                Copy URL
              </Button>
            </div>
          </div>
        )}
      </div>
      <h2 id={AdminPanelIds.PENDING_INVITES}>Pending Realm Invites</h2>
      <div className="description">
        A list of all currently pending invites for the realm.
      </div>
      {invites?.length && !narrow && (
        <table
          aria-labelledby={AdminPanelIds.PENDING_INVITES}
          className="invite-grid"
        >
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
              <tr key={invite.inviteUrl}>
                <td>{format(invite.issuedAt, "MMM d, yyyy")}</td>
                <td>{format(invite.expiresAt, "MMM d, yyyy")}</td>
                <td className="url-row">
                  <input
                    type="text"
                    value={invite.inviteUrl}
                    readOnly
                    className="invite-url"
                  />
                  <div className="copy-button">
                    <Button
                      icon={faCopy}
                      onClick={() => {
                        copyText(invite.inviteUrl);
                        toast.success("Invite URL copied!");
                      }}
                      theme={ButtonStyle.DARK}
                      compact={true}
                      label="copy invite URL"
                    >
                      Copy URL
                    </Button>
                  </div>
                </td>
                <td>{invite.label ? invite.label : ""}</td>
                <td>{invite.own ? "You" : "Another Admin"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {invites?.length && narrow && (
        <ul
          aria-labelledby={AdminPanelIds.PENDING_INVITES}
          className="invite-list"
        >
          {invites.map((invite) => (
            <li key={invite.inviteUrl}>
              <ul className="invite">
                <li>
                  <strong>Created: </strong>
                  {format(invite.issuedAt, "MMM d, yyyy")}
                </li>
                <li>
                  <strong>Expires: </strong>
                  {format(invite.expiresAt, "MMM d, yyyy")}
                </li>
                <li className="url-li">
                  <strong>Invite URL: </strong>
                  <input
                    type="text"
                    value={invite.inviteUrl}
                    readOnly
                    className="invite-url"
                  />
                  <div className="copy-button">
                    <Button
                      icon={faCopy}
                      onClick={() => {
                        copyText(invite.inviteUrl);
                        toast.success("Invite URL copied!");
                      }}
                      theme={ButtonStyle.DARK}
                      compact={true}
                      label="copy invite URL"
                    >
                      Copy URL
                    </Button>
                  </div>
                </li>
                {invite.label?.length && (
                  <li>
                    <strong>Label: </strong>
                    {invite.label}
                  </li>
                )}
                <li>
                  <strong>Created By: </strong>
                  {invite.own ? "You" : "Another Admin"}
                </li>
              </ul>
            </li>
          ))}
        </ul>
      )}

      {!invites?.length && (
        <div className="empty">
          <p>There are no currently pending invites.</p>
        </div>
      )}
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
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 1em;
          background-color: #3a3a3c;
          border-radius: 10px;
          width: 100%;
          padding: 20px;
        }

        .submit-button {
          margin-left: auto;
        }

        .invite {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 5px;
          background-color: #3a3a3c;
          border-radius: 10px;
          width: 100%;
          padding: 20px;
        }

        .invite-list > li:not(:last-child) {
          margin-bottom: 10px;
        }

        ul {
          list-style: none;
          padding-left: 0;
        }

        .description {
          margin-bottom: 3.5rem;
          font-size: var(--font-size-regular);
        }

        .created-invite {
          display: none;
        }

        .created-invite.visible {
          display: flex;
          flex-direction: row;
          gap: 0.7em;
          align-items: center;
        }

        .invite-url {
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          font-size: var(--font-size-regular);
          padding: 12px;
          background-color: #2f2f30;
          width: 100%;
          max-width: 400px;
          box-sizing: border-box;
        }

        .created-invite .copy-button {
          min-width: 106px;
        }

         {
          /* Apparently this will bork the table semantics in Safari for accessibility, but should work in Firefox & Chrome */
        }
        thead,
        tbody,
        tr {
          display: contents;
        }

        td,
        li {
          overflow-wrap: anywhere;
        }

        .url-row,
        .url-li {
          display: flex;
          flex-direction: row;
          gap: 0.5em;
          align-items: center;
        }

        .invite-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 2fr 1fr 1fr;
          row-gap: 0.8em;
          column-gap: 0.9em;
          background-color: #3a3a3c;
          border-radius: 10px;
          width: 100%;
          padding: 20px;
          align-items: center;
        }

        .empty {
          display: grid;
          place-content: center;
          background-color: #3a3a3c;
          border-radius: 10px;
          width: 100%;
          padding: 20px;
        }
      `}</style>
    </>
  );
};
export default InvitesPanel;
