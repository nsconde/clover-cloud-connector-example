var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');
var clover = require("remote-pay-cloud");

require("prototype");

BACKSPACE = 'Backspace';

const customStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};

/**
 * A simple class to transform values
 */
ValueTransformer = Class.create({
    getTransformedValue: function (baseValue) {
        return baseValue;
    }
});

/**
 * Transforms currency into locale specific strings
 *
 * Defaults to "en", USD
 *
 * @type {ValueTransformer}
 */
CurrencyValueTransformer = Class.create(ValueTransformer, {
    /**
     * Initialize the values for this.
     * @private
     */
    initialize: function (configuration) {
        if (!configuration) {
            configuration = {};
        }
        this.locale = configuration.locale ? configuration.locale : "en";
        this.currency_props = configuration.currency_props ? configuration.currency_props : {
            style: "currency",
            currency: "USD"
        };
    },

    /**
     * Formats the value to a locale currency.
     * @param {Number} baseValue - must be an integer
     * @returns {string} the basevalue formatted to a currency
     */
    getTransformedValue: function (baseValue) {
        var formattedAmount = (baseValue / 100).toLocaleString(this.locale, this.currency_props);
        return formattedAmount;
    }
});

/**
 * React visual component used to allow user entry of currency.
 *
 */
var CurrencyInput = React.createClass({
    getDefaultProps: function () {
        return {
            amount: 0,
            amountMax: 9999999,
            amountMin: 0,
            allowedCharacters: "00123456789",
            valueTransformer: new CurrencyValueTransformer()
        }
    },

    getInitialState: function () {
        return {amount: this.props.amount};
    },

    getKey: function(event) {
        var key = null;
        // We are only interested in the numeric keys 0-9 and the backspace key
        if((this.props.allowedCharacters.indexOf(event.key) != -1) || (event.keyCode === 8)) {
            key = {"keyString":event.key, "keyCode": event.keyCode};
        }
        return key;
    },

    handleKeyDown: function (event) {
        // We are only interested in the numeric keys 0-9 and the backspace key
        // var resultString;
        var key = this.getKey(event);
        if (key) {
            event.preventDefault();
            this.keyPressed(key.keyString);
            if (this.props.onKeyDown) {
                this.props.onKeyDown(key.keyString);
            }
        }
    },

    handleKeyUp: function (event) {
        var key = this.getKey(event);
        if (key) {
            event.preventDefault();
            if (this.props.onKeyUp) {
                this.props.onKeyUp(key.keyString);
            }
        }
    },

    keyPressed: function(keyString) {
        var resultString;
        if (keyString === BACKSPACE) { //backspace
            resultString = ("" + this.state.amount).slice(0, -1);
        } else if (this.props.allowedCharacters.indexOf(keyString) != -1) {
            resultString = this.state.amount + keyString;
        }
        try {
            var priceVal = parseInt(resultString.replace(/[^0-9]/g, ''));
            priceVal = this.validateAmount(priceVal);
            if(priceVal !== null) {
                this.setState({amount: priceVal}, function() {
                    this.props.onAmountChanged(this.state.amount);
                });
            }
        } catch (e) {
            console.log("Error setting the amount", e);
        }
    },

    validateAmount: function(amount) {
        if(isNaN(amount)){
            amount = 0;
        } if (amount > this.props.amountMax) {
            amount = null;
        } if (amount < this.props.amountMin) {
            amount = 0;
        }
        return amount;
    },

    render: function () {
        var formattedAmount = this.props.valueTransformer.getTransformedValue(this.state.amount);
        return (
          <div  id="currencyInput"
                tabIndex="1"
                onKeyDown={this.handleKeyDown}
                onKeyUp={this.handleKeyUp}
                >{formattedAmount}</div>
        );
    }
});


/**
 * React visual component used to allow user to click enter numbers, or use the keyboard
 *
 */
