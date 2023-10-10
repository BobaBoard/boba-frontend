export const operations = {"getBoardsByExternalId":{"path":"/boards/:board_id","method":"get"},"createThread":{"path":"/boards/:board_id","method":"post"},"patchBoardsByExternalId":{"path":"/boards/:board_id","method":"patch"},"visitBoardsByExternalId":{"path":"/boards/:board_id/visits","method":"get"},"muteBoardsByExternalId":{"path":"/boards/:board_id/mute","method":"post"},"unmuteBoardsByExternalId":{"path":"/boards/:board_id/mute","method":"delete"},"pinBoardsByExternalId":{"path":"/boards/:board_id/pin","method":"post"},"unpinBoardsByExternalId":{"path":"/boards/:board_id/pin","method":"delete"},"dismissBoardsByExternalId":{"path":"/boards/:board_id/notifications","method":"delete"},"getRealmActivity":{"path":"/feeds/realms/:realm_id","method":"get"},"getBoardsFeedByExternalId":{"path":"/feeds/boards/:board_id","method":"get"},"getUserFeed":{"path":"/feeds/users/@me","method":"get"},"getUserStarFeed":{"path":"/feeds/users/@me/stars","method":"get"},"postContribution":{"path":"/posts/:post_id/contributions","method":"post"},"editContribution":{"path":"/posts/:post_id/contributions","method":"patch"},"postComment":{"path":"/posts/:post_id/comments","method":"post"},"getRealmsBySlug":{"path":"/realms/slug/:realm_slug","method":"get"},"getRealmsActivityByExternalId":{"path":"/realms/:realm_id/activity","method":"get"},"getCurrentUserNotifications":{"path":"/realms/:realm_id/notifications","method":"get"},"dismissUserNotifications":{"path":"/realms/:realm_id/notifications","method":"delete"},"getInvitesByRealmId":{"path":"/realms/:realm_id/invites","method":"get"},"createInviteByRealmId":{"path":"/realms/:realm_id/invites","method":"post"},"getInviteByNonce":{"path":"/realms/:realm_id/invites/:nonce","method":"get"},"acceptInviteByNonce":{"path":"/realms/:realm_id/invites/:nonce","method":"post"},"getSubscription":{"path":"/subscriptions/:subscription_id","method":"get"},"getThreadByExternalId":{"path":"/threads/:thread_id","method":"get"},"updateThreadExternalId":{"path":"/threads/:thread_id","method":"patch"},"muteThreadByExternalId":{"path":"/threads/:thread_id/mute","method":"post"},"unmuteThreadByExternalId":{"path":"/threads/:thread_id/mute","method":"delete"},"hideThreadByExternalId":{"path":"/threads/:thread_id/hide","method":"post"},"unhideThreadByExternalId":{"path":"/threads/:thread_id/hide","method":"delete"},"visitThreadByExternalId":{"path":"/threads/:thread_id/visits","method":"post"},"starThreadByExternalId":{"path":"/threads/:thread_id/stars","method":"post"},"unstarThreadByExternalId":{"path":"/threads/:thread_id/stars","method":"delete"},"getCurrentUser":{"path":"/users/@me","method":"get"},"updateCurrentUser":{"path":"/users/@me","method":"patch"},"getCurrentUserPinnedBoardsForRealm":{"path":"/users/@me/pins/realms/:realm_id","method":"get"},"getCurrentUserBobadex":{"path":"/users/@me/bobadex","method":"get"},"getUserSettings":{"path":"/users/@me/settings","method":"get"},"updateUserSettings":{"path":"/users/@me/settings","method":"patch"}} as const;