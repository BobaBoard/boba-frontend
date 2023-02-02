import { createRealmInvite, getRealmInvites } from "utils/queries/realm";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { AdminPanelIds } from "pages/realms/admin/[[...panelId]]";
import CreateInvitePanel from "./CreateInvitePanel";
import InvitesTable from "./InvitesTable";
import React from "react";
import { copyText } from "utils/text-utils";
import debug from "debug";
import { toast } from "@bobaboard/ui-components";
import { useHotkeys } from "react-hotkeys-hook";
import { useRealmId } from "contexts/RealmContext";

const log = debug("bobafrontend:realms:RealmAdmin-log");

const InvitesPanel = () => {
  const realmId = useRealmId();
  const [email, setEmail] = React.useState("");
  const onEmailTextChange = React.useCallback((email) => setEmail(email), []);
  const [label, setLabel] = React.useState("");
  const onLabelTextChange = React.useCallback((label) => setLabel(label), []);
  const [createdInvite, setCreatedInvite] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
      },
      onError: (error: Error) => {
        setLoading(false);
        toast.error(`Error while creating invite`);
        log("failed to create invite");
        log(error);
      },
    }
  );

  const onSubmit = React.useCallback(() => {
    setLoading(true);
    createInvite({
      realmId,
      email,
      label,
    });
  }, [realmId, email, label, createInvite]);

  const onCopyClick = React.useCallback(() => {
    copyText(createdInvite);
    toast.success("Invite URL copied!");
  }, [createdInvite]);

  useHotkeys("ctrl+enter, cmd+enter", onSubmit, { enableOnTags: ["INPUT"] }, [
    realmId,
    email,
    label,
  ]);

  return (
    <>
      <section>
        <h2 id={AdminPanelIds.INVITE_FORM}>Create Realm Invite</h2>
        <div className="description">
          Invite users to your realm. Each invite is single use.
        </div>
        <CreateInvitePanel
          onEmailTextChange={onEmailTextChange}
          onLabelTextChange={onLabelTextChange}
          onSubmit={onSubmit}
          onCopyClick={onCopyClick}
          loading={loading}
          email={email}
          label={label}
          createdInvite={createdInvite}
        />
      </section>
      <section>
        <h2 id={AdminPanelIds.PENDING_INVITES}>Pending Realm Invites</h2>
        <div className="description">
          A list of all currently pending invites for the realm.
        </div>
        <InvitesTable invites={invites} copyUrl={copyText} />
      </section>
      <style jsx>{`
        h2 {
          font-size: var(--font-size-x-large);
          margin-top: 50px;
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
