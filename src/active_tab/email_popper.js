/* global __RUNTIME__ */

__RUNTIME__.runtime.sendMessage(
  {
    target: 'bg',
    event: 'generate_mailbox',
    location: window.location.host,
  }, (response) => {
    if (response && response.mailbox) {
      const { mailbox } = response;

      const allIns = document.getElementsByTagName('input');

      // push this up to UI
      __RUNTIME__.runtime.sendMessage(
        {
          target: 'p',
          event: 'mailbox_rcvd',
          mailbox,
        },
      );

      const emails = Array
        .from(allIns)
        .filter((input) => {
          const ariaLabel = input.getAttribute('aria-label');
          return (
            input.type === 'email'
            || (ariaLabel && ariaLabel.includes('email'))
            || input.id === 'signup-form_details_login'
            || input.placeholder.toLowerCase() === 'email'
            || input.name.toLowerCase() === 'email'
            || input.id === 'user_email'
          );
        });

      if (emails.length === 0) {
        // Try to find based on name
        if (allIns.email) {
          allIns.email.value = mailbox;
        }
      } else {
        emails.forEach((emailInput) => {
          // eslint-disable-next-line no-param-reassign
          emailInput.value = mailbox;
        });
      }

      // __RUNTIME__.runtime.sendMessage({
      //   target: 'p',
      //   event: 'close_popup',
      // });
    } else {
      console.log('[!] Missing response');
    }
  },
);
