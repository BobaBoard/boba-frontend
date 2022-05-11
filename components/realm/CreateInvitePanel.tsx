import {
  Button,
  ButtonStyle,
  Input,
  InputStyle,
} from "@bobaboard/ui-components";

import { AdminPanelIds } from "pages/realms/admin/[[...panelId]]";
import React from "react";
import classnames from "classnames";
import debug from "debug";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

const log = debug("bobafrontend:realms:RealmAdmin-log");

const CreateInvitePanel: React.FC<CreateInvitePanelProps> = ({
  onEmailTextChange,
  onLabelTextChange,
  onSubmit,
  onCopyClick,
  loading,
  email,
  label,
  errorMessage,
  createdInvite,
}) => {
  return (
    <>
      <div
        role="form"
        aria-labelledby={AdminPanelIds.INVITE_FORM}
        className="invite-form"
      >
        <Input
          id="email"
          value={email}
          label="Email*"
          onTextChange={onEmailTextChange}
          theme={InputStyle.DARK}
          errorMessage={errorMessage}
        />
        <Input
          id="label"
          value={label}
          label="Label"
          helper="All Realm admins will be able to see this label."
          onTextChange={onLabelTextChange}
          theme={InputStyle.DARK}
        />
        <div className="submit-button">
          <Button onClick={onSubmit} theme={ButtonStyle.DARK}>
            Create Invite
          </Button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div
            className={classnames("created-invite", {
              visible: createdInvite && createdInvite?.length > 0,
            })}
          >
            {/* TODO: When we move this to the UI codebase, if we add a readOnly prop to our Input component, we can switch this to <Input /> */}
            <input
              type="text"
              value={createdInvite}
              readOnly
              className="invite-url"
            />
            <div className="copy-button">
              <Button
                icon={faCopy}
                onClick={onCopyClick}
                theme={ButtonStyle.DARK}
              >
                Copy URL
              </Button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
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
      `}</style>
    </>
  );
};
export default CreateInvitePanel;

export interface CreateInvitePanelProps {
  onEmailTextChange: (email: string) => void;
  onLabelTextChange: (label: string) => void;
  onSubmit: () => void;
  onCopyClick: () => void;
  email: string;
  label: string;
  loading?: boolean;
  errorMessage?: string;
  createdInvite?: string;
}
