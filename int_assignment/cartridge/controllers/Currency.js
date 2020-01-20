/**
* Controller to convert currency
*
* @module  controllers/Currency
*/

'use strict';

/* Script Modules */
var app = require('osfAssignmentSG_controllers/cartridge/scripts/app');
var guard = require('osfAssignmentSG_controllers/cartridge/scripts/guard');
var MiddlewareApi = require("int_assignment/cartridge/scripts/api/MiddlewareApi");
var URLUtils = require('dw/web/URLUtils');
importPackage(dw.object);
var Transaction = require('dw/system/Transaction');
var Logger = dw.system.Logger.getLogger('currency');

/**
* Starting of Currency Converter
*
* @return {String} The string 'start'
*/
var start = function(){
	var currencyForm = app.getForm('currencies');
	currencyForm.clear();
	app.getView({
        ContinueURL: URLUtils.https('Currency-Form')
    }).render('currencyConverter');
}

/**
* To Handle Calculate action
*
* @return {String} The string 'handleForm'
*/
function handleForm() {
    var currencyForm = app.getForm('currencies');

	var customObject = CustomObjectMgr.getCustomObject('currencyConversionRates', 'currencyConversionRates');
	var currencyArray;
	var currentTime = dw.util.Calendar().getTime();
	if(!empty(customObject)){
		var timeSinceLastAPIHit = currentTime -customObject.lastModified;
		// 5 minutes is equal to 300000 milliseconds
		if(timeSinceLastAPIHit > 300000){
			var api = new MiddlewareApi();
        	var result = api.currencyConversionGetService();
        	currencyArray = JSON.parse(result.object).rates;
        	try{
        		Transaction.begin();
        		CustomObjectMgr.remove(customObject);
    			customObject = CustomObjectMgr.createCustomObject('currencyConversionRates', 'currencyConversionRates');
    			customObject.custom.rates = result.object;
    			Transaction.commit();
        	}catch(err){
    			Transaction.rollback();
    			Logger.error("Error while creating custom object for Currency Converter': " +err.message);
    			throw new Error(err.message);
    		}
		}else{
			currencyArray = JSON.parse(customObject.custom.rates).rates;
		}
	}else{
		var api = new MiddlewareApi();
    	var result = api.currencyConversionGetService();
    	currencyArray = JSON.parse(result.object).rates;
    	try{
    		Transaction.begin();
			customObject = CustomObjectMgr.createCustomObject('currencyConversionRates', 'currencyConversionRates');
			customObject.custom.rates = result.object;
			Transaction.commit();
    	}catch(err){
			Transaction.rollback();
			Logger.error("Error while creating custom object for Currency Converter': " +err.message);
			throw new Error(err.message);
		}
	}
	
	var fromCurrencyValue =  currencyForm.getValue('fromCurrencyValue');
	var fromCurrency =  currencyForm.getValue('fromCurrency'); 
	var toCurrency =  currencyForm.getValue('toCurrency');

	response.setContentType('application/json');

    let json = JSON.stringify({
    	status: "success",
    	toCurrencyValue : (fromCurrencyValue/currencyArray[fromCurrency])*currencyArray[toCurrency]
	});
    response.writer.print(json);
    
}
/* Exports of the controller */
/**
 * @see {@link module:controllers/Currency~Start} */
exports.Start = guard.ensure(['get'], start);
/** The Currency form handler.
 * @see {@link module:controllers/Currency~handleForm} */
exports.Form = guard.ensure(['post'], handleForm);