var KeyPad = React.createClass({
    displayName: "KeyPad",
    getDefaultProps: function () {
        return {
            allowedCharacters: "0123456789",
            downBackground: "#999999",
            upBackground: "#FFFFFF",
            keyIdPrefix: '#key_'
        }
    },
    keyClick: function(event) {
        if(event.target.attributes.value) {
            this.buttonPressed(event.target.attributes.value.value);
        } else {
            console.log("KeyPad received click from unknown type.  There is no 'value'", event);
        }
    },

    keyDown: function (event) {
        // We are only interested in the numeric keys 0-9 and the backspace key
        var key = this.getKey(event);
        if(key) {
            this.swapBackGround(key.keyId, this.props.downBackground);
            event.preventDefault();
            this.buttonPressed(key.keyString);
        }
    },

    showButtonDown: function(keyString) {
        if(this.isLegalKeyString(keyString)) {
            this.swapBackGround(this.props.keyIdPrefix + keyString, this.props.downBackground);
        }
    },

    showButtonUp: function(keyString) {
        if(this.isLegalKeyString(keyString)) {
            this.swapBackGround(this.props.keyIdPrefix + keyString, this.props.upBackground);
        }
    },

    keyUp: function (event) {
        // We are only interested in the numeric keys 0-9 and the backspace key
        var key = this.getKey(event);
        if(key) {
            this.swapBackGround(key.keyId, this.props.upBackground);
            event.preventDefault();
        }
    },

    isLegalKeyString: function(keyString) {
        if((this.props.allowedCharacters.indexOf(keyString) != -1) || (keyString === BACKSPACE)) {
            return true;
        } else {
            return false;
        }
    },

    getKey: function(event) {
        var key = null;
        // We are only interested in the numeric keys 0-9 and the backspace key
        if((this.props.allowedCharacters.indexOf(event.key) != -1) || (event.keyCode === 8)) {
            key = {"keyString":event.key, "keyCode": event.keyCode};
            if (event.keyCode === 8) { //backspace
                key.keyId = this.props.keyIdPrefix + BACKSPACE;
            } else {
                key.keyId = this.props.keyIdPrefix + event.key;
            }
        }
        return key;
    },

    swapBackGround: function(keyId, color) {
        var parentNode = ReactDOM.findDOMNode(this);
        parentNode.querySelector(keyId).style.backgroundColor = color;
    },

    buttonPressed: function(buttonValue) {
        this.props.onKeyDown(buttonValue);
        // console.log(buttonValue);
    },

    componentDidMount: function(){
        ReactDOM.findDOMNode(this.refs.mainInput).focus();
    },

    handleBlur: function() {
        //ReactDOM.findDOMNode(this.refs.mainInput).focus();
    },

    render: function render() {
        return (
          <div ref="mainInput"
               tabIndex="2"
               //style={{outline: "none"}}
               onKeyDown={this.keyDown}
               onKeyUp={this.keyUp}
               onBlur={this.handleBlur}
          >
              <table id="keypad">
                  <tbody>
                      <tr>
                          <td id="key_1" onClick={this.keyClick} value="1">1</td>
                          <td id="key_2" onClick={this.keyClick} value="2">2</td>
                          <td id="key_3" onClick={this.keyClick} value="3">3</td>
                      </tr>
                      <tr>
                          <td id="key_4" onClick={this.keyClick} value="4">4</td>
                          <td id="key_5" onClick={this.keyClick} value="5">5</td>
                          <td id="key_6" onClick={this.keyClick} value="6">6</td>
                      </tr>
                      <tr>
                          <td id="key_7" onClick={this.keyClick} value="7">7</td>
                          <td id="key_8" onClick={this.keyClick} value="8">8</td>
                          <td id="key_9" onClick={this.keyClick} value="9">9</td>
                      </tr>
                      <tr>
                          <td id="key_00" onClick={this.keyClick} value="00">00</td>
                          <td id="key_0" onClick={this.keyClick} value="0">0</td>
                          <td id="key_Backspace" onClick={this.keyClick} value="Backspace">back</td>
                      </tr>
                  </tbody>
              </table>
          </div>
        );
    }
});

/**
 * React visual component that ties together the display of entry to a keypad.
 *
 */
