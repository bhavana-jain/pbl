import React, { useEffect, useContext } from 'react';
import './App.css';
import { ToWords } from 'to-words';
import moment from 'moment';
import { values } from 'lodash';
import { User } from './userContext.js';

const PledgeBill = React.forwardRef((props, ref) => {
	let pledgeAmount, val;
	const toWords = new ToWords();
	let value = useContext(User);
	function checkIfProps() {
		if (props.test == undefined || props.test == null) {
			val = {
				"cName": "",
				"date": "",
				"address": "",
				"amount": "",
				"redemptionAmount": "",
				"billNumber": "",
				"redemptionDate": "",
				"articleName": [],
				"metal":"",
				"remark": "",
				"contactNo": "",
				"gram": "",
				"mg": "",
				"presentValue": ""
			}
		}
		else {
			val = props.test;
			if (val.amount == null || val.amount == undefined || val.amount == '') {
				val.amount = 0;
			}
			else {
			}
			pledgeAmount = toWords.convert(parseInt(val.amount), { currency: true });
		}
	}

	checkIfProps();
	return (
		<div ref={ref} className="page-a4">
				<div style={{ "fontSize": "9pt", "padding": "2px 10px 0 10px"}} ><h4 style={{"textAlign":"center", "margin":"0px"}}> || SHRI NAKODA BHAIRAVAYA NAMAHA || </h4>
					<div className="bill-header" id="header">
						<div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center", "fontSize":"10pt" }}>
							<div className="logo" style={{ "display": "inline-block" }}></div>
							<div style={{ "display": "inline-block" }}>
								<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block", "textTransform":"capitalize" }}> {value.data.companyName} </h2></div>
								<div>{value.data.address} <br /> {value.data.area} <br/> Mobile: {value.data.contactNo ? value.data.contactNo : "9003223661"} </div>
							</div>
							<div style={{ "marginLeft": "auto", "lineHeight": "16px" }}>
								<h4 style={{ "marginBottom": "0px", "fontWeight": "bold" }}> {props.billType}</h4>
								<div> PAWN TICKET </div>
								<div> Form F Section 7 &amp; Rule 8 </div>
								<div> L.No. {value.data.license} </div>
							</div>
						</div>
					</div>
					<p> The following articles are pawned with me: </p>
					<table className="pledge-details" style={{"fontSize":"9pt"}}>
						<tbody>
							<tr>
								<td>Bill No</td>
								<td className='bold'>{val.billNumber}</td>
								<td>Pledge Date</td>
								<td className='bold'>{val.date == "" || val.date == undefined || val.date == null || val.date == "Invalid date" ? '' : moment(val.date).format('DD/MM/YYYY')}</td>
								<td>Mobile</td>
								<td className='bold'> {val.contactNo}</td>
								</tr>
							<tr>
								<td>Pawner's Name</td>
								<td className='bold'>{val.cName}</td>
								<td>Address</td>
								<td className='bold capitalize'>{val.address} {val.cityPincode ? val.cityPincode : "Chennai - 600 081"} </td>
								<td>ID Proof</td>
								<td className='bold'> {val.idProof}</td>
								
							</tr>
							<tr className="empty-child">
								<td>Principle of the loan amount</td>
								<td className='bold'>{val.amount}</td>
								<td style={{ "borderLeft": "1px solid #000" }}>Rupees in words</td>
								<td style={{ "borderLeft": "1px solid #000" }} className='bold'>{val.amount ? toWords.convert(parseInt(val.amount), { currency: true }) : ""} </td>
								<td>Old Bill No.</td>
								<td className='bold'> {val.oldBillNumber}</td>
							</tr>
							<tr>
							
								
							</tr>
						</tbody>
					</table>
					<p>
						( Rate of interest charged at 16% per annum. The time agreed upon for redemption of the article is 1 year. கடைசி தவணை 1 வருடம் 7 நாள் )
					</p>
					<table className="articles-table" style={{"fontSize":"9pt"}}>
						<tbody>
							<tr className="articles-table-header">
								<td style={{ "width": "80%", "borderLeft":"0px"}}>Particulars of the pledge</td>
								<td style={{ "padding": "0", "border":"0px" }}>
									<div style={{ "lineHeight": "21px" }}>Gross Wt</div>
									<div style={{ "width": "100%", "display": "table", "borderTop": "1px solid #000" }}>
										<div style={{ "padding": "0", "border": "0", "borderRight": "1px solid #000", "display": "inline-block", "width": "48%" }}>Gm</div>
										<div style={{ "padding": "0", "border": "0", "display": "inline-block", "width": "48%" }}>Mg</div>
									</div>
								</td>
							</tr>
							<tr className="articles-table-body">
								<td style={{ "width": "80%", "position":"relative" }}>
									<div style={{"position":"absolute", "width":"100%", "top":"0px", "left":"0px"}}>
									<ul className='article-lists'  style={{"fontSize":"9pt"}}>
										{val.articleName.length> 0 ?val.articleName.map((item, index) => {
											return <li>{item} - {val.metal} </li>
										}) : ""}
										
									</ul>
									</div>
								</td>
								<td style={{ "padding": "0" }}>
									<div style={{ "width": "100%", "display": "flex", "borderTop": "1px solid #000", "minHeight": "35px" }}>
										<div style={{ "padding": "0", "border": "0", "borderRight": "1px solid #000", "display": "inline-block", "width": "49.6%", "paddingTop": "15px" }} className='bold'>{val.gram}</div>
										<div style={{ "padding": "0", "border": "0", "display": "inline-block", "width": "48%", "paddingTop": "15px" }} className='bold'>{val.mg}</div>
									</div>
								</td>
							</tr>
							<tr className="articles-table-body">
								<td></td>
								<td style={{ "borderTop": "1px solid #000", "paddingBottom": "5px" }}><b>PRESENT VALUE</b></td>
							</tr>
							<tr className="articles-table-body">
								<td></td>
								<td style={{ "paddingBottom": "5px" }} className='bold'>{val.presentValue}</td>
							</tr>
						</tbody>
					</table>
					<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0", "borderBottom":"1px solid #000" }}>
						<div> Signature of pawn broker </div>
						<div style={{ "marginLeft": "auto" }}> Sign / LHTI of pawner </div>
					</div>
					<div className="redeemed-pi">
						<h4 style={{"margin": "7px 0px"}}> RECEIVED PRINCIPLE &amp; INTEREST </h4>
						<table style={{"borderBottom":"0px", "fontSize":"10pt"}}>
							<thead style={{ "textAlign":"center","textTransform":"uppercase","fontWeight":"bold" }}> 
								<tr>
									<td>No.</td>
									<td>Principle Amt</td>
									<td>RECEIVED TOTAL MONTH OF INT</td>
									<td>Date</td>
									<td>Signature</td>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td style={{ "textAlign":"center" }}>1</td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>
								<tr>
									<td style={{ "textAlign":"center" }}> 2</td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>
								<tr>
									<td style={{ "textAlign":"center" }}>3</td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>
								<tr>
									<td style={{ "textAlign":"center" }}>4</td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>
								<tr>
									<td style={{ "textAlign":"center" }}>5</td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>
								<tr>
									<td style={{ "textAlign":"center" }}>6</td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>
							</tbody>
						</table>
					</div>
					<p style={{ "fontWeight": "bold", "textAlign": "center", "fontSize": "16px", "margin":"7px 0px"}}>Terms &amp; Conditions</p>
					<ol className="tos">
						<li> The rate of interest on any pledge shall be 16% per annum simple interest that is to say one paise per one rupees per mensum simple interest. </li>
						<li> Every pledge shall be redeemable within a period of one year of such longer period ass may be provided in the contract between the parties from the day of powing (exclusive of that day) and shall continue to be redeemable during seven days of
							grace following the said period. A pledge shall further continue to be redeemable until it is disposed of as provided in tha Act althrough the period of
							redemption and says of grace have expired. </li>
						<li> A pawn may be in addition to the cost of revenue stamp demand and take from the pawner sum not exceeding 25 paise for any loan not exceeding rupees 250 and 50 paise
							for and loan exceeding Rs. 250 for incidental expenses connected with the advances of such loan. </li>
						<li> The pawn broker empowered to reledge the jewels with any bank or bankers. </li>
						<li> The pawner shall communicate his change of address in writing and the article will be delivered the next day of payment. </li>
						<li>The pawner should pay the interest once in 3 months. Failure to pay interest once in 3 months will fall in compund interest for every three months failure.</li>
					</ol>
					<p style={{ "fontSize": "12px", "lineHeight": "18px" }} >
						3 மாதத்திற்கு ஒரு முறை தவறாமல் வட்டி கட்ட வேண்டும். இன்று பணம் காட்டினாள் மறு நாள் பொருள் கொடுக்கப்படும்.
						நகை மீட்க வரும் போது இந்த ரசீதை கொண்டு வரவும். வீடு மாறினாலும், ரசித்து தவறினாலும் எங்களுக்கு தெரிவிக்க வேண்டும் .
						தவறினால் நாங்கள் ஜவாப்தரியல்ல. கடைசி தவணை 1 வருடம் 7 நாட்கள். பிரதி வெள்ளிக்கிழமை விடுமுறை.
					</p>
					<p style={{ "fontSize": "12px", "lineHeight": "18px" }}>
						இந்த ரசீது கொண்டு வரும் நபர் ______________ <br />
						வசம் முன்னாள் கண்ட பொருளை / பொருட்களை தயவு செய்து கொடுத்து விடும்படி கேட்டுக்கொள்கிறேன். <br />
						அடகு பொருளை வைத்தவர் கையெழுத்து ________________ <br />
						பொருள் வாங்குபவரின் கையெழுத்து ______________ <br />
					</p>
					<div className="bill-footer">
						<div> Working hours: 9:00 AM to 9:00 PM </div>
						<div> Every Friday &amp; other important festival days </div>
					</div>
				</div>
		</div>
	);
}
);

export default PledgeBill;