var React = require('react');
var ReactDOM = require('react-dom');
var urlUtility = require('url');
var $ = require('jquery');

// This is the reusable component that can be used to configure a ICloverConnector instance
var ConfigureApp = React.createFactory(require('remote-pay-cloud-connector-configuration-react'));

// The example payment application in this repository
var ManualTransactionApp = React.createFactory(require('./clover-sale-react-src.js'));

// Use the window URL to get an optional custom clientId (this will affect authorization), and
// a friendly id to use when talking to the device.  If left unspecified, the clientId defaults
// to the application on the https://dev1.dev.clover.com environment named 'Clover Cloud Connector Example - Heroku'.
// This allows the deployment of this application using the automated github-heroku integration.
var currentWindowUrl = urlUtility.parse(window.location.href, true);

// If the clientId is not specified on the url, it will default to the heroku app.
var clientId = currentWindowUrl.query['clientId'] ? currentWindowUrl.query['clientId'] : "V1T1VKQC8Y65Y";
// If the friendlyId is not specified on the url, it will default to a generated string.
// This IS NOT the client id above!!!!  This represents the individual physical POS station.  For most implementations
// it would be logical to make this a value like "Front Register", "Bar register", "Mobile unit 1", etc.
var friendlyId = currentWindowUrl.query['friendlyId'] ? currentWindowUrl.query['friendlyId'] : "Client " + Math.floor(Math.random() * 1000000);

// This gets the html element from the webpage to render onto.
var appElement = document.getElementById('clover_manualtransaction_container');

/**
 * The Example application.  Ties the component that configures the connection to the
 * Clover device to the ManualTransactionApp, which uses the ICloverConnector.
 */
var ConfiguredManualTransactionApp = React.createClass({
    displayName: "ConfiguredManualTransactionApp",

    /**
     * Effectively the constructor.
     * @returns {{cloverConnector: null}}
     */
    getInitialState: function () {
        // Close the connection cleanly on exit.  This should be done with all connectors.
        $(window).on('beforeunload ', this.disposeOfResources);
        return {
            cloverConnector: null
        }
    },

    disposeOfResources: function() {
        try {
            if(this.state.cloverConnector) {
                this.state.cloverConnector.dispose();
            }
        } catch (e) {
            console.log(e);
        }
    },

    /**
     *
     * @param {ICloverConnector} cloverConnector
     */
    setCloverInstance: function(cloverConnector) {
        this.setState({cloverConnector: cloverConnector})
    },

    /**
     *
     * @param {ConfigureApp} configureApp
     */
    startConfigurationApp: function(configureApp) {
        this.disposeOfResources();
    },

    render: function render() {
        return (
          <div>
              <ConfigureApp
                clientId={this.props.clientId}      // the Clover app id
                applicationId={this.props.applicationId} // the clover remote application id
                friendlyId={this.props.friendlyId}  // the identification used when connecting to the device, and when persisting configuration
                serverUrl={this.props.serverUrl}    // used to load available clover servers
                configUrl={this.props.configUrl}    // used to load/save a selected configuration
                onDeviceVerified={this.setCloverInstance}
                onOpen={this.startConfigurationApp}

                // Example of customizing the text on the configuration component
                openButtonText="Configure Clover Device"
                connToDeviceEstablished="Connection to device established. Getting merchant configuration information..."
                merchConfigRetrvd="Merchant configuration information retrieved."
                devConnToFrndlyId="Connected to "
                posConnToFrndlyId_1="Displaying connection to "
                posConnToFrndlyId_2=" on device."
                posDevVerifiedCB="Device is configured.  Select 'Continue' to return to the application."
                posCloseDev="Closing device connection."
                posDevDisconnected="Device disconnected."
                verifyCommButton="Verify Device Communication"
                saveConfigButton="Save configuration"
                closeButton="Continue"
                title="Clover Device Configuration"
              />
              <ManualTransactionApp
                taxRate={this.props.taxRate}
                cloverConnector={this.state.cloverConnector}/>
          </div>
        );
    }
});


/**
 * Render the application
 *
 */
ReactDOM.render(
  <ConfiguredManualTransactionApp
    clientId={clientId}             // the Clover app id
    applicationId="com.clover.remotepay.cloud.example.app:0.0.1-beta1"
    friendlyId={friendlyId}         // the identification used when connecting to the device, and when persisting configuration
    serverUrl="./data/servers.json" // used to load available clover servers
    configUrl="./configuration/"    // used to load/save a selected configuration
    taxRate={0.0825}                // Arbitrary tax rate
  />,
  appElement);