var TenKey = React.createClass({
    displayName: "TenKey",
    sendKeyDownToKeypad: function(event) {
        this.refs.keyPad.showButtonDown(event);
        //console.log(event);
    },
    sendKeyUpToKeypad: function(event) {
        this.refs.keyPad.showButtonUp(event);
        //console.log(event);
    },
    sendKeyPressToCurrencyInput: function(keyString) {
        this.refs.currencyInput.keyPressed(keyString);
        //console.log(event);
    },
    render: function render() {
        return (
          <div id="tenKey" >
              <CurrencyInput ref="currencyInput"
                             onKeyDown={this.sendKeyDownToKeypad}
                             onKeyUp={this.sendKeyUpToKeypad}
                             onAmountChanged={this.props.onAmountChanged}
              />
              <KeyPad ref="keyPad" onKeyDown={this.sendKeyPressToCurrencyInput}/>
          </div>
        );
    }
});

/**
 * React visual component used for text entry.
 */
var TextEntry = React.createClass({
    displayName: "TextEntry",
    getDefaultProps: function () {
        return {
            noteValue: ""
        }
    },
    getInitialState: function () {
        return {
            noteValue: this.props.noteValue
        };
    },

    keyUp: function (event) {
        var resultString;
        if(event.keyCode === 8) {
            resultString = ("" + this.state.noteValue).slice(0, -1);
        } else {
            resultString = this.state.noteValue + event.key;
        }
        event.preventDefault();
        this.setState({noteValue: resultString});
    },


    render: function render() {
        return (
          <div id="noteInput"
               ref="noteInput"
               contentEditable="true"
               tabIndex="3"
               //style={{outline: "none"}}
               //onKeyDown={this.keyDown}
               //onKeyUp={this.keyUp}
               //onBlur={this.handleBlur}
          >{this.state.noteValue}</div>
        );
    }
});

/**
 * React visual component that has the charge, refund, and display of
 * tax and amount.
 *
 */
var TransactionControl = React.createClass({
    displayName: "TransactionControl",
    getDefaultProps: function () {
        return {
            tax: 0,
            amount: 0,
            valueTransformer: new CurrencyValueTransformer()
        }
    },

    getInitialState: function () {
        return {
            taxCalculated: true,
            noteValue: this.props.noteValue,
            tax: this.props.tax,
            amount: this.props.amount
        };
    },

    setTax: function(event) {
        this.setState({taxCalculated: event.target.checked});
    },

    amountChanged: function(amount) {
        this.setState({amount: amount});
    },

    handleRefund: function() {
        this.props.handleRefund(this.state.amount, this.calculateTax());
    },

    handleCharge: function() {
        this.props.handleCharge(this.state.amount, this.calculateTax());
    },

    calculateTax: function() {
        var calculatedTax = 0;
        if(this.state.taxCalculated) {
            calculatedTax = Math.round(this.state.amount * this.state.tax);
        }
        return calculatedTax;
    },

    render: function render() {
        var calculatedTax = this.calculateTax();
        var formattedTax = this.props.valueTransformer.getTransformedValue(calculatedTax);
        var formattedAmount = this.props.valueTransformer.getTransformedValue(this.state.amount + calculatedTax);
        return (
          <div id="transactionControl">
              <TextEntry noteValue={this.state.noteValue} />
              <div>
                  <span id="tctax"><input type="checkbox" onClick={this.setTax} defaultChecked={this.state.taxCalculated}
                                          name="tax" value={calculatedTax}/> TAX: {formattedTax}</span>
                  <span id="tctotal"> TOTAL: {formattedAmount}</span>
              </div>
              <div id="tcspacer"></div>
              <div id="transactionButtons">
                <KeyBoardButton id="refundButton" tabIndex="4" onClick={this.handleRefund} title="Refund" />
                <KeyBoardButton id="chargeButton" tabIndex="5" onClick={this.handleCharge} title="Charge" />
              </div>
          </div>
        );
    }
});

/**
 * React visual component that models a button.  Makes calling back on a click easier.
 *
 */
