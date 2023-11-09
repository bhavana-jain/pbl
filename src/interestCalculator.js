import React, {useState, useEffect, useRef, useContext} from 'react';
import {Link} from 'react-router-dom';
import './App.css';
import axios from 'axios';
import EditEntryModal from './editEntryModal.js';
import FilterEntries from './searchEntry.js';
import fileDownload from 'js-file-download';
import ReactToPrint from "react-to-print";
import PledgeBill from './pledgeBill.js';
import NavBar from './navBar.js';
import moment from 'moment';
import _ from 'lodash';
import { User } from './userContext.js';
  
const InterestCalculator = (props, ref) => {
	const [entries, fetchUserEntries] = useState();
	const [allEntries, saveAllEntries] = useState();
	const [editId, setEditModalId] = useState();
	
	// Delete Entry States
	const[deleteModal, isDeleteModal] = useState(false);
	const[delId, setDelId] = useState();
	const [deleteEntry, confirmDeletion] = useState(false);
	
	let value = useContext(User);
	
	const [isPrint, ShouldPrintBill] = useState(false);
	let componentRef = useRef();
	let billPrint = useRef();
	
	const getLists = () => {
  axios.get("http://localhost:4000/customers/get-result", { params: { createdBy: value.data.userName } })
        .then(response => {
			fetchUserEntries(response.data);
          saveAllEntries(response.data);
 // console.log('getT', allEntries.length );
   // getTotals();	
		});
};

let amount = [], tAmount = 0, redemptionAmount = [], reAmount = 0 ;
const [totalAmount, setTotal] = useState();
const [redemAmount, setRedemAmount] = useState();
const [diffAmount, setDifference] = useState();
const isFirstRender = useRef(true);

const getTotals = () => {
	if(allEntries.length > 0 ){
	 const newArr = allEntries.map(function(ele, i){
		 amount.push(ele.amount);
		// amount = _.compact(amount);
		 redemptionAmount.push(parseInt(ele.redemptionAmount));
	})
	setTotal(_.sum(_.compact(amount)));
	setRedemAmount(_.sum(_.compact(redemptionAmount)));
	}
	
}
const getDifference = () => {
setDifference(parseInt(totalAmount) - parseInt(redemAmount));
}
	useEffect(() => {
		if(isFirstRender.current) {
			isFirstRender.current = false;
			return 
		}
	 getTotals();
		 getDifference();
	},[allEntries, totalAmount, redemAmount]);
	

const [art, articleBox] = useState(false);
function showArticleList() {
	articleBox(true);
}
const renderArticleList = (lt) => {
	let list = lt.map(function(list, index) {
		return(
		<li key={"list"+index}> {list} </li>
		)
	});
	return list;
}

const [formVal, setFormVal] = useState();
const [billId, getBillNumber] = useState();

	const [data, fetchData] = useState();
	const [editModal, showEditModal] = useState(false);
	const [search, setSearchVal] = useState();
	const[fEntries, SetFilteredEntries] = useState();
	 let filteredEntry, finalAmount;
	 
	 // Calculate Rate of interest
	 const calculateInterest = (date1, amount) => {
		let interest;
			const diffTime = new Date() - new Date(date1);
			const diffDays = diffTime / (1000 * 60 * 60 * 24);
			let months = 	parseInt(diffDays / 30);
			if(new Date().getDate() <= new Date(date1).getDate()){
				// interest = (amount * (months - 2) * perValue) / 100;
				interest = (amount * (months - 1) * perValue) / 100;
			}
			else { 
				//interest = (amount * (months-1) * perValue) / 100;
				interest = (amount * (months) * perValue) / 100;
			
			}
			finalAmount = amount + interest;
			return interest;
	}	
	
	 function callbackFunction(childData) {
		setSearchVal(childData)
		if(childData == "clear" ) {
			setSearchVal(undefined);
			getLists();
		}
		else {
			 filteredEntry = allEntries.filter(function(ele) {
			if(ele.cName.toLowerCase() == childData.toLowerCase() || ele.billNumber == childData) {
				return ele
			}
		});
		fetchUserEntries(filteredEntry);
		SetFilteredEntries(filteredEntry);
		}
	}
	
	const RenderTableData = () => {
	 let data = entries.map(function(data, idx) {
		 if(data.redemptionDate == null || data.redemptionDate == "" || data.redemptionDate == undefined) {
		   return (
			   <ul className="table-body" key={data._id}>
			  <li>{data.cName}</li>
			  <li style={{"textAlign":"left", "paddingLeft":"10px"}}>
				{data.address}
				{data.contactNo == "" || data.contactNo == undefined || data.contactNo == null ? "" : <div className="contact-number"> {data.contactNo} </div> }
			  </li>
			  <li>
			  {data.date == "" || data.date == undefined || data.date == null || data.date == "Invalid date" ? '' : moment(data.date).format('DD/MM/YYYY')} 
			  </li>
			  <li>{data.billNumber}</li>
			  <li>{data.amount}</li>
			  <li>
			  <div style={{"position":"relative"}} className="showMore"> {data.articleName[0]} 
			   <ul className="all-articles">
				  {renderArticleList(data.articleName)}
				  </ul>
				  </div>
			  </li>
			  <li> {data.gram}.{data.mg} </li>
			  <li>{calculateInterest(data.date, data.amount)}</li>
			  </ul> 
		   );
		 }
		 else {
			 return false;
		 }
});
return data
 }
		
	useEffect(() => {
		console.log(filteredEntry);
		 getLists();
		 setSearchVal();
	}, [data]);
	
	useEffect(() => {
	}, [search]);
	

  const [perValue, setPerValue] = useState("1.33");

  const handleChange = (e) => {
    setPerValue(e.target.value);
  };


  return (
  <> 
   <NavBar page="interestCalc" />
  <div style={{"display":"flex", "marginBottom":"15px"}}>
  <div> Total Amount: <strong>{diffAmount } </strong></div>
  </div>
  <div style={{"display":"flex"}}>
  <FilterEntries parentCallback={callbackFunction} />
  <div style={{"marginLeft":"auto"}}>
      <select value={perValue} onChange={handleChange} style={{"height":"40px", "fontSize":"16px"}}>
        <option value="1.33">1.33%</option>
		<option value="1.5">1.5%</option>
        <option value="2">2%</option>
        <option value="2.5">2.5%</option>
		<option value="3">3%</option>
		<option value="4">4%</option>
		<option value="5">5%</option>
      </select>
      </div>
  </div>
  {entries && entries.length ? 
  <div style={{"display":"table", "width":"100%", "marginTop":"25px"}} ref={el => (componentRef = el)} >
  <ul className="table-header" style={{"fontWeight":"bold"}}>
  <li>Name</li>
  <li>Address</li>
  <li>Date</li>
  <li>Bill Number</li>
  <li>Amount</li>
  <li>Article Name</li>
  <li> Weight </li>
  <li>Interest</li>
  </ul> 
  { search != null || search != undefined ? <RenderTableData /> : '' }

  </div>
  : <h3 style={{"marginTop":"50px", "textAlign":"centre"}}> Loading... </h3>}  
  </>
)
}

export default InterestCalculator;
