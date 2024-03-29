# Business Name Generator

this is the code for our [business name generator](https://soona.co/business-name-generator). it uses the 'Business Name Generator #2' Spell on [Respell](https://app.respell.ai/spells), which takes in a brand description and outputs nine (9) business name ideas. it is deployed via CDN in [Webflow](https://soona-new.design.webflow.com/). when making changes to a Webflow page that uses the CDN we can purge the cache [here](https://www.jsdelivr.com/tools/purge). note that purging the cache doesn't always appear to work, and there's a limit to how many times you can attempt to purge it.

## To Test Locally

- in the main `book-soona` codebase, add the following to `cors.rb`

```ruby
    allow do
      origins '*'
      resource '*',
        headers: :any,
        methods: [:connect, :delete, :get, :head, :options, :patch, :post, :put]
    end
```

- in the main `book-soona` codebase, run `foreman start`
- in a ternimal anywhere, start your `soona-NAME.ngrok.io`
- in this marketing repository codebase, update `baseUrl` in `main_test.js` to your `ngrok`
- in this marketing repository codebase, open `live_page_test.html` in your browser
- NOTE: `live_page_test.html` is missing error handling & loading states

also included is a local command line setup. this is commented out at the bottom of `main_test.js`. in order to use this:

- in `main_test.js`, comment out all code above `// FOR TERMINAL TESTING`
- in `main_test.js`, 'uncomment' out all code below `// FOR TERMINAL TESTING`
- adjust `const description` as needed
- type `node main_test.js` in your Terminal

## Tentative Code Review Process for soona.co Microapps

- person posting the PR has created a PRIVATE repository prefaced with `marketing-`
- code reviewer will look through code & commit history to make sure no important secrets or API keys have been accidentally committed
- once verifying there are no API keys in the commit history, code reviewer makes repo PUBLIC
- notify person who posted the PR
- person who posted the PR adds the CDN to the Webflow page (likely a staging page or a branch of the 'real' page)
- person who posted the PR sends URL to code reviewer so they can test functionality