var KeyBoardButton = React.createClass({
    displayName: "KeyBoardButton",

    handleKeyUp: function (event) {
        // If it is a space or an enter then trigger the function
        if((event.key === "Enter") || (event.keyCode === 32)) {
            event.preventDefault();
            this.handleClick(event);
        }
    },

    handleClick: function (event) {
        event.preventDefault();
        if (this.props.onClick) {
            this.props.onClick(this);
        }
    },

    render: function render() {
        return (
            <div id={this.props.id}
                 tabIndex={this.props.tabIndex}
                 onKeyUp={this.handleKeyUp}
                 onClick={this.handleClick}>{this.props.title}</div>
        );
    }
});

/**
 * React visual component that ties everything to gether, and uses the
 * ICloverConnector to invoke operations.  It has a ICloverConnectorListener that
 * routes incoming messages.
 *
 */
var ManualTransactionApp = React.createClass({
    displayName: "Sale",

    getDefaultProps: function () {
        return {
            taxRate: 0.1,
            uiTitle: ""
        }
    },

    getInitialState: function() {
        return {
            uiTitle: this.props.uiTitle
        };
    },

    onAmountChanged: function(amount) {
        this.refs.transactionControl.amountChanged(amount);
    },
    handleRefund: function(amount, tax) {
        this.setState({cloverDeviceEvent: this.buildMessage("Refunding..."), showMessageDialog: true}, function(){
            try {
                // Need to prompt for confirmation here?
                if (this.props.cloverConnector) {
                    var request = new clover.remotepay.ManualRefundRequest();
                    request.setAmount(amount + tax);
                    request.setExternalId(clover.CloverID.getNewId());
                    this.props.cloverConnector.manualRefund(request);
                } else {
                    // need to let them know that we are not connected to a device.
                    this.displayWithCloseButton("Cannot refund amount. No device is set!");
                }
                console.log("handleRefund", amount, tax, this.props.cloverConnector);
            } catch(e) {
                this.displayWithCloseButton(e['message'] ? e.message : "Error");
            }
        }.bind(this));
    },

    handleCharge: function(amount, tax) {
        this.setState({cloverDeviceEvent: this.buildMessage("Charging..."), showMessageDialog: true}, function(){
            try {
                if(this.props.cloverConnector){
                    var request = new clover.remotepay.SaleRequest();
                    request.setAmount(amount+tax);
                    request.setExternalId(clover.CloverID.getNewId());
                    this.props.cloverConnector.sale(request);
                } else {
                    // need to let them know that we are not connected to a device.
                    this.displayWithCloseButton("Cannot charge amount. No device is set!");
                }
                console.log("handleCharge", amount, tax, this.props.cloverConnector);
            } catch(e) {
                this.displayWithCloseButton(e['message'] ? e.message : "Error");
            }
        }.bind(this));
    },

    /**
     *
     * @param message
     */
    displayWithCloseButton: function(message) {
        var inputOptions = [];
        var ok = new InputOption();
        ok.setDescription("OK");
        ok.isArtifical = true;
        ok.setKeyPress(KeyPress.BUTTON_1);
        ok.invokeCallback = function() {
            this.closeDialog();
        }.bind(this);
        inputOptions.push(ok);

        this.setMessage(message, inputOptions);
    },

    /**
     * Make a message without any buttons
     * @param message
     * @returns {*}
     */
    buildMessage: function(message) {
        var inputOptions = [];
        var fauxCloverDeviceEvent = new CloverDeviceEvent();
        fauxCloverDeviceEvent.setMessage(message);
        fauxCloverDeviceEvent.setInputOptions(inputOptions);
        return fauxCloverDeviceEvent;
    },

    closeDialog: function() {
        this.setState({showMessageDialog: false});
        // Clear the display.   It is reused and sometimes will show the old display for a bit when redisplayed.
        this.setMessage("");
    },

    componentDidUpdate: function(prevProps, prevState) {
        if(this.props.cloverConnector !== null && (prevProps.cloverConnector !== this.props.cloverConnector)) {
            if(this.cloverConnectorListener == null) {
                this.cloverConnectorListener = new ManualTransactionCloverConnectorListener(
                  this.props.cloverConnector, this);
            } else {
                if(prevProps.cloverConnector !== null) {
                    prevProps.cloverConnector.removeCloverConnectorListener(this.cloverConnectorListener);
                }
                this.props.cloverConnector.removeCloverConnectorListener(this.cloverConnectorListener);
                this.cloverConnectorListener.setCloverConnector(this.props.cloverConnector);
            }
            this.props.cloverConnector.addCloverConnectorListener(this.cloverConnectorListener);
        }
    },

    componentWillUnmount: function() {
        if(this.props.cloverConnector) {
            this.props.cloverConnector.dispose();
        }
    },

    /**
     * @param {InputOption} io
     * @return void
     */
    sendInputOption: function(io) {
        if(io["isArtifical"]) {
            // This is to allow for processing of messages that are outside the typical InputOption
            // parameters.
            io.invokeCallback(this);
        } else if(this.props.cloverConnector) {
            this.props.cloverConnector.invokeInputOption(io);
        }
    },

    setMessage: function(message, inputOptions, signature) {
        // make an artificial CloverDeviceEvent and use it
        var fauxCloverDeviceEvent = new CloverDeviceEvent();
        fauxCloverDeviceEvent.setMessage(message);
        fauxCloverDeviceEvent.setInputOptions(inputOptions);
        this.displayUIEvent(fauxCloverDeviceEvent, signature);
    },

    /**
     *
     * @param {CloverDeviceEvent} deviceEvent
     */
    displayUIEvent: function(deviceEvent, signature) {
        this.setState({cloverDeviceEvent: deviceEvent, signature: signature});
    },

    /**
     *
     * @returns {XML}
     */
    render: function render() {
        return (
          <div>
              <table id="saleApp">
                  <tbody>
                  <tr>
                      <td style={{padding: "0px"}}><TenKey onAmountChanged={this.onAmountChanged}/></td>
                      <td style={{padding: "0px"}}><TransactionControl
                        ref="transactionControl"
                        tax={this.props.taxRate}
                        handleRefund={this.handleRefund}
                        handleCharge={this.handleCharge}
                      /></td>
                  </tr>
                  </tbody>
              </table>
              <UIDialog
                title={this.state.uiTitle}
                cloverDeviceEvent={this.state.cloverDeviceEvent}
                signature={this.state.signature}
                modalIsOpen={this.state.showMessageDialog}
                responseCallback={this.sendInputOption}
              />
          </div>
        );
    }
});

/**
 * React button that uses an {InputOption}
 *
 */
var InputOptionButton = React.createClass({
    responseCallback: function() {
        if(this.props.responseCallback) {
            // extract the data to pass back here - keypress...
            this.props.responseCallback(this.props.inputOption);
        }
    },
    render: function() {
        return (
            <button key={this.props.inputOption.getKeyPress()} type="button" value={this.props.inputOption.getKeyPress()} onClick={this.responseCallback}>
                        {this.props.inputOption.getDescription()}</button>
        );
    }
});

/**
 * React component canvas for rendering
 *
 */
var SignatureCanvas = React.createClass({
    componentDidMount: function() {
        this.updateCanvas(this.props.signature);
    },

    /**
     *
     * @param {Signature} signature
     */
    updateCanvas: function(signature) {
        const ctx = this.refs.canvas.getContext('2d');
        ctx.scale(0.25, 0.25);
        for (var strokeIndex = 0; strokeIndex < signature.strokes.length; strokeIndex++) {
            var stroke = signature.strokes[strokeIndex];
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (var pointIndex = 1; pointIndex < stroke.points.length; pointIndex++) {
                ctx.lineTo(stroke.points[pointIndex].x, stroke.points[pointIndex].y);
                ctx.stroke();
            }
        }
    },
    render: function() {
        return (
          <canvas ref="canvas" width={400} height={175}/>
        );
    }
});

/**
 * Used to display messages to the user during a transaction.
 *
 *
 */
