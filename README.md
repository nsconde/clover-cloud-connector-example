# Clover Cloud Connector Example

<!--
for when the repo goes public
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
-->

## Deployment

### Deploy immediately on Heroku

In order to deploy this to Heroku, you will need to have an account on Heroku.  You can sign up for a free account to 
test this if you do not have one.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/clover/clover-cloud-connector-example)

### Clone and run locally

You can clone the repository and run it locally.  Once you have cloned it, just run

    npm install
    
Then     
    
    npm start
    
This will start a local server that can be reached at http://localhost:3000.  _To test with this local copy, you must use
a different client id_.  This can be done by appending the client id to the URL - for example:

    http://localhost:3000?clientId=5VB5EJFS79PRJ
    
You must create a web application on the appropriate Clover server and use that client id.

#### Create a Clover Application

1.  [Create a Clover developer account](https://docs.clover.com/build/#first-create-your-developer-account) if you do not already have one.
2.  After claiming your account, [create a web app](https://docs.clover.com/build/web-apps/#step-1-create-your-clover-web-app) on your developer dashboard. Make sure to expand the "Web App" 'App Type' section and enter the Site URL and [CORS domain](https://docs.clover.com/build/web-apps/cors/) of your app.

## Referenced Repositories

This example show usage of the [Javascript Cloud Connector](https://github.com/clover/remote-pay-cloud-npm), and the 
example [React Component to configure access to a device](https://github.com/clover/remote-pay-cloud-connector-configuration-react)