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