var UIDialog = React.createClass({
    getDefaultProps: function () {
        return {
            cloverDeviceEvent: new CloverDeviceEvent(),
            title: "",
            modalIsOpen: false
        }
    },

    afterOpenModal: function() {
        // references are now sync'd and can be accessed.
        this.refs.subtitle.style.color = '#00f';
        this.refs.subtitle.style.fontFamily = 'sans-serif';

        this.refs.statusMessage.style.width = '366px';
        this.refs.statusMessage.style.wordWrap = 'break-word';
        this.refs.statusMessage.style.fontFamily = 'sans-serif';

        this.refs.buttonContainer.style.width = '100%';
    },

    responseCallback: function(inputOption) {
        if(this.props.responseCallback) {
            this.props.responseCallback(inputOption);
        }
    },

    render: function() {
        var buttonSet = [];
        if(this.props.cloverDeviceEvent.getInputOptions()) {
            this.props.cloverDeviceEvent.getInputOptions().forEach(function (inputOption) {
                buttonSet.push(<InputOptionButton key={inputOption.getKeyPress()} inputOption={inputOption}
                                                  responseCallback={this.responseCallback} />);
            }.bind(this));
        }

        return (
          <div>
              <Modal
                isOpen={this.props.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                style={customStyles} >
                  <h2 ref="subtitle">{this.props.title}</h2>
                  {this.props.signature ? <SignatureCanvas signature={this.props.signature}/> : null}
                  <div ref="statusMessage">{this.props.cloverDeviceEvent.getMessage()}</div>
                  <form>
                      <div ref="buttonContainer">
                          {buttonSet}
                      </div>
                  </form>
              </Modal>
          </div>
        );
    }
});

/**
 * The listener used in this app.
 *
 * @type {clover.remotepay.ICloverConnectorListener}
 */
var ManualTransactionCloverConnectorListener = Class.create( clover.remotepay.ICloverConnectorListener, {
    /**
     *
     * @param {ICloverConnector} cloverConnector
     */
    initialize: function (cloverConnector, messageDisplay) {
        this.messageDisplay = messageDisplay;
        this.cloverConnector = cloverConnector;

        // This is used in the confirm payment handling.
        this.challengeIndex = 0;
    },

    setCloverConnector: function(cloverConnector) {
        this.cloverConnector = cloverConnector;
    },

    onConnected: function () {
        this.messageDisplay.setMessage("Connection to device established.  " +
          "Getting merchant configuration information...");
    },

    /**
     * @param {MerchantInfo} merchantInfo
     * @return void
     */
    onReady: function (merchantInfo) {
        this.messageDisplay.setMessage("Merchant configuration information retrieved.");
    },

    onDisconnected: function () {
        this.displayWithCloseButton("Device disconnected.");
    },

    /**
     *
     * @param message
     */
    displayWithCloseButton: function(message) {
        var inputOptions = [];
        var ok = new InputOption();
        ok.setDescription("OK");
        ok.isArtifical = true;
        ok.setKeyPress(KeyPress.BUTTON_1);
        ok.invokeCallback = function(saleApp) {
            this.messageDisplay.closeDialog();
        }.bind(this);
        inputOptions.push(ok);

        this.messageDisplay.setMessage(message, inputOptions);
    },

    /**
     * Will be called at the completion of a manual refund request, with either a SUCCESS or CANCEL code. If successful, the ManualRefundResponse will have a Credit object associated with the relevant payment information.
     * @param {ManualRefundResponse} response
     * @return void
     */
    onManualRefundResponse: function(response) {
        this.displayWithCloseButton(this.getDisplayBaseResponse("Refund", response));
    },

    /**
     * Will be called, one or more times, at the completion of a sale transaction request, with either a SUCCESS or CANCEL code. A SUCCESS will also have the payment object. The payment object can be the full amount or partial amount of the sale request. Note: A sale transaction my come back as a tip adjustable auth, depending on the payment gateway. The SaleResponse has a boolean isSale to determine if it is final or will be finalized during closeout.
     * @param {SaleResponse} response
     * @return void
     */
    onSaleResponse: function(response) {
        this.displayWithCloseButton(this.getDisplayBaseResponse("Sale", response));
    },

    /**
     *
     * @param {string} initialString - a string to append to
     * @param {BaseResponse} response
     */
    getDisplayBaseResponse: function(formattedMessage, response) {
        formattedMessage += " was " + (response.success ? "" : "not ") + "successful.\n";
        if(response.getResult()) formattedMessage += "The response code was " + response.getResult() + "\n";
        if(response.getReason()) formattedMessage += "The reason was " + response.getReason() + "\n";
        if(response.getMessage())formattedMessage += "The message was " + response.getMessage() + "\n";

        return formattedMessage;
    },

    /**
     * Will be called, passing in the Payment and Signature, if the user provides an on-screen signature, that needs to be accepted or rejected for a payment.
     * @param {VerifySignatureRequest} request
     * @return void
     */
    onVerifySignatureRequest: function(request) {
        var inputOptions = [];
        var accept = new InputOption();
        accept.setDescription("Accept");
        accept.isArtifical = true;
        accept.setKeyPress(KeyPress.BUTTON_1);
        accept.invokeCallback = function(saleApp) {
            saleApp.props.cloverConnector.acceptSignature(request);
        }.bind(this);
        inputOptions.push(accept);

        var reject = new InputOption();
        reject.setDescription("Reject");
        reject.isArtifical = true;
        reject.setKeyPress(KeyPress.BUTTON_2);
        reject.invokeCallback = function(saleApp) {
            saleApp.props.cloverConnector.rejectSignature(request);
        }.bind(this);
        inputOptions.push(reject);

        // for now, auto accept
        this.messageDisplay.setMessage("Verify Signature", inputOptions, request.getSignature());
    },

    /**
     * Will be called, passing in the Payment and Signature, if the user provides an on-screen signature, that needs to be accepted or rejected for a payment.
     * @param {ConfirmPaymentRequest} request
     * @return void
     */
    onConfirmPaymentRequest: function(request) {
        var inputOptions = [];
        var accept = new InputOption();
        accept.setDescription("Accept");
        accept.isArtifical = true;
        accept.setKeyPress(KeyPress.BUTTON_1);
        accept.invokeCallback = function(saleApp) {
            // increment the counter and ...
            this.challengeIndex++;
            if(this.challengeIndex < request.getChallenges().length ) {
                // ...More challenges, make a recursive call.
                this.onConfirmPaymentRequest(request);
            } else {
                // ...all challenges have been accepted, accept the payment.
                // Reset the challengeIndex
                this.challengeIndex = 0;
                saleApp.props.cloverConnector.acceptPayment(request.getPayment());
            }
        }.bind(this);
        inputOptions.push(accept);

        var reject = new InputOption();
        reject.setDescription("Reject");
        reject.isArtifical = true;
        reject.setKeyPress(KeyPress.BUTTON_2);
        reject.invokeCallback = function(saleApp) {
            // Any rejection makes the whole payment into a reject.
            var rejectedChallenge = request.getChallenges()[this.challengeIndex];
            // Reset the challengeIndex
            this.challengeIndex=0;
            saleApp.props.cloverConnector.rejectPayment(request.getPayment(), rejectedChallenge);
        }.bind(this);
        inputOptions.push(reject);

        var challenge = request.getChallenges()[this.challengeIndex];
        this.messageDisplay.setMessage(challenge.getMessage(), inputOptions);
        // this.cloverConnector.acceptPayment(request.getPayment());
    },

    /**
     * Will be called when an error occurs when trying to send messages to the device
     * @param {CloverDeviceErrorEvent} deviceErrorEvent
     * @return void
     */
    onDeviceError: function(deviceErrorEvent) {
        this.displayWithCloseButton(deviceErrorEvent.getMessage());
    },

    /**
     * Will be called when leaving a screen or activity on the Mini.
     * The CloverDeviceEvent passed in will contain an event type and description. Note: The Start and End events
     * are not guaranteed to process in order, so the event type should be used to make sure the start and end events
     * are paired.
     * @param {CloverDeviceEvent} deviceEvent
     * @return void
     */
    onDeviceActivityEnd: function(deviceEvent) {
        // this.messageDisplay.setMessage(JSON.stringify(deviceEvent));
    },

    /**
     * Will be called when a screen or activity changes on the Mini. The CloverDeviceEvent passed in will contain
     * an event type, a description and a list of available InputOptions.
     * @param {CloverDeviceEvent} deviceEvent
     * @return void
     */
    onDeviceActivityStart: function(deviceEvent) {
        this.messageDisplay.displayUIEvent(deviceEvent);
    }
});



//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = ManualTransactionApp;
}
