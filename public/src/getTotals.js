import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';

  
const GetAllTotal = (props) => {
	const [totalAmt, calcTotalAmt] = useState();
	const [redemmedAmt, calcRedeemedAmt] = useState();
	const [allEntries, getAllEntries] = useState();
	
	const getLists = () => {
   axios.get('http://localhost:4000/customers/')
            .then((res) => {
                getAllEntries(res.data);
				calTotals();
            }).catch((error) => {
                console.log(error)
            })
  
  //calcTotalAmt(response.data.amount);
//calcTotalAmt(response.data.redeemedAmount);
};

let tAmount = 0;
function calTotals() {
	console.log(allEntries);
	const newArr = allEntries.map(function(ele, i){
		
		
	})
	let entryLength = allEntries.length;
	// let tAmount = 0;
	for(let i=0; i<= entryLength; i++) {
		tAmount += parseInt(allEntries.amount);
	}
	console.log(tAmount);
}
useEffect(() => {
		 getLists();
		  calTotals();
		// showEditModal(false);
	}, [allEntries]);


  return (
  <> 
 Total AMount {tAmount}
 </>
 )
}

export default GetAllTotal;
