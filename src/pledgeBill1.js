import React, {useState, useEffect, useRef} from 'react';
import './App.css';
import axios from 'axios';
import { ToWords } from 'to-words';
import moment from 'moment';

const PledgeBill = React.forwardRef((props, ref) => {
	let val = props.billNum;
	const [billInfo, setBillDetail] = useState({ "cName":"",
			"date":"",
			"address":"",
			"amount": 0,
			"redemptionAmount":"",
			"billNumber":"",
			"redemptionDate":"",
			"articleName":"",
			"remark":"",
			"contactNo":"",
			"gram":"",
			"mg":"", 
			"presentValue":""
			});
	const toWords = new ToWords();
	let pledgeAmount; 
	function setBillDetails() {
		if(val ==  undefined || val == null) {
			val = { "cName":"",
			"date":"",
			"address":"",
			"amount": 0,
			"redemptionAmount":"",
			"billNumber":"",
			"redemptionDate":"",
			"articleName":"",
			"remark":"",
			"contactNo":"",
			"gram":"",
			"mg":"", 
			"presentValue":""
			}
		}
		else {
			if(val.amount == null || val.amount == undefined || val.amount == ''){
			val.amount = 0;
		}
		}
		 pledgeAmount =toWords.convert(parseInt (val.amount), { currency: true });
	 }
	
	  return (
	  <div ref={ref} id="pledgeBill">
   <h1> bill Number is {val.billNumber} </h1>
	   </div>
  );

});

export default PledgeBill;