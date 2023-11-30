import React, { useState, useEffect } from 'react';
import './App.css';
import moment from 'moment';

const DeliveryNote = React.forwardRef((props, ref) => {

	let val, today = moment(new Date()).format('DD/MM/YYYY');
	function checkIfProps() {
		console.log('delivery note');
		if (props.delivery == undefined || props.delivery == null) {
			val = {
				"cName": "",
				"date": "",
				"address": "",
				"amount": "",
				"redemptionAmount": "",
				"billNumber": "",
				"redemptionDate": "",
				"articleName": "",
				"remark": "",
				"contactNo": "",
				"gram": "",
				"mg": "",
				"presentValue": ""
			}
		}
		else {
			val = props.delivery;
		}
	}

	function calculateInterest(date1, amount) {
		const diffTime = Math.abs(new Date() - new Date(date1));
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		let months = Math.ceil(diffDays / 30);
		let interest = (amount * (months - 1) * 1.33) / 100;
		return interest;
	}

	checkIfProps();
	return (
		<div ref={ref}>
			<div className="page-a4">
			<h2 className="text-centre"> DELIVERY NOTE </h2>
				<div className="bill-header" id="header">
					<div className="logo" style={{ "display": "inline-block", "verticalAlign": "middle" }}></div>
					<div style={{ "display": "inline-block", "verticalAlign": "middle" }}>
						<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block" }}> NAKODA </h2> Pawn Broker</div>
						<div> Plot No.9, V.O.C. Nagar, Market Lane, <br /> Tondiarpet, Chennai- 600 081 </div>
					</div>
				</div>
				<p> பெயர் <span className="content-spacer"> {val.cName} </span> எண் <span className="content-spacer"> </span> </p>
				<p> ரசீது எண் <span className="content-spacer"> {val.billNumber} </span> வைத்த  தேதி <span className="content-spacer"> </span>
					இந்த ரசீதில் கண்ட பொருள்களை ரசீது இல்லாமல் பூராவும் பெற்று கொண்டேன் </p>
				<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0" }}>
					<div style={{ "marginLeft": "auto" }}>
						இப்படிக்கு <br /> <br /> <br />  <br />  <br />
						கையொப்பம் </div>
				</div>
				<p style={{ "lineHeight": "27px" }}>
					THE AMOUNT OF EVERY PAYMENT RECEIVED TOWARDS LOAN DATE
					<span className="content-spacer"> {val.date == "" || val.date == undefined || val.date == null || val.date == "Invalid date" ? '' : moment(val.date).format('DD/MM/YYYY')}</span>
					FOR PRINCIPLE <span className="content-spacer"> {val.amount}</span> FOR INTEREST </p>
				<p style={{ "lineHeight": "27px" }}> I HAVE THIS DAY PAID RS <span className="content-spacer"> </span>
					TOWARDS PRINCIPLE &amp; RS <span className="content-spacer"> {calculateInterest(val.date, val.amount)} </span> TOWARDS INTEREST &amp; RECEIVED THE ARTICLE MENTIONED OVER LEAF WITH FULL
					MANUFACTION </p>
				<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0" }}>
					<div> Date <span className="content-spacer"> {today} </span> </div>
					<div style={{ "marginLeft": "auto" }}> Total <span className="content-spacer"> </span> </div>
				</div>
				<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0" }}>
					<div style={{ "marginLeft": "auto" }}> Signature or Thumb Impression of the Pawner </div>
				</div>
			</div>
		</div>
	)
});

export default DeliveryNote;