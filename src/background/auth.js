/* global __RUNTIME__, constants */

// eslint-disable-next-line no-unused-vars
const signIn = () => {
  const {
    authServer,
    // eslint-disable-next-line camelcase
    clientID: client_id,
    scopes,
  } = constants;

  const scope = scopes.join(' ');

  // eslint-disable-next-line camelcase
  const redirect_uri = __RUNTIME__.identity.getRedirectURL();

  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const state = array[0].toString(16);

  const params = {
    scope,
    redirect_uri,
    response_type: 'token',
    client_id,
    state,
  };

  const paramString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const url = `${authServer}/oidc/authorize?${paramString}`;

  __RUNTIME__.identity.launchWebAuthFlow(
    {
      url,
      interactive: true,
    },
    (redirectUrl) => {
      if (redirectUrl) {
        const found = redirectUrl.match(/access_token=([^&]*)/);

        const accessToken = found && found[1];

        // Validate state
        const foundState = redirectUrl.match(/state=([^&]*)/);
        const redirectState = foundState && foundState[1];

        if (redirectState === state && accessToken) {
          // Validate the access token
          fetch(`${constants.apiServer}/oidc/validate`, {
            headers: {
              Authorization: `Bearer: ${accessToken}`,
            },
          })
            .then((response) => {
              if (response.status === 200) {
                __RUNTIME__.storage.local.set({
                  bearer_token: accessToken,
                }, () => {
                  const newURL = 'welcome.html';
                  __RUNTIME__.tabs.create({ url: newURL });
                });
              }
            });
        }
      }
    },
  );
};
