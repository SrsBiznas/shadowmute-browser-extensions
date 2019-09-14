/* global __RUNTIME__ */

/*
 * This script is executed in the context of the ActiveTab
 * during the Pop-up initialization. Convenient for loading
 * dynamic data that requires knowledge of the current
 * location
 */
__RUNTIME__.runtime.sendMessage({
  target: 'bg',
  event: 'active_mailbox',
  location: window.location.host,
}, (response) => {
  const { mailbox } = response;

  __RUNTIME__.runtime.sendMessage({
    target: 'p',
    event: 'mailbox_rcvd',
    mailbox,
  });
});
