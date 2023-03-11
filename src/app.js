/**
 * Copyright 2022 Thetis Apps Aps
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * 
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const axios = require('axios');

async function getIMS() {
	
    const authUrl = "https://auth.thetis-ims.com/oauth2/";
    const apiUrl = "https://api.thetis-ims.com/2/";

	var clientId = process.env.ClientId;   
	var clientSecret = process.env.ClientSecret; 
	var apiKey = process.env.ApiKey;  
	
    let data = clientId + ":" + clientSecret;
	let base64data = Buffer.from(data, 'UTF-8').toString('base64');	
	
	var imsAuth = axios.create({
			baseURL: authUrl,
			headers: { Authorization: "Basic " + base64data, 'Content-Type': "application/x-www-form-urlencoded" },
			responseType: 'json'
		});
    
    var response = await imsAuth.post("token", 'grant_type=client_credentials');
    var token = response.data.token_type + " " + response.data.access_token;
    
    var ims = axios.create({
    		baseURL: apiUrl,
    		headers: { "Authorization": token, "x-api-key": apiKey, "Content-Type": "application/json" }
    	});

	ims.interceptors.response.use(function (response) {
			console.log("SUCCESS " + JSON.stringify(response.data));
 	    	return response;
		}, function (error) {
			console.log(JSON.stringify(error));
			if (error.response) {
				console.log("FAILURE " + error.response.status + " - " + JSON.stringify(error.response.data));
			}
	    	return Promise.reject(error);
		});

	return ims;
}

exports.orderProposalHandler = async (event, x) => {
    
    console.log(JSON.stringify(event));

    let detail = event.detail;
    
    let ims = await getIMS();
    
    let response = await ims.get('documents/' + detail.documentId);
    let document = response.data;
    
    response = await ims.get('contexts/' + detail.contextId);
    let context = response.data;
    let dataDocument = JSON.parse(context.dataDocument);
    let setup = dataDocument.OrderProposalUtilities;
    
    if (setup.createInboundShipment) {
        
        response = await ims.get('documents/' + detail.documentId + '/globalTradeItemsToOrder');
        let lines = response.data;
    
        let i = 1;
        let map = new Map();
        for (let line of lines) {
            let supplierNumbers = line.supplierNumbers;
            if (supplierNumbers != null) {
                let supplierNumber = supplierNumbers.split(',')[0];
                let inboundShipment;
                if (map.has(supplierNumber)) {
                    inboundShipment = map.get(supplierNumber);
                } else {
                    inboundShipment = new Object();
                    inboundShipment.inboundShipmentNumber = document.documentNumber + '-' + i++;
                    inboundShipment.supplierNumber = supplierNumber;
                    inboundShipment.inboundShipmentLines = [];
                    map.set(supplierNumber, inboundShipment);
                }
    
                console.log(map);
                
                let inboundShipmentLine = new Object();
                inboundShipmentLine.inboundShipmentNumber = inboundShipment.inboundShipmentNumber;
                inboundShipmentLine.stockKeepingUnit = line.stockKeepingUnit;
                inboundShipmentLine.numItemsExpected = line.numItemsToOrder;
                inboundShipment.inboundShipmentLines.push(inboundShipmentLine);
                
            }
        }    
        
        for (let inboundShipment of map.values()) {
            await ims.post('inboundShipments', inboundShipment);
        }
    
    }
    
    await ims.patch('documents/' + document.id, { workStatus: 'DONE' });
    
    return "DONE";
};
