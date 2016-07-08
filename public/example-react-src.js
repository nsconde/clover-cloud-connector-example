var React = require('react');
var ReactDOM = require('react-dom');
var urlUtility = require('url');
var ConfigureApp = React.createFactory(require('remote-pay-cloud-connector-configuration-react'));

var ManualTransactionApp = React.createFactory(require('./clover-sale-react-src.js'));
// var KeyHandlerExample = React.createFactory(require('./keyhandler-example.js'));

var currentWindowUrl = urlUtility.parse(window.location.href, true);

// If the clientId is not specified on the url, it will default to the heroku app.
var clientId = currentWindowUrl.query['clientId'] ? currentWindowUrl.query['clientId'] : "V1T1VKQC8Y65Y";
var friendlyId = currentWindowUrl.query['friendlyId'] ? currentWindowUrl.query['friendlyId'] : "Test " + Math.floor(Math.random() * 1000000);

var appElement = document.getElementById('mikes_container');

var ConfiguredSaleApp = React.createClass({
    displayName: "ConfiguredSaleApp",

    getInitialState: function () {
        return {
            cloverConnector: null
        }
    },

    setCloverInstance: function(cloverConnector) {
        this.setState({cloverConnector: cloverConnector})
    },

    render: function render() {
        return (
          <div>
              <ConfigureApp
                clientId={this.props.clientId}             // the Clover app id
                friendlyId={this.props.friendlyId}         // the identification used when connecting to the device, and when persisting configuration
                serverUrl={this.props.serverUrl} // used to load available clover servers
                configUrl={this.props.configUrl}    // used to load/save a selected configuration
                onDeviceVerified={this.setCloverInstance}
              />
              <ManualTransactionApp taxRate={this.props.taxRate} cloverConnector={this.state.cloverConnector}/>
          </div>
        );
    }
});

ReactDOM.render(
  <ConfiguredSaleApp
    clientId={clientId}             // the Clover app id
    friendlyId={friendlyId}         // the identification used when connecting to the device, and when persisting configuration
    serverUrl="./data/servers.json" // used to load available clover servers
    configUrl="./configuration/"    // used to load/save a selected configuration
    taxRate={0.11}
  />,
  appElement);