![Clover logo](https://www.clover.com/assets/images/public-site/press/clover_primary_gray_rgb.png)

# Clover Cloud Connector Example

This example POS shows how to use the [Javascript Cloud Connector](https://github.com/clover/remote-pay-cloud-npm) to connect to a device, and the 
[example React Component](https://github.com/clover/remote-pay-cloud-connector-configuration-react) to configure access to a device.


## Deployment

### Deploy immediately on Heroku

To deploy this to Heroku, you'll need a Heroku account.  If you don't have one, you can sign up for free.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/clover/clover-cloud-connector-example)

### Clone and run locally

To run the app locally:

1. Clone the repository
2. Run npm install
3. Run npm start  
    
This will start a local server you can reach at http://localhost:3000. To test with this local copy, you must use
a different client ID. Append the client ID to the URL, as shown below:

    http://localhost:3000?clientId=5VB5EJFS79PRJ
    
![Screenshot of Example POS](/images/browser-example-pos.png)

You must create a web application on the appropriate Clover server and use the same client ID.

#### Create a Clover Application

1.  [Create a Clover developer account](https://docs.clover.com/build/#first-create-your-developer-account) if you don't already have one.
2.  [Create a web app](https://docs.clover.com/build/web-apps/#step-1-create-your-clover-web-app) on your developer dashboard. Make sure to expand the "Web App" 'App Type' section and enter the Site URL and [CORS domain](https://docs.clover.com/build/web-apps/cors/) of your app.

