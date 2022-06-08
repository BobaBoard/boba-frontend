import { Button, ButtonStyle, toast } from "@bobaboard/ui-components";

import { AdminPanelIds } from "pages/realms/admin/[[...panelId]]";
import { DetailedRealmInvite } from "types/Types";
import React from "react";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { format } from "date-fns";

const InvitesTable: React.FC<InviteTableProps> = ({ invites, copyUrl }) => {
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
    const resizeObserver = new ResizeObserver(() => {
      setNarrow(matchMedia(`only screen and (max-width: 1060px)`).matches);
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      {!!invites?.length && !narrow && (
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
                  {/* TODO: When we move this to the UI codebase, if we add a readOnly prop to our Input component, we can switch this to <Input /> */}
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
                        copyUrl(invite.inviteUrl);
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
      {!!invites?.length && narrow && (
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

                  {/* TODO: When we move this to the UI codebase, if we add a readOnly prop to our Input component, we can switch this to <Input /> */}
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
                        copyUrl(invite.inviteUrl);
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
      {(!invites || !invites.length) && (
        <div className="empty">
          <p>There are no currently pending invites.</p>
        </div>
      )}

      <style jsx>{`
        th {
          font-size: var(--font-size-regular);
          justify-content: start;
          text-align: start;
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

        /* Apparently this will bork the table semantics in Safari for accessibility, but should work in Firefox & Chrome */
        thead,
        tbody,
        tr {
          display: contents;
        }

        td {
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
export default InvitesTable;

export interface InviteTableProps {
  copyUrl: (url: string) => void;
  invites?: DetailedRealmInvite[];
}
