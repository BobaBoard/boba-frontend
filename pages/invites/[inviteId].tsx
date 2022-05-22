import {
  Button,
  ButtonStyle,
  Input,
  InputStyle,
  toast,
} from "@bobaboard/ui-components";
import { NextPage, NextPageContext } from "next";
import React, { useEffect } from "react";
import { useRealmId, useRealmPermissions } from "contexts/RealmContext";

import Layout from "components/layout/Layout";
import { PERSONAL_SETTINGS_PATH } from "utils/router-utils";
import { PageContextWithQueryClient } from "additional";
import { acceptInvite } from "utils/queries/user";
import classnames from "classnames";
import debug from "debug";
import { getCurrentRealmSlug } from "utils/location-utils";
import { getInviteStatusByNonce } from "utils/queries/realm";
import { useAuth } from "components/Auth";
import { useMutation } from "react-query";
import { useRouter } from "next/router";

const log = debug("bobafrontend:index-log");
const error = debug("bobafrontend:index-error");

const InvitesPage: NextPage<InvitesPageProps> = ({
  realmSlug,
  realmId,
  inviteStatus,
}) => {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const getInviteStatusError = (inviteStatus: string) => {
    if (inviteStatus === "pending") return "";
    if (inviteStatus === "used") return "This invite has already been used.";
    if (inviteStatus === "expired") return "This invite has expired.";
    return inviteStatus;
  };
  const inviteStatusError = getInviteStatusError(inviteStatus);
  const [error, setError] = React.useState(inviteStatusError);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { isPending: isUserPending, isLoggedIn, attemptLogin } = useAuth();
  const realmName = realmSlug
    .replace(/^(.)/, (c) => c.toUpperCase())
    .replace(/[-](.)/g, (_, c) => " " + c.toUpperCase());
  const clientRealmId = useRealmId();
  const realmIdToUse = realmId ? realmId : clientRealmId;
  const alreadyRealmMember = !!useRealmPermissions().length;

  const { mutate: updateData } = useMutation(
    (data: {
      password: string;
      email: string;
      realmId: string;
      nonce: string;
    }) => acceptInvite(data),
    {
      onSuccess: () => {
        if (!isLoggedIn) {
          attemptLogin!(email, password);
        }
        router.push("/");
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
    if (!isUserPending && alreadyRealmMember) {
      toast.success(`You are already a member of ${realmName}`);
      router.push("/");
      // .then(() => window.scrollTo(0, 0));
    }
  }, [alreadyRealmMember, isUserPending, router, realmName]);

  return (
    <Layout
      title={`Invites`}
      loginOpen={loginOpen}
      onLoginClose={() => setLoginOpen(false)}
    >
      <Layout.MainContent>
        <div className="page">
          <div className="invite-signup">
            <div className="hero">
              {/* TODO: Make this the realm icon */}
              <img src="/bobatan.png" />
              <h1>You've been invited to join {realmName}!</h1>
            </div>
            <div className="rules">
              {/* TODO: Insert Rules component here */}
              Realm rules component to go here
            </div>
            {!isLoggedIn && (
              <div className="boba-welcome">
                <div className="welcome-header">
                  <img src="/bobatan.png" />
                  <div className="intro-wrapper">
                    <p className="intro">
                      Hello, and (almost) welcome to BobaBoard.
                    </p>
                    <p className="intro">
                      Just one last step before you can join in the fun: time to
                      create an account!
                    </p>
                    <p>
                      Already have a Boba account?{" "}
                      <Button onClick={() => setLoginOpen(!isUserPending)}>
                        Login
                      </Button>
                    </p>
                  </div>
                </div>
                <p>
                  In order to protect your precious invite, it's been betrothed
                  to your precious email. Make sure what you enter matches what
                  was given.
                </p>
                <p>
                  <strong>Remember:</strong> keeping BobaBoard a safe and
                  respectful community is everyone's job! Especially in these
                  early stages, you have real power to influence the developing
                  culture on this platform. Be as nasty as your heart desires
                  towards fictional characters, but excellent to other boobies.
                </p>
                <p>
                  Communicate with care, assume good intentions, and remember
                  that leaving a derailing conversation to take a breather can
                  go a long way. Make generous use of the "hide thread" button,
                  and stay tuned for better filtering tools!
                </p>
                <p>
                  If you have concerns, no matter how small, the webmaster's
                  door is always open. In doubt, consult our{" "}
                  <a href="https://www.notion.so/BobaBoard-s-Welcome-Packet-b0641466bfdf4a1cab8575083459d6a2">
                    Welcome Guide
                  </a>{" "}
                  or ask your questions on the boards!
                </p>
              </div>
            )}
            <div className={classnames("inputs", { pending: isUserPending })}>
              {!isLoggedIn && (
                <div>
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
                </div>
              )}
              <div className={classnames("error", { hidden: !error })}>
                {error || "Hidden error field!"}
              </div>
              <div className="buttons">
                <Button
                  disabled={inviteStatus === "pending" ? false : true}
                  onClick={() => {
                    setLoading(true);
                    if (!isLoggedIn) {
                      attemptLogin!(email, password);
                    }
                    updateData({
                      nonce: router.query.inviteId as string,
                      email,
                      password,
                      realmId: realmIdToUse,
                    });
                  }}
                  theme={ButtonStyle.DARK}
                >
                  Join {realmName}
                </Button>
              </div>
            </div>
            <div className="ps">
              <p>
                Not interested in the {realmName} realm?{" "}
                {isLoggedIn ? (
                  <a href="http://v0.boba.social">Go back to V0</a>
                ) : (
                  <span>
                    No worries, we hope you find a realm that suits in future.
                    In the meantime, you can follow Bobaboard's development on{" "}
                    <a href="https://twitter.com/BobaBoard">Twitter</a>,{" "}
                    <a href="https://bobaboard.tumblr.com/">Tumblr</a>, and{" "}
                    <a href="https://bobaboard.com/">BobaBoard.com</a>!
                  </span>
                )}
              </p>
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
              max-width: 800px;
              margin: 50px auto 70px;
            }

            .hero > img {
              width: 100%;
              max-width: 300px;
              display: block;
              margin: 0 auto;
              border-radius: 50%;
            }

            .hero > h1 {
              font-size: 36px;
              font-weight: 700;
              line-height: 1.3em;
              margin: 1em auto;
              text-align: center;
            }

            .rules {
              background-color: black;
              width: 75%;
              height: 300px;
              margin: 0 auto;
              border-radius: 15px;
            }

            .welcome-header {
              display: flex;
              align-items: center;
              margin-top: 2em;
            }

            .intro {
              font-size: 24px;
              font-weight: 300;
              line-height: 1.3em;
            }

            .welcome-header > img {
              max-width: 200px;
              max-height: 200px;
              margin-right: 1.3em;
              border-radius: 50%;
            }
            .inputs {
              margin: 35px auto 45px;
              width: 75%;
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

            .ps {
              margin: 0 auto;
              text-align: center;
            }
          `}</style>
        </div>
      </Layout.MainContent>
    </Layout>
  );
};

export default InvitesPage;

export interface InvitesPageProps {
  realmId?: string;
  realmSlug: string;
  inviteStatus: string;
}

InvitesPage.getInitialProps = async (ctx: NextPageContext) => {
  try {
    if (typeof ctx.query.inviteId !== "string") {
      throw new Error("Invalid invite URL");
    }
    const nonce = ctx.query.inviteId;
    log(`Fetching status for invite with nonce: ${nonce}`);
    const invite = await getInviteStatusByNonce({
      realmId: "placeholderId",
      nonce,
    });
    if (!invite) {
      throw new Error("An error occured while finding invite");
    }
    const urlRealmSlug = getCurrentRealmSlug({
      serverHostname: ctx.req?.headers.host,
    });
    if (urlRealmSlug !== invite.realmSlug) {
      ctx.res?.writeHead(302, {
        location: `http://${invite.realmSlug}.boba.social/invites/${nonce}`,
      });
      ctx.res?.end();
      return invite;
    }
    return invite;
  } catch (e) {
    error(e);
    const urlRealmSlug = getCurrentRealmSlug({
      serverHostname: ctx.req?.headers.host,
    });
    return { realmSlug: urlRealmSlug, inviteStatus: e };
  }
};
