import React, { useEffect } from "react";
import Layout from "../../components/Layout";
import {
  Input,
  Button,
  ButtonStyle,
  InputStyle,
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
  const { isPending: isUserPending, isLoggedIn, attemptLogin } = useAuth();

  const { mutate: updateData } = useMutation(
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
              <div className="hero">
                <img src="/bobatan.png" />
                <p>
                  Hello, and (almost) welcome to BobaBoard. Just one last step
                  before you can join in the fun: time to choose a password!
                </p>
              </div>
              <p>
                In order to protect your precious invite, it's been betrothed to
                your precious email. Make sure what you enter matches what was
                given.
              </p>
              <p>
                <strong>Remember:</strong> keeping BobaBoard a safe and
                respectful community is everyone's job! Especially in these
                early stages, you have real power to influence the developing
                culture on this platform. Be as nasty as your heart desires
                towards fictional characters, but excellent to other boobies.
              </p>
              <p>
                Communicate with care, assume good intentions, and remember that
                leaving a derailing conversation to take a breather can go a
                long way. Make generous use of the "hide thread" button, and
                stay tuned for better filtering tools!
              </p>
              <p>
                If you have concerns, no matter how small, the webmaster's door
                is always open. In doubt, consult our{" "}
                <a href="https://www.notion.so/BobaBoard-s-Welcome-Packet-b0641466bfdf4a1cab8575083459d6a2">
                  Welcome Guide
                </a>{" "}
                or ask your questions on the boards!
              </p>
              <div className={classnames("inputs", { pending: isUserPending })}>
                <div>
                  <Input
                    id={"email"}
                    value={email}
                    label={"Email"}
                    onTextChange={(text: string) => setEmail(text)}
                    disabled={loading}
                    theme={InputStyle.DARK}
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
                    theme={InputStyle.DARK}
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
                    theme={ButtonStyle.DARK}
                  >
                    Signup
                  </Button>
                </div>
              </div>
            </div>
            <style jsx>{`
              .page {
                width: 80%;
                color: white;
                margin: 0 auto;
                font-weight: normal;
                line-height: 1.4em;
              }
              a {
                color: #f96680;
              }
              .invite-signup {
                max-width: 500px;
                margin: 50px auto 70px;
              }

              .hero > img {
                max-width: 350px;
                display: block;
                margin: 0 auto;
                border-radius: 50%;
              }

              .hero > p {
                font-size: 24px;
                font-weight: 300;
                line-height: 1.3em;
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
