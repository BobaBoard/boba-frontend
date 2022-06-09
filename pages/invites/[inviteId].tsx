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
import { RulesBlock as RulesBlockType } from "types/Types";
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
  requiresEmail,
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
    (block): block is RulesBlockType => block.type === "rules"
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
          <div className="invite-signup"></div>
          <div className="hero">
            <h1>
              <div className="subtitle">Youʼve been invited to join</div>{" "}
              <img src={realmIcon} />
              {realmName}
            </h1>
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
                </div>
              </div>
              <div className="login-card">
                <span className="title">Already have a BobaBoard account?</span>
                <div className="login-button">
                  <Button onClick={openLoginModal} theme={ButtonStyle.DARK}>
                    Login
                  </Button>
                </div>
              </div>
              <div className="or">or</div>
              <div
                className={classnames("form signup-card", {
                  pending: isUserPending,
                })}
              >
                <div className="title">Create a new account</div>
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
                    {requiresEmail && (
                      <p className="helper-text">
                        In order to protect your precious invite, it's been
                        betrothed to your precious email. Make sure what you
                        enter matches what was given.
                      </p>
                    )}
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
                <div className={classnames("error", { hidden: !error })}>
                  {error || "Hidden error field!"}
                </div>
                <div className="reminder">
                  <p className="title">Reminder</p>
                  <p>
                    Keeping BobaBoard a safe and respectful community is
                    everyone's job! Especially in these early stages, you have
                    real power to influence the developing culture on this
                    platform. Be as nasty as your heart desires towards
                    fictional characters, but excellent to other boobies.
                  </p>
                  <p>
                    Communicate with care, assume good intentions, and remember
                    that leaving a derailing conversation to take a breather can
                    go a long way. Make generous use of the "hide thread"
                    button, and stay tuned for better filtering tools!
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
                <div className="buttons signup-button">
                  <Button
                    disabled={
                      (inviteStatus === "pending" ? false : true) ||
                      isUserPending
                    }
                    onClick={onSubmit}
                    theme={ButtonStyle.DARK}
                  >
                    Join {realmName}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <div className="buttons signup-button">
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
          )}
          <div className="ps">
            <p>
              Not interested in the {realmName} realm?{" "}
              {isLoggedIn ? (
                <a href="https://v0.boba.social">Go back to V0</a>
              ) : (
                <span>
                  No worries, we hope you find a realm that suits in future. In
                  the meantime, you can follow Bobaboard's development on{" "}
                  <a href="https://twitter.com/BobaBoard">Twitter</a>,{" "}
                  <a href="https://bobaboard.tumblr.com/">Tumblr</a>, and{" "}
                  <a href="https://bobaboard.com/">BobaBoard.com</a>!
                </span>
              )}
            </p>
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

            .hero > h1 {
              font-size: 36px;
              font-weight: 700;
              line-height: 1.3em;
              margin-top: 4rem;
              margin-bottom: 0;
              text-align: center;
            }
            .hero > h1 .subtitle {
              font-size: 24px;
              font-weight: 400;
              line-height: 30px;
            }
            .hero > h1 img {
              width: 100%;
              max-width: 140px;
              display: block;
              margin: 0 auto;
              border-radius: 50%;
            }
            .rules {
              max-width: 700px;
              margin: 8rem auto 0 auto;
            }
            .welcome-header {
              display: flex;
              align-items: center;
              gap: 21px;
              max-width: 940px;
              margin: 6rem auto 0 auto;
            }
            .intro-wrapper {
              border: 1px solid white;
              padding: 30px;
              border-radius: 30px;
            }
            .intro {
              font-size: 24px;
              font-weight: 300;
              line-height: 1.3em;
              margin: 0;
            }
            .intro + .intro {
              margin-top: 2rem;
            }
            .welcome-header > img {
              max-width: 200px;
              max-height: 200px;
              border-radius: 50%;
            }
            .login-card,
            .signup-card {
              background-color: rgb(36, 36, 36);
              border-radius: 24px;
              padding: 20px;
              max-width: 700px;
              margin: 6rem auto 0 auto;
            }
            .login-card {
              display: flex;
              gap: 2rem;
              justify-content: space-between;
              align-items: center;
            }
            .login-card > .title,
            .signup-card > .title {
              font-size: 2.2rem;
              line-height: 3rem;
            }

            .or {
              text-transform: uppercase;
              margin: 3rem auto;
              text-align: center;
            }
            .signup-card {
              margin-top: 0;
              padding-bottom: 4rem;
            }
            .signup-card > .title {
              margin-top: 0.5rem;
            }

            .inputs {
              margin-top: 3rem;
              display: flex;
              gap: 2rem;
            }

            .inputs > div {
              flex: 1;
            }
            .inputs > div + div {
            }

            .login-button {
              display: flex;
              align-items: center;
            }
            .login-button :global(div.button),
            .signup-button :global(div.button) {
              font-size: 2rem !important;
            }
            .login-button :global(button),
            .signup-button :global(button) {
              padding: 1rem 1.8rem !important;
            }

            .helper-text {
              font-size: 14px;
              color: rgb(190, 190, 190);
              margin: 1rem 0 0 0;
            }
            .buttons {
              display: flex;
              justify-content: center;
              margin-top: 4rem;
            }
            .error {
              color: red;
              margin-top: 10px;
              margin-left: 20px;
              font-size: small;
              display: block;
            }
            .error.hidden {
              display: none;
            }
            .reminder {
              margin-top: 3rem;
            }

            .reminder > .title {
              font-weight: bold;
            }
            .ps {
              margin: 8rem auto;
              text-align: center;
            }
            @media (max-width: 720px) {
              .welcome-header {
                flex-direction: column;
              }

              .inputs {
                flex-direction: column;
              }
            }

            @media (max-width: 460px) {
              .intro-wrapper {
                padding: 20px;
              }
              .intro {
                font-size: 20px;
              }

              .login-card {
                flex-direction: column;
              }

              .signup-card {
                padding-bottom: 20px;
              }
              .login-button,
              .login-button :global(div.button),
              .login-button :global(button),
              .signup-button :global(div.button),
              .signup-button :global(button) {
                width: 100% !important;
                justify-content: center;
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
  requiresEmail: boolean;
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
      ctx.res?.writeHead(302, {
        location: `http://${urlRealmSlug}_boba.local:3000/404`,
      });
      ctx.res?.end();
      throw new Error("Invalid invite URL");
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
    return {
      realmSlug: urlRealmSlug,
      inviteStatus: `${e.name}: ${e.message}`,
      requiresEmail: false,
    };
  }
};
