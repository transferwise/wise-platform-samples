const MESSAGE_SUCCESS = 'wise-oauth-success';

// Opens Wise OAuth page in a popup window. Wrapped with a Promise so it would be easy to consume.
// After user "gives access", they get redirected (within popup) back to /pages/wise-redirect.tsx.
// This handler listens for a broadcasted "success" event (emitted by /pages/wise-redirect.tsx)
// and then closes the popup and marks the promise as resolved.
export function popupFlow(url: string) {
  return new Promise((resolve) => {
    openPopup(url, resolve);
  });
}

function openPopup(url: string, resolve: (value?: unknown) => void) {
  // Opens the page in popup window
  const page = window.open(
    url,
    'wise-oauth-connect-page',
    `resizable,scrollbars,status,location,width=580,height=800,top=200,left=500` // not calculating screen center to keep it simple
  );

  const handleEvents = (event: MessageEvent) => {
    if (event.data === MESSAGE_SUCCESS) {
      closePopup();
      resolve();
    }
  };

  const closePopup = () => {
    page?.close();
    window.removeEventListener('message', handleEvents);
  };

  // Start listening for events emitted by the page inside popup (eventually /pages/wise-redirect.tsx)
  window.addEventListener('message', handleEvents);
}
