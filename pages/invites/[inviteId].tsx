import {
  Button,
  ButtonStyle,
  Input,
  InputStyle,
  RulesBlock,
  toast,
} from "@bobaboard/ui-components";
import { NextPage, NextPageContext } from "next";
import React, { useEffect } from "react";
import { getCurrentRealmSlug, isLocalhost } from "utils/location-utils";
import { getInviteStatusByNonce, getRealmData } from "utils/queries/realm";
import {
  useRealmHomepage,
  useRealmIcon,
  useRealmId,
  useRealmPermissions,
} from "contexts/RealmContext";

import Layout from "components/layout/Layout";
import LoginModal from "components/LoginModal";
import { acceptInvite } from "utils/queries/user";
import classnames from "classnames";
import debug from "debug";
import { getRealmNameFromSlug } from "utils/text-utils";
import { useAuth } from "components/Auth";
import { useMutation } from "react-query";
import { useRouter } from "next/router";

const log = debug("bobafrontend:invites-log");
const error = debug("bobafrontend:invites-error");

const InvitesPage: NextPage<InvitesPageProps> = ({
  realmSlug,
  realmId,
  inviteStatus,
}) => {
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
  const {
    isPending: isUserPending,
    isLoggedIn,
    attemptLogin,
    authError,
  } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const openLoginModal = React.useCallback(() => {
    setLoginOpen(!isUserPending);
  }, [isUserPending]);
  const router = useRouter();
  const realmName = getRealmNameFromSlug(realmSlug);
  const clientRealmId = useRealmId();
  const realmHomepage = useRealmHomepage();
  const realmIcon = useRealmIcon();
  const rulesBlock = realmHomepage.blocks.find(
    (block) => block.type === "rules"
  );

  const [showAllRules, setShowAllRules] = React.useState(false);

  // This assumes that only realm members will have realm permissions.
  // If that changes this can be changed to specifically check for whatever we call the permission
  // that members will get to allow them to post and etc on the realm.
  const alreadyRealmMember = !!useRealmPermissions().length;

  const { mutate: updateData } = useMutation(
    (data: {
      password: string;
      email: string;
      realmId: string;
      nonce: string;
    }) => acceptInvite(data),
    {
      onSuccess: async () => {
        if (!isLoggedIn && !isUserPending) {
          await attemptLogin!(email, password);
        }
        router.push("/").then(() => window.scrollTo(0, 0));
        // log("push redirected to / from success");
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

  const onSubmit = React.useCallback(async () => {
    setError("");
    try {
      if (inviteStatus !== "pending") {
        return;
      }
      if (!isLoggedIn && (email.trim().length == 0 || password.length == 0)) {
        setError("Email and password required.");
        return;
      }
      if (isUserPending) {
        return;
      }
      setLoading(true);
      if (!isLoggedIn) {
        await attemptLogin!(email, password);
      }
      updateData({
        nonce: router.query.inviteId as string,
        email,
        password,
        realmId: realmId ?? clientRealmId,
      });
    } catch (e) {
      log(e);
    }
  }, [
    router,
    email,
    password,
    realmId,
    attemptLogin,
    updateData,
    isLoggedIn,
    clientRealmId,
    inviteStatus,
    isUserPending,
  ]);

  useEffect(() => {
    if (!isUserPending && alreadyRealmMember) {
      toast.success(`You are already a member of ${realmName}`);
      router.push("/").then(() => window.scrollTo(0, 0));
      // log("push redirected to / from alreadyRealmMember check");
    }
  }, [alreadyRealmMember, isUserPending, router, realmName]);

  useEffect(() => {
    // This shows the authError if the user exists but enters the wrong password,
    // but doesn't show an error if the email doesn't belong to an existing account.
    if (
      authError &&
      authError !==
        "There is no user record corresponding to this identifier. The user may have been deleted."
    ) {
      setError(authError);
      console.log(authError);
    }
  }, [authError]);

  return (
    <Layout title={`Invites`}>
      <Layout.MainContent>
        {loginOpen && (
          <LoginModal
            isOpen={loginOpen}
            onCloseModal={() => {
              setLoginOpen(false);
            }}
            color={"#f96680"}
          />
        )}
        <div className="page">
          <div className="invite-signup">
            <div className="hero">
              <img src={realmIcon} />
              <h1>You've been invited to join {realmName}!</h1>
            </div>
            <div className="rules">
              {!!rulesBlock && (
                <RulesBlock
                  seeAllLink={{
                    onClick: () => setShowAllRules(!showAllRules),
                  }}
                  title={rulesBlock.title}
                  rules={
                    showAllRules
                      ? rulesBlock.rules
                      : rulesBlock.rules.filter((rule) => rule.pinned)
                  }
                />
              )}
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
                    <div>
                      Already have a Boba account?{" "}
                      <span className="login-button">
                        <Button
                          onClick={openLoginModal}
                          theme={ButtonStyle.DARK}
                        >
                          Login
                        </Button>
                      </span>
                    </div>
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
                  <a href="https://docs.bobaboard.com/docs/users/intro">
                    Welcome Guide
                  </a>{" "}
                  or ask your questions on the boards!
                </p>
              </div>
            )}
            <div className={classnames("form", { pending: isUserPending })}>
              {!isLoggedIn && (
                <div className="inputs">
                  <div>
                    <Input
                      id={"email"}
                      value={email}
                      label={"Email"}
                      onTextChange={(text: string) => setEmail(text)}
                      onEnter={onSubmit}
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
                      onEnter={onSubmit}
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
                  disabled={
                    (inviteStatus === "pending" ? false : true) ||
                    (!isLoggedIn &&
                      (email.trim().length == 0 || password.length == 0)) ||
                    isUserPending
                  }
                  onClick={onSubmit}
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
                  <a href="https://v0.boba.social">Go back to V0</a>
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
              max-width: 250px;
              display: block;
              margin: 0 auto;
              border-radius: 50%;
            }
            .hero > h1 {
              font-size: 36px;
              font-weight: 700;
              line-height: 1.3em;
              margin: 1.3em auto 1.5em;
              text-align: center;
            }
            .rules {
              width: 75%;
              margin: 0 auto;
            }
            .welcome-header {
              display: flex;
              align-items: center;
              margin-top: 40px;
              margin-bottom: 24px;
              gap: 21px;
            }
            .intro {
              font-size: 24px;
              font-weight: 300;
              line-height: 1.3em;
            }
            .welcome-header > img {
              max-width: 200px;
              max-height: 200px;
              border-radius: 50%;
            }
            .form {
              margin: 0 auto 45px;
              width: 75%;
            }
            .inputs > div:first-child {
              margin-bottom: 5px;
              margin-top: 35px;
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
            @media (max-width: 720px) {
              .welcome-header {
                flex-direction: column;
              }
              .form,
              .rules {
                width: 100%;
              }
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
    const urlRealmSlug = getCurrentRealmSlug({
      serverHostname: ctx.req?.headers.host,
    });
    const urlRealmId = (await getRealmData({ realmSlug: urlRealmSlug })).id;
    log(`Fetching status for invite with nonce: ${nonce}`);
    const invite = await getInviteStatusByNonce({
      realmId: urlRealmId ?? "placeholderId",
      nonce,
    });
    if (!invite) {
      throw new Error("An error occurred while finding invite");
    }
    if (urlRealmSlug !== invite.realmSlug) {
      log(
        `URL Realm does not match invite Realm. Rerouting to to invite realm ${invite.realmSlug}`
      );
      if (isLocalhost(ctx.req?.headers.host)) {
        ctx.res?.writeHead(302, {
          location: `http://${invite.realmSlug}_boba.local:3000/invites/${nonce}`,
        });
        ctx.res?.end();
      } else {
        ctx.res?.writeHead(302, {
          location: `https://${invite.realmSlug}.boba.social/invites/${nonce}`,
        });
        ctx.res?.end();
      }
      return invite;
    }
    return invite;
  } catch (e) {
    error(e);
    const urlRealmSlug = getCurrentRealmSlug({
      serverHostname: ctx.req?.headers.host,
    });
    return { realmSlug: urlRealmSlug, inviteStatus: `${e.name}: ${e.message}` };
  }
};
