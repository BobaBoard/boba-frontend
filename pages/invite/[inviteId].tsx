import React, { useEffect } from "react";
import Layout from "../../components/Layout";
import {
  Input,
  Button,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { useAuth } from "../../components/Auth";
import { useMutation } from "react-query";
import debug from "debug";
import { useRouter } from "next/router";
import classnames from "classnames";
import { acceptInvite } from "../../utils/queries/user";

const log = debug("bobafrontend:index-log");

function InvitesPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const {
    isPending: isUserPending,
    user,
    isLoggedIn,
    attemptLogin,
  } = useAuth();

  const [updateData] = useMutation(
    (data: { password: string; email: string; nonce: string }) =>
      acceptInvite(data),
    {
      onSuccess: () => {
        attemptLogin(email, password);
      },
      onError: (e) => {
        log(`Error while accepting invite:`);
        log(e);
        setLoading(false);
        // @ts-ignore
        setError(e.response.data.message);
      },
    }
  );

  useEffect(() => {
    if (!isUserPending && isLoggedIn) {
      router
        .push("/users/me?inviteSuccess", "/users/me?inviteSuccess", {
          shallow: true,
        })
        .then(() => window.scrollTo(0, 0));
    }
  }, [isLoggedIn, isUserPending]);

  return (
    <div className="main">
      <Layout
        mainContent={
          <div className="page">
            <div className="invite-signup">
              <p>
                Hello, and (almost) welcome to BobaBoard. Just one last step
                before you can join in the fun: time to choose a password!
              </p>
              <p>
                In order to protect your precious invite, it's been bethroted to
                your precious email. Make sure what you enter matches what was
                given.
              </p>
              <p>
                <strong>Remember:</strong> keeping BobaBoard a safe and
                respectful community is everyone's job! Especially in these
                early stages, you have real power to influence the culture that
                will develop on this platform.
              </p>
              <p>
                Communicate with care, assume good intentions, and remember that
                sometimes leaving an upsetting conversation to take a breather
                is the right thing to do. Make generous use of the "hide thread"
                button, and stay tuned for better filtering tools.
              </p>
              <p>
                If you have concerns, no matter how small, the webmaster's door
                is always open.
              </p>
              <div className={classnames("inputs", { pending: isUserPending })}>
                <div>
                  <Input
                    id={"email"}
                    value={email}
                    label={"Email"}
                    onTextChange={(text: string) => setEmail(text)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Input
                    id={"password"}
                    value={password}
                    label={"Password"}
                    onTextChange={(text: string) => setPassword(text)}
                    password
                    disabled={loading}
                  />
                </div>
                <div className={classnames("error", { hidden: !error })}>
                  {error || "Hidden error field!"}
                </div>
                <div className="buttons">
                  <Button
                    onClick={() => {
                      setLoading(true);
                      updateData({
                        email,
                        password,
                        nonce: router.query.inviteId as string,
                      });
                    }}
                  >
                    Signup
                  </Button>
                </div>
              </div>
            </div>
            <style jsx>{`
              .page {
                width: 100%;
                color: white;
              }
              .invite-signup {
                max-width: 500px;
                width: 100%;
                margin: 0 auto;
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
              .error {
                color: red;
                margin-top: 10px;
                margin-left: 20px;
                font-size: small;
              }
              .error.hidden {
                visibility: hidden;
              }
            `}</style>
          </div>
        }
        title={`Invites`}
        onTitleClick={() => {}}
      />
    </div>
  );
}

export default InvitesPage;
