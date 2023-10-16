# OAuth Connect Popup Sample 

In our regular authorization flow your application redirects the customer to the Wise authorization page. With some additional steps it can be implemented inside a popup window, meaning that the user does not leave your app.

On a high level you'll only need to do two changes:
- open the Wise authorization page in a popup window instead of a full redirect
- build a mechanism that understands when the flow is complete

See sequence diagram below for more details.

More info about [Authentication and access](https://docs.wise.com/api-docs/features/authentication-access) and [Authorization flow in a Popup Window](https://docs.wise.com/api-docs/guides/oauth-popup).

## Key elements

We're using [Next.js](https://nextjs.org/), because it allows us to show server and client side code in a single app.

Start off by exploring `/pages/index.tsx`.

## Running it locally

Prerequisite: make sure you have [Node.js](https://nodejs.org/en) installed.
- `npm install` (installs all the packages)
- `npm run dev` (starts the app at http://localhost:3000/)

## Recording

https://github.com/transferwise/wise-platform-samples/assets/39053304/b9b8c4a8-7e42-4b4b-99b0-204ebfe91ec2

## Sequence diagram

![oauth-consent-popup](https://github.com/transferwise/wise-platform-samples/assets/39053304/ffee4fd7-7d1b-46a4-97ea-b67fcaf54b94)

For more details have a look at our [Authorization flow in a Popup Window](https://docs.wise.com/api-docs/guides/oauth-popup) guide.

