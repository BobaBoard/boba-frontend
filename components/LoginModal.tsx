import React from "react";
import {
  Input,
  ModalWithButtons,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import classnames from "classnames";

const LoginModal: React.FC<LoginModalProps> = (props) => {
  const { isPending, isLoggedIn, attemptLogin, attemptLogout } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <ModalWithButtons
      isOpen={props.isOpen}
      onCloseModal={props.onCloseModal}
      onSubmit={() => {
        if (!isLoggedIn) {
          attemptLogin(email, password).then(() => {
            setEmail("");
            setPassword("");
            props.onCloseModal();
          });
        } else {
          attemptLogout().then(() => {
            props.onCloseModal();
          });
        }
      }}
      color={props.color}
      primaryText={isLoggedIn ? "Logout" : "Login"}
      primaryDisabled={
        !isLoggedIn && (email.trim().length == 0 || password.length == 0)
      }
      secondaryText={"Cancel"}
      shouldCloseOnOverlayClick={true}
    >
      <>
        {!isLoggedIn && (
          <div className="login">
            <div className={classnames("inputs", { pending: isPending })}>
              <div>
                <Input
                  id={"email"}
                  value={email}
                  label={"Email"}
                  onTextChange={(text: string) => setEmail(text)}
                  color={props.color}
                />
              </div>
              <div>
                <Input
                  id={"password"}
                  value={password}
                  label={"Password"}
                  onTextChange={(text: string) => setPassword(text)}
                  password
                  color={props.color}
                />
              </div>
            </div>
          </div>
        )}
        {isLoggedIn && (
          <div className="logout">
            <div>Pull the trigger, Piglet. </div>
          </div>
        )}
      </>
      <style jsx>{`
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
    </ModalWithButtons>
  );
};

export interface LoginModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
  color?: string;
}

export default LoginModal;
