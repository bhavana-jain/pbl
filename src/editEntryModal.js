import React, { useState, useEffect, useRef, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import AllUserEntries from './entryTable.js';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import ReactToPrint from "react-to-print";
import DeliveryNote from './deliveryNote.js';
import { isInteger, parseInt } from 'lodash';

const EditEntryModal = (props) => {
	// console.log('delivery', props.delivery);
	const toDeliver = props.delivery;
	const [inputVal, setInputValue] = useState();
	const [editData, getEditedData] = useState();
	const [closeModal, setCloseModal] = useState();
	const note = useRef();
	const redDate = useRef();
	const interest = useRef();
	const redemptionAmt = useRef();
	const [interestVal, setInterestVal] = useState();

	const handleChange = (e) => {
		const value = e.target.value;
		setInputValue({ ...inputVal, [e.target.name]: value });
	}

	const getData = async () => {
		const response = await axios.get("http://localhost:4000/customers/update-student/" + props.toEdit);
		setInputValue(response.data);
	};

	const postData = async (e) => {
		e.preventDefault();
		await axios.post('http://localhost:4000/customers/create-student', inputVal, { headers: { 'Content-Type': 'application/json' } })
			.then(res => console.log(res.data));
	}

	// Save only edited data without updating redemption date, as is it set by default
	const postUpdatedData = async (e) => {
		props.parentModalCallBack("close");
		e.preventDefault();
		await axios.put('http://localhost:4000/customers/update-student/' + props.toEdit, { ...inputVal }, { headers: { 'Content-Type': 'application/json' } })
			.then(res => {
				console.log(res.data)
			
			});
	}

	// Save to redeemed entry
	const saveRedeemedEntry = async (e) => {
		// updateData();
		let rDate = redDate.current.value;
		let rAmount = redemptionAmt.current.value;
		console.log(inputVal);
		e.preventDefault();
		await axios.put('http://localhost:4000/customers/update-student/' + props.toEdit, {...inputVal, "redemptionDate":rDate , "redemptionAmount": rAmount}, { headers: { 'Content-Type': 'application/json' } })
			.then(res => console.log(res.data));
			props.parentModalCallBack("close");
	};

	const cancelUpdate = (e) => {
		props.parentModalCallBack("close");
		e.preventDefault();
	}

	function calculateInterest(date1, amount, redemDate) {
		let diffMonth, dateDiff, redeemDate, interest; 
		if (redemDate == null || redemDate == undefined) {
			redeemDate = new Date();
		}
		else {
			redeemDate = new Date(redemDate)
		}
		const monthDiff = redeemDate.getMonth() - new Date(date1).getMonth();
		const yearDiff = redeemDate.getYear() - new Date(date1).getYear();

		console.log('month diff', monthDiff);
	  
		if (redeemDate.getDate() < new Date(date1).getDate()) {
		dateDiff = 1;
		}
		else { dateDiff = 0}

		diffMonth = (monthDiff +1) + yearDiff * 12	
		diffMonth == 0 ? diffMonth = 1 : diffMonth = diffMonth;  
		interest = (amount * (diffMonth - dateDiff) * 1.33) / 100;
		
		return Math.abs(interest).toFixed(2);

	}

	useEffect(() => {
		getData();
	}, []);


	return (
		<div>
			<div className="page-overlay"></div>
			<div className="entry-form-modal" tabindex="0">
				<button className="close-modal" onClick={cancelUpdate}></button>
				{inputVal ?
					<form className="entry-form">
						<div>
							<label htmlFor="cName">Name</label>
							<input type="text" name="cName" placeholder="Enter name" value={inputVal.cName} onChange={handleChange} readOnly={toDeliver} />
						</div>
						<div>
							<label htmlFor="address">Address</label>
							<input type="text" name="address" placeholder="Enter address" value={inputVal.address}
							 onChange={handleChange} readOnly={toDeliver} />
						</div>
						<div>
							<label htmlFor="contactNo">Contact Number</label>
							<input type="number" name="contactNo" placeholder="Enter contact number"
								value={inputVal.contactNo}
								onKeyPress={(event) => { if (!/[0-9]/.test(event.key)) { event.preventDefault(); } }}
								onChange={handleChange} autoComplete="off" readOnly={toDeliver} />
						</div>
						<div>
							<label htmlFor="date">Date</label>
							<input type="date" name="date" placeholder="Enter date" value={inputVal.date} onChange={handleChange} readOnly={toDeliver} />
						</div>
						<div>
							<label htmlFor="billNumber">Bill Number</label>
							<input type="text" name="billNumber"
								placeholder="Bill Number" value={inputVal.billNumber} onChange={handleChange} readOnly={toDeliver} />
						</div>
						<div>
							<label htmlFor="oldBillNumber">Old Bill Number</label>
							<input type="text" name="oldBillNumber" placeholder="Bill Number"
								value={inputVal.oldBillNumber} onChange={handleChange} />
						</div>
						<div>
							<label htmlFor="amount">Amount</label>
							<input type="number" name="amount" placeholder="Amount" value={inputVal.amount} onChange={handleChange} />
						</div>
						<div style={{ "display": "flex" }}>
							<div style={{ "width": "50%" }}>
								<label htmlFor="gram">Gram</label>
								<input type="number" name="gram" placeholder="gram"
									style={{ "display": "block" }}
									onChange={handleChange}
									onKeyPress={(event) => { if (!/[0-9]/.test(event.key)) { event.preventDefault(); } }}
									value={inputVal.gram} autoComplete="off" readOnly={toDeliver} />
							</div>
							<div style={{ "width": "50%" }}>
								<label htmlFor="mg">mg</label>
								<input type="number" name="mg" placeholder="mg"
									style={{ "display": "block" }}
									onKeyPress={(event) => { if (!/[0-9]/.test(event.key)) { event.preventDefault(); } }}
									onChange={handleChange} value={inputVal.mg} autoComplete="off" readOnly={toDeliver} />
							</div>
						</div>
						<div>
							<label htmlFor="articleName">Article Name</label>
							<input type="text" name="articleName" placeholder="Article Name" value={inputVal.articleName} onChange={handleChange} readOnly={toDeliver} />
						</div>
						<div>
							<label htmlFor="metal">Article Metal</label>
							<input type="text" name="metal" placeholder="Article Name" value={inputVal.metal} readOnly />
						</div>
						<div>
							<label htmlFor="interest">Interest</label>
							<input type="number" name="interest" placeholder="Interest Value"
								defaultValue={calculateInterest(inputVal.date, inputVal.amount, inputVal.redemptionDate)}
								value={calculateInterest(inputVal.date, inputVal.amount, inputVal.redemptionDate)}
								onChange={handleChange} ref={interest} />
						</div>
						<div>
							<label htmlFor="redemptionDate">Redemption Date</label>
							<input type="date" name="redemptionDate" placeholder="Enter date" ref={redDate}
								value={inputVal.redemptionDate ? moment(inputVal.redemptionDate).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD')}
								onChange={handleChange} />
						</div>
						<div>
							<label htmlFor="redemptionAmount">Redemption Amount</label>
							<input type="number" name="redemptionAmount" placeholder="Redemption Amount"
								defaultValue={inputVal.amount} value={inputVal.redemptionAmount} onChange={handleChange} ref={redemptionAmt}/>
						</div>
						<div>
							<label htmlFor="remark">Remark</label>
							<input type="text" name="remark" placeholder="Enter remark" value={inputVal.remark} onChange={handleChange} readOnly={toDeliver} />
						</div>
						<div>
							<label htmlFor="idProof">Identity Proof</label>
							<input type="text" name="idProof" placeholder="Identity Proof" onChange={handleChange} value={inputVal.idProof} autoComplete="off" readOnly={toDeliver} />
						</div>
						<div>
							<label htmlFor="deliveryRecNum">Delivery Receipt Number</label>
							<input type="text" name="deliveryRecNum" placeholder="Delivery Receipt Number" onChange={handleChange} value={inputVal.deliveryRecNum} autoComplete="off" />
						</div>
						
						<div style={{ "clear": "both", "paddingLeft": "0px", "width":"100%" }}>
							<button onClick={postUpdatedData}> Edit Entry </button>
							<button onClick={saveRedeemedEntry} style={{ "marginLeft": "15px" }}> Redeem Entry </button>
							<button onClick={cancelUpdate} style={{ "marginLeft": "15px" }}> Cancel </button>
						</div>
					</form> : ''}
			</div>
		</div>
	);
}

export default EditEntryModal;
