import React from "react";
// @ts-ignore
import { Input, Button, ButtonStyle, Modal } from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import classnames from "classnames";

const PostEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const { isPending, attemptLogin, attemptLogout } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <Modal isOpen={props.isOpen}>
      <div className="login">
        <div className={classnames("inputs", { pending: isPending })}>
          <div>
            <Input
              id={"username"}
              value={username}
              label={"Username"}
              onTextChange={(text) => setUsername(text)}
              color={props.color}
            />
          </div>
          <div>
            <Input
              id={"password"}
              value={password}
              label={"Password"}
              onTextChange={(text) => setPassword(text)}
              password
              color={props.color}
            />
          </div>
        </div>
        <div className="buttons">
          <div>
            <Button
              onClick={() => {
                attemptLogout();
              }}
              theme={ButtonStyle.DARK}
              color={props.color}
            >
              Logout
            </Button>
            <Button
              onClick={() => {
                setUsername("");
                setPassword("");
                props.onCloseModal();
              }}
              theme={ButtonStyle.DARK}
              color={props.color}
            >
              Cancel
            </Button>
          </div>
          <div>
            <Button
              disabled={!username || !password}
              theme={ButtonStyle.DARK}
              color={props.color}
              onClick={() => {
                attemptLogin(username, password).then(() => {
                  setUsername("");
                  setPassword("");
                  props.onCloseModal();
                });
              }}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .login {
          position: relative;
          margin: 20px auto;
          padding: 25px;
          max-width: 500px;
          border-radius: 25px;
          background-color: #131518;
        }
        .login.pending {
          background-color: red;
        }
        .inputs {
          margin: 0 auto;
          margin-bottom: 15px;
          width: 100%;
        }
        .inputs > div:first-child {
          margin-bottom: 5px;
        }
        .buttons {
          display: flex;
          justify-content: flex-end;
        }
        .buttons > div {
          margin-left: 15px;
        }
      `}</style>
    </Modal>
  );
};

export interface PostEditorModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
  color?: string;
}

export default PostEditorModal;
