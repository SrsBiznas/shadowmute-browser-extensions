/* global __RUNTIME__ */

const createMailbox = document.getElementById('generate-mailbox');
const logOut = document.getElementById('log-out');

const signIn = document.getElementById('sign-in');

const NORMAL = 1;
const GENERATING = 2;

const changeLoggedInState = (state) => {
  const spinnerPane = document.getElementById('spinner-pane');
  const generateMailboxButton = document.getElementById('generate-mailbox');

  switch (state) {
    case NORMAL:
      spinnerPane.classList.add('invisible');
      generateMailboxButton.classList.remove('invisible');
      break;
    case GENERATING:
      spinnerPane.classList.remove('invisible');
      generateMailboxButton.classList.add('invisible');
      break;
    default:
      break;
  }
};

const init = () => {
  __RUNTIME__.storage.local.get(['bearer_token'], (data) => {
    const bearerToken = data.bearer_token;
    const generatingMailbox = false;

    const loggedInPane = document.getElementById('logged-in');
    const loggedOutPane = document.getElementById('logged-out');

    if (bearerToken) {
      loggedInPane.classList.remove('invisible');
      loggedOutPane.classList.add('invisible');

      if (generatingMailbox) {
        changeLoggedInState(GENERATING);
      } else {
        changeLoggedInState(NORMAL);
      }
    } else {
      loggedInPane.classList.add('invisible');
      loggedOutPane.classList.remove('invisible');
    }
  });

  __RUNTIME__.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    __RUNTIME__.tabs.executeScript(
      tabs[0].id,
      {
        file: 'active_tab/popup_init.js',
      },
    );
  });
};

init();

createMailbox.onclick = () => {
  changeLoggedInState(GENERATING);

  __RUNTIME__.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    __RUNTIME__.tabs.executeScript(
      tabs[0].id,
      {
        file: 'active_tab/email_popper.js',
      },
    );
  });
};

logOut.onclick = () => {
  __RUNTIME__.storage.local.remove('bearer_token', () => {
    init();
  });
};

signIn.onclick = () => {
  __RUNTIME__.runtime.sendMessage({
    target: 'bg',
    event: 'sign_in',
  });
};

__RUNTIME__.runtime.onMessage.addListener(
  (message) => {
    if (message.target === 'p') {
      if (message.event === 'close_popup') {
        window.close();
      } else if (message.event === 'mailbox_rcvd') {
        const d = window.document;

        const { mailbox } = message;
        if (mailbox) {
          changeLoggedInState(NORMAL);

          const generateContainer = d.getElementById('generate-mailbox');
          generateContainer.removeChild(d.getElementById('create-mailbox'));

          const copyMailboxToClipboard = document.createElement('button');
          copyMailboxToClipboard.setAttribute('name', 'copyMailboxToClipboard');
          copyMailboxToClipboard.setAttribute('value', 'CopyMailboxToClipboard');
          copyMailboxToClipboard.innerHTML = 'Copy mailbox to Clipboard';
          copyMailboxToClipboard.className = 'button';
          copyMailboxToClipboard.onclick = () => {
            navigator.clipboard
              .writeText(mailbox)
              .then(() => {
                // eslint-disable-next-line no-alert
                alert(`Copied ${mailbox} to clipboard`);
              });
          };

          generateContainer.appendChild(copyMailboxToClipboard);
        }
      }
    }
  },
);
