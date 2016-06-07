var React = require('react');
var ReactDOM = require('react-dom');
var urlUtility = require('url');
var ConfigureApp = React.createFactory(require('remote-pay-cloud-connector-configuration-react'));

var currentWindowUrl = urlUtility.parse(window.location.href, true);
//
var clientId = currentWindowUrl.query['clientId'] ? currentWindowUrl.query['clientId'] : "V1T1VKQC8Y65Y";
var friendlyId = currentWindowUrl.query['friendlyId'] ? currentWindowUrl.query['friendlyId'] : "Test " + Math.floor(Math.random() * 1000000);

var appElement = document.getElementById('mikes_container');

ReactDOM.render(
  <ConfigureApp
    clientId={clientId}             // the Clover app id
    friendlyId={friendlyId}         // the identification used when connecting to the device, and when persisting configuration
    serverUrl="./data/servers.json" // used to load available clover servers
    configUrl="./configuration/"    // used to load/save a selected configuration
  />,
  appElement);