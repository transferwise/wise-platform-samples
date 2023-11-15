# Strong Customer Authentication (SCA) Sample 

Strong Customer Authentication (SCA) is a European regulatory requirement as part of the second Payment Services Directive (PSD2) for authenticating online payments and make them more secure.

There are some actions such as funding a transfer from your multi-currency account or viewing the statement that require SCA within the UK and EEA. SCA builds additional authentication by asking two of the following three elements: something the customer **knows**, something the customer **has** and something the customer **is**. If you don't integrate with it and make a request to an SCA protected endpoint, your request will be rejected.

In this sample we're creating a dummy transfer and attempt to fund it using money on Wise account.
We offer a [library](https://www.npmjs.com/package/@transferwise/approve-api-action-helpers) to make your integration easier.

More info on our [API docs](https://docs.wise.com/api-docs/features/strong-customer-authentication-2fa/auth-code-sca).

## Key elements

We're using [Next.js](https://nextjs.org/), because it allows us to show server and client side code in a single app.

Start off by exploring `/pages/index.tsx`.

## Running it locally

Prerequisite: make sure you have [Node.js](https://nodejs.org/en) installed.
- `npm install` (installs all the packages)
- `npm run dev` (starts the app at http://localhost:3000/)

## Recording

https://github.com/transferwise/wise-platform-samples/assets/39053304/6ab12735-745b-4d57-a8a4-36258200153e

## Sequence diagram

![sca_with_helper_library](https://github.com/transferwise/wise-platform-samples/assets/39053304/da30ea45-a236-46ff-852d-06024c189c62)

For more details have a look at our [Auth Code SCA
](https://docs.wise.com/api-docs/features/strong-customer-authentication-2fa/auth-code-sca) documentation.
