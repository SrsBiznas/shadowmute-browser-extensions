/* global __RUNTIME__, constants, signIn */

__RUNTIME__.runtime.onInstalled.addListener(() => {
  // Init
  const newURL = 'welcome.html';
  __RUNTIME__.tabs.create({ url: newURL });
});

const withAccessToken = (block) => {
  __RUNTIME__.storage.local.get(['bearer_token'], (data) => {
    const bearerToken = data.bearer_token;

    if (bearerToken) {
      block(bearerToken);
    }
  });
};

const recentMailboxes = {};

const generateMailbox = (sendResponse, sender, targetSite) => withAccessToken((token) => {
  fetch(`${constants.apiServer}/v1/mailbox`, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location: targetSite }),
  })
    .then((response) => response.json())
    .then((jsonBody) => {
      const { mailbox } = jsonBody;

      recentMailboxes[targetSite] = mailbox;

      // setting badgeText
      // __RUNTIME__.browserAction.setBadgeText({
      //   text: '@',
      //   tabId: sender.tab.id,
      // });
      sendResponse(jsonBody);
    });
});

__RUNTIME__.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.target === 'bg') {
      if (sender.tab && request.event === 'generate_mailbox') {
        generateMailbox(sendResponse, sender, request.location);

        // Expect an async result
        return true;
      }

      if (request.event === 'save_token') {
        const { payload } = request;
        __RUNTIME__.storage.local.set({
          bearer_token: payload,
        });
      } else if (request.event === 'sign_in') {
        signIn();
      } else if (request.event === 'active_mailbox') {
        sendResponse({
          mailbox: recentMailboxes[request.location],
        });
      }
    } else {
      // ignore
    }
    return false;
  },
);
