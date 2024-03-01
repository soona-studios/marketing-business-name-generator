# Business Name Generator

this is the code for our [business name generator](https://soona.co/business-name-generator). it uses the 'Business Name Generator #2' Spell on [Respell](https://app.respell.ai/spells), which takes in a brand description and outputs nine (9) business name ideas. it is deployed via CDN in [Webflow](https://soona-new.design.webflow.com/).

to test locally:

- open `live_page_test.html` in your browser
- make sure the correct `baseUrl` is set in `main_test.js`
- NOTE: `live_page_test.html` is missing error handling & loading states

also included is a local command line setup. this is commented out at the bottom of `main_test.js`. in order to use this:

- in `main_test.js`, comment out all code above `// FOR TERMINAL TESTING`
- in `main_test.js`, 'uncomment' out all code below `// FOR TERMINAL TESTING`
- adjust `const description` as needed
- type `node main_test.js` in your Terminal

## Tentative Code Review Process for soona.co Microapps

- create a PRIVATE repository prefaced with `marketing-`
- code reviewer will look through code & commit history to make sure no important secrets or API keys have been accidentally committed
- once verifying there are no API keys in the commit history, code reviewer makes repo public
- notify person who posted the PR
- person who posted the PR adds the CDN to the Webflow page (likely a staging page or a branch of the 'real' page)
- person who posted the PR sends URL to code reviewer so they can test functionality
