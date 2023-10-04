import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {Link } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import moment from 'moment';
import ReactToPrint from "react-to-print";
import PledgeBill from './pledgeBill.js';
import { User } from './userContext.js';
import NavBar from './navBar.js';

const AddEntry = () => {
	const [entries, fetchUserEntries] = useState([]);
	const [loading, isSetLoading] = useState(false);
	const isFirstRender = useRef(true);
	let value = useContext(User);
	const date = useRef();
	const metalType = useRef();
	
	// Fetch entries to get last bill number
	const getLists = () => {
		isSetLoading(false);
		axios.get("http://localhost:4000/customers/get-result", { params: { createdBy: value.data.userName } })
			.then(response => {
				fetchUserEntries(response.data);
				isSetLoading(true);
			});

	};

	// Create and update new bill number
	const [updatedBillNum, setNewBillNum] = useState(0);
	const setBillNumber = () => {
		let newBill, len , currentYear = new Date().getFullYear();
		if(entries.length > 0 ){
			len = entries.length;
			let arrlen = (entries[len - 1].billNumber);
			console.log(arrlen)
		// Temp bill number check -- to be removed later
		if (arrlen.split('/').length > 1 && currentYear == arrlen.split('/')[1]) {
			newBill = parseInt((arrlen.split('/')[0])) + 1;
		}
		else {
			newBill = 1;
		}
		}
		
		else {
			newBill = 1;
		}
		let newBillNum = newBill + "/" + new Date().getFullYear();
		setNewBillNum(newBillNum);
	}


	useEffect(() => {
		setBillNumber();
	}, [entries]);
	useEffect(() => {
		getLists();
	}, []);

	// Get last bill number, after data is fetched
	useEffect(() => {
		console.log(value.data);
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return
		}
		else if (entries.length) {
			setBillNumber();
		}
	}, [loading]);

	const [inputVal, setInputValue] = useState(
		{
			"cName": "",
			"date": "",
			"address": "",
			"amount": "",
			"redemptionAmount": "",
			"billNumber": updatedBillNum,
			"redemptionDate": "",
			"articleName": "",
			"metal":"",
			"remark": "",
			"contactNo": "",
			"gram": "",
			"mg": "",
			"presentValue": "",
			"idProof": ""
		}
	);

	const [formVal, setFormVal] = useState();
	let billPrint = useRef();

	const [counter, inputCounter] = useState(0);

	function handleChange(e) {
			let value;
		if (e.target.name == "billNumber") {
			setNewBillNum(e.target.value)
		}
		else {
			value = e.target.value;
		}
		setInputValue({ ...inputVal, [e.target.name]: value, "articleName": article, "billNumber": updatedBillNum });
	}

	const[metal, setMetal] = useState();
	function updateMetal(e){
		setMetal(e.target.value);
	}

	function updateArticleName(e) {
		const value = e.target.value;
		articleList(article => article.concat(value));
	}

	const [article, articleList] = useState([]);
	function appendInput(e) {
		// Prevent form submission when button is clicked
		if (e != undefined) {
			e.preventDefault();
		}
		inputCounter(counter + 1);
		let ele = document.createElement("input");
		ele.type = "text";
		ele.placeholder = "Enter article Name";
		ele.id = "article" + counter;
		document.getElementById("addArticle").appendChild(ele);
	}

	let listVal = [], val = '';
	const [name, articleName] = useState();

	useEffect((e) => {
		// Add add article input dynamically 
		appendInput();
	}, []);

	useEffect((e) => {
		//	appendInput();
		setInputValue({ ...inputVal, "articleName": article });
	}, [article]);


	// Create list of articles array
	function saveArticle(e) {
		val = e.target.value;
		// Do not concatenate empty and undefined values
		if (val == "" || val == null || val == undefined) {

		}
		else {
			articleList(article => article.concat(val));
		}
	}

	useEffect((e) => {
		// Duplicating for printing bill, as original form values will be cleared once data is posted
		setFormVal({...inputVal, "date": date.current.value, "metal":metalType.current.value, "createdBy": value.data.userName});
	}, [inputVal]);


	// Save button only - added temp
	const postDataOnly = (e) => {
		e.preventDefault();
		postData();
	}

	const postData = (e) => {
		var art = document.getElementById('addArticle');
		var allArt = art.getElementsByTagName("input"), list = [] ;
		for (let i = 0; i < allArt.length; i++){
list.push(allArt[i].value);
		}
		console.log(allArt, list);
		// e.preventDefault();
		axios.post('http://localhost:4000/customers/create-student', { ...inputVal, "date": date.current.value, "metal":metalType.current.value, "createdBy": value.data.userName, "articleName": list }, { headers: { 'Content-Type': 'application/json' } })
			.then(res => {
				console.log(res.data);
				setInputValue({
					"cName": "",
					"date": "",
					"address": "",
					"amount": "",
					"redemptionAmount": "",
					"billNumber": "",
					"oldBillNumber": "",
					"redemptionDate": "",
					"articleName": "",
					"remark": "",
					"contactNo": "",
					"gram": "",
					"mg": "",
					"presentValue": ""
				});
			});
		getLists();
		setBillNumber();
		// Remove all article input field and append only one. Also clear the article array
		articleList([]);
		document.getElementById("addArticle").innerHTML = "";
		document.getElementById("first-field").focus();
		appendInput();
	}

	const setData = (e) => {
		postData(e);
		console.log('before print called', formVal);
	}


	return (
		<div>
			 <div className="navbar" >
          <ul className="tabs" id="page-tabs">
            <li className='active'>
              <Link to="/addEntry">Add Entry</Link>
            </li>
            <li>
              <Link to="/unredeemed">Unredeemed Entries</Link>
            </li>
            <li>
              <Link to="/redeemed"> Redeemed Entries</Link>
            </li>
            <li>
              <Link to="/InterestCalculator"> Interest Calculator</Link>
            </li>
            <li>
              <Link to="/pledge"> Pledge</Link>
            </li>            
          </ul>
          <div style={{"marginLeft": "auto"}}>
            <h5 style={{"margin": "0"}}>Welcome {value.data.userName} !</h5>
            <div style={{"textAlign": "right", "fontSize":"12px"}}>
            <Link to="/"> Logout </Link>
            </div>
          </div>
        </div>
			<form className="entry-form" >
				<div>
					<label htmlFor="cName">Name</label>
					<input type="text" name="cName" id="first-field" placeholder="Enter name" value={inputVal.cName} onChange={handleChange} autoComplete="off" />
				</div>
				<div>
					<label htmlFor="address">Address</label>
					<input type="text" name="address" placeholder="Enter address" value={inputVal.address} onChange={handleChange} autoComplete="off" />
				</div>
				<div>
					<label htmlFor="contactNo">Contact Number</label>
					<input type="number" name="contactNo" placeholder="Enter contact number"
						onKeyPress={(event) => { if (!/[0-9]/.test(event.key)) { event.preventDefault(); } }}
						value={inputVal.contactNo} onChange={handleChange} autoComplete="off" />
				</div>
				<div>
					<label htmlFor="date">Date</label>
					<input type="date" name="date" placeholder="Enter date"
						value={inputVal.date ? moment(inputVal.date).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD')} onChange={handleChange} ref={date} />
				</div>
				<div>
					<label htmlFor="billNumber">Bill Number</label>
					<input type="text" name="billNumber" placeholder="Bill Number"
						value={updatedBillNum} onChange={handleChange} />
				</div>
				<div>
					<label htmlFor="oldBillNumber">Old Bill Number</label>
					<input type="text" name="oldBillNumber" placeholder="Bill Number"
						value={inputVal.oldBillNumber} onChange={handleChange} />
				</div>
				<div>
					<label htmlFor="amount">Amount</label>
					<input type="number" name="amount" placeholder="Amount"
						onKeyPress={(event) => { if (!/[0-9]/.test(event.key)) { event.preventDefault(); } }}
						onChange={handleChange} value={inputVal.amount} />
				</div>
				<div style={{ "display": "flex" }}>
					<div style={{ "width": "50%" }}>
						<label htmlFor="gram">Gram</label>
						<input type="number" name="gram" placeholder="gram"
							onKeyPress={(event) => { if (!/[0-9]/.test(event.key)) { event.preventDefault(); } }}
							style={{ "display": "block" }}
							onChange={handleChange} value={inputVal.gram} autoComplete="off" />
					</div>
					<div style={{ "width": "50%" }}>
						<label htmlFor="mg">mg</label>
						<input type="number" name="mg" placeholder="mg"
							style={{ "display": "block" }}
							onChange={handleChange} value={inputVal.mg}
							onKeyPress={(event) => { if (!/[0-9]/.test(event.key)) { event.preventDefault(); } }}
							autoComplete="off" />
					</div>
				</div>
				<div>
					<label htmlFor="presentValue">Present Value</label>
					<input type="text" name="presentValue" placeholder="Present Value" onChange={handleChange} value={inputVal.presentValue} autoComplete="off" />
				</div>
				<div>
					<label htmlFor="remark">Remarks</label>
					<input type="text" name="remark" placeholder="Remark" onChange={handleChange} value={inputVal.remark} autoComplete="off" />
				</div>
				<div>
					<label htmlFor="idProof">Identity Proof</label>
					<input type="text" name="idProof" placeholder="Identity Proof" onChange={handleChange} value={inputVal.idProof} autoComplete="off" />
				</div>
				<div>
					<label htmlFor="metal" style={{ "display": "inline-block" }}>Metal</label>
					<select id="metal" onChange={updateMetal} value={metal} className="metal-type" ref={metalType}>
						<option value="GOLD" selected>GOLD</option>
						<option value="SILVER">SILVER</option>
						</select>
				</div>
				<div style={{"display":"block", "float":"none"}}>
					<label htmlFor="articleName" style={{ "display": "inline-block" }}>Article Name</label>
					<button className="add-more" onClick={appendInput} style={{ "display": "inline-block" }}> + </button>
					<div id="addArticle">
					</div>
				</div>
				<div style={{ "clear": "both", "paddingLeft": "0px" }}>
					<button onClick={postDataOnly} style={{ "marginRight": "10px" }}> Save </button>
					<ReactToPrint
						trigger={() => <div className="sp-button"> Save &amp; Print </div>}
						content={() => billPrint}
						onBeforeGetContent={(e) => setData(e)}
					/>
				</div>
			</form>
			<div ref={el => (billPrint = el)} id="pledgeBill">
				{/* Print 2 copies of bill, original and duplicate */}
				<PledgeBill test={formVal} billType="Original Bill" />
				<PledgeBill test={formVal} billType="Duplicate Bill" />
			</div>
		</div>
	);
}

export default AddEntry;