import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import './App.css';
import {Link } from 'react-router-dom';
import axios from 'axios';
import EditEntryModal from './editEntryModal.js';
import FilterEntries from './searchEntry.js';
import fileDownload from 'js-file-download';
import ReactToPrint from "react-to-print";
import PledgeBill from './pledgeBill.js';
import DeliveryNote from './deliveryNote.js';
import moment from 'moment';
import Pagination from './components/pagination';
import _ from 'lodash';
import { ToWords } from 'to-words';
import { User } from './userContext.js';
import NavBar from './navBar.js';
let PageSize = 30, finalAmount;
const toWords = new ToWords();
const AllUserEntries = (props, ref) => {
	const [entries, fetchUserEntries] = useState([]);
	const [allEntries, saveAllEntries] = useState();
	const [editId, setEditModalId] = useState();

	// Delete Entry States
	const [deleteModal, isDeleteModal] = useState(false);
	const [delId, setDelId] = useState();
	const [deleteEntry, confirmDeletion] = useState(false);

	const [filterRedeemed, setFilterRedeemed] = useState([]);
	const[filtering, setSearchFiltering] = useState([]);

	let value = useContext(User);

	let componentRef = useRef();
	const billPrint = useRef({});
	const note = useRef({});

	// Jump to page in pagination
	let jumpNo;
	const [jumpPage, setJumpPage] = useState();
	function handleChange(e) {
		console.log(e.key);
		jumpNo = e.target.value;
		if (jumpNo == "" || jumpNo == null || jumpNo == undefined) {
			jumpNo = 1;
		}
	}

	const getLists = () => {
		axios.get("http://localhost:4000/customers/get-result", { params: { createdBy: value.data.userName } })
			.then(response => {
				fetchUserEntries(response.data);
				saveAllEntries(response.data);
			});
	};
	const [deliveryNumber, setDeliveryNumber] = useState();
	let len, allDelivery = [];
	const setDeliveryReceiptNumber = () => {
		entries.map(function (ele, i) {
			allDelivery.push(ele.deliveryRecNum);
		})
		// Remove duplicates from array, sort in ascending order and filter to remove null &undefined values from array
		let lastNumber = [...new Set(allDelivery)].sort(function(a, b){return a - b}).filter(item => !!item)	
			let arrlen = (lastNumber[lastNumber.length - 1]);
			// If there is existing delivery Receipt Number, add 1 to generate new delivery number, else set as 1
			if(arrlen){
				setDeliveryNumber(parseInt(arrlen) + 1);;
			}
		else { setDeliveryNumber(1); }
	}

	const[filterAllRedeemed, setFilterAllRedeemed] = useState();
	const setEntries = () => {
		console.log("calling set entries fn");
		setFilterRedeemed(entries.filter((entry) => entry.redemptionDate));
		setFilterAllRedeemed(entries.filter((entry) => entry.redemptionDate));
	}

	// filter only redeemed entries
		 let filtered= entries.filter((entry) => entry.redemptionDate);
	

	let amount = [], tAmount = 0, redemptionAmount = [], reAmount = 0;
	const [totalAmount, setTotal] = useState();
	const [redemAmount, setRedemAmount] = useState();
	const [diffAmount, setDifference] = useState();
	const isFirstRender = useRef(true);

	const getTotals = () => {
		if (allEntries.length > 0) {
			const newArr = allEntries.map(function (ele, i) {
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
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return
		}
		getTotals();
		getDifference();
	}, [allEntries, totalAmount, redemAmount]);

	const editData = (id) => {
		showEditModal(true);
		setEditModalId(id);
		setCloseModal("open");
	}

	// save reference id for entry deletion
	const [entryId, setEntryId] = useState();

	// Show delete entry confirmation modal poopup
	const deleteDataConfirmation = (id) => {
		axios.get("http://localhost:4000/customers/update-student/" + id).then(res => {
			setDelId(res.data.billNumber);
			isDeleteModal(true);
			setEntryId(id);
		});
	}

	// Cancel delete entry
	const cancelDelete = () => {
		isDeleteModal(false);
		setDelId('');
	}

	// If delete modal is confirmed, then delete the modal
	const deleteData = (id) => {
		axios.delete('http://localhost:4000/customers/delete-student/' + id)
			.then((res) => {
				// console.log('Student successfully deleted!');
				getLists();
				setEntryId('');
			}).catch((error) => {
				console.log(error)
			})
	}

	useEffect(() => {
		if (deleteEntry) {
			deleteData(entryId);
			cancelDelete();
			confirmDeletion(false);
		}
	}, [deleteEntry]);


	const [pledge, setPledgeData] = useState();
	const [hidePledge, SetHideState] = useState(true);
	function handleBeforePrint(dataContent) {
		console.log("onBeforePrint", dataContent);
		setPledgeData(dataContent);
	};

	const [billDetails, pledgeBillDetails] = useState([]);
	const [printPledge, isPrintingPledge] = useState(false);
	const printBill = (cont) => {
		pledgeBillDetails(cont);
		isPrintingDelivery(false);
		isPrintingPledge(true);
		window.print();
	}

	window.onafterprint = (event) => {
		isPrintingPledge(false);
		isPrintingDelivery(false);
	};

	const [deliveryNt, setDeliveryNote] = useState([]);
	const [printDelivery, isPrintingDelivery] = useState(false);
	let today = moment(new Date()).format('DD/MM/YYYY')
	const printDeliveryNote = (cont) => {
		setDeliveryNote(cont);
		isPrintingPledge(false);
		isPrintingDelivery(true);
		window.print();
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
		finalAmount = amount + interest;
		return Math.abs(interest).toFixed(2);

	}

	const [art, articleBox] = useState(false);
	function showArticleList() {
		articleBox(true);
	}
	const renderArticleList = (lt) => {
		let list = lt.map(function (list, index) {
			return (
				<li key={"list" + index}> {list} </li>
			)
		});
		return list;
	}

	const [isDelivery, setIsDeliveryNote] = useState(false);


	const DeliveryNote = () => {
		return (
			<div id="delivery-note" className="page-a4">
				<h2 className="text-centre"> DELIVERY NOTE </h2>
				<div className="bill-header" id="header">
						<div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center", "fontSize": "10pt", "alignItems":"start"}}>
							<div className="logo" style={{ "display": "inline-block" }}></div>
							<div style={{ "display": "inline-block" }}>
								<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block", "textTransform":"capitalize" }}> {value.data.companyName} </h2></div>
								<div>{value.data.address} <br /> {value.data.area} <br/> Mobile: {value.data.contactNo ? value.data.contactNo : "9003223661"} </div>
							</div>
							<div style={{ "marginLeft": "auto", "lineHeight": "16px" }}>
								<div> L.No. {value.data.license} </div>
							</div>
						</div>
					</div>
				<p> பெயர் <span className="content-spacer"> {deliveryNt.cName} </span> எண் <span className="content-spacer"> </span> </p>
				<p> ரசீது எண் <span className="content-spacer"> {deliveryNt.billNumber} </span> வைத்த  தேதி <span className="content-spacer"> </span>
					இந்த ரசீதில் கண்ட பொருள்களை ரசீது இல்லாமல் பூராவும் பெற்று கொண்டேன் </p>
				<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0", "alignItems":"end" }}>
					<div style={{"width":"80%"}}> 
				<table className="articles-table" style={{"fontSize":"10pt"}}>
						<tbody>
							<tr className="articles-table-header">
								<td style={{ "width": "80%","borderLeft":"0px" }}>Particulars of the pledge</td>
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
									<ul className='article-lists'  style={{"fontSize":"10pt"}}>
										 {deliveryNt && deliveryNt.articleName.length> 0 ?deliveryNt.articleName.map((item, index) => {
											return <li>{item} - {deliveryNt.metal} </li>
										}) : ""} 
										
									</ul>
								</td>
								<td style={{ "padding": "0","position":"relative" }}>
									
									<div style={{ "width": "100%", "display": "flex", "borderTop": "1px solid #000", "position": "absolute", "top":"0px", "height":"100%"}}>
										<div style={{ "padding": "0", "border": "0", "borderRight": "1px solid #000", "display": "inline-block", "width": "49.5%", "paddingTop": "15px" ,"flex":"1"}} className='bold'>{deliveryNt.gram}</div>
										<div style={{ "padding": "0", "border": "0", "display": "inline-block", "width": "48%", "paddingTop": "15px", "flex":"1"}} className='bold'>{deliveryNt.mg}</div>
									</div>
								</td>
							</tr>
													</tbody>
					</table>
					</div>
					<div style={{ "marginLeft": "auto" , "textAlign":"right"}}>
						 <span>இப்படிக்கு</span>
						<span style={{"display":"inline-block", "paddingTop":"50px"}}>கையொப்பம்</span> </div>
				</div>
				<p style={{ "lineHeight": "27px" }}>
					THE AMOUNT OF EVERY PAYMENT RECEIVED TOWARDS LOAN DATE
					<span className="content-spacer">
						{deliveryNt.date == "" || deliveryNt.date == undefined || deliveryNt.date == null || deliveryNt.date == "Invalid date" ? '' : moment(deliveryNt.date).format('DD/MM/YYYY')}</span>
					FOR PRINCIPLE <span className="content-spacer"> {deliveryNt.amount}</span> FOR INTEREST </p>
				<p style={{ "lineHeight": "27px" }}> I HAVE THIS DAY PAID RS <span className="content-spacer"> {deliveryNt.amount} </span>
					TOWARDS PRINCIPLE &amp; RS <span className="content-spacer"> {calculateInterest(deliveryNt.date, deliveryNt.amount)} </span> TOWARDS INTEREST &amp; RECEIVED THE ARTICLE MENTIONED OVER LEAF WITH FULL
					MANUFACTION </p>
				

				<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0", "alignItems": "center" }}>
					<div>
						<div> Date: <span className="content-spacer"> {today} </span> </div>
						<div style={{ "paddingTop": "15px" }}> Delivery Receipt No: <span className="content-spacer">
							{deliveryNumber}
							 </span> </div>
					</div>
					<div style={{ "marginLeft": "auto" }}> Total: <span className="content-spacer"> 
					{finalAmount} </span> </div>
				</div>
				<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0" }}>
					<div style={{ "marginLeft": "auto" }}> Signature or Thumb Impression of the Pawner </div>
				</div>
			</div>
		)
	}
	const PledgeBill = () => {
		return (
			<div id="pledgeBill" className="page-a4">
				<h4 style={{"textAlign":"center", "margin":"0px", "fontSize":"10pt", "lineHeight":"14px"}}> || SHRI NAKODA BHAIRAVAYA NAMAHA || </h4>
				<div >
					<div className="bill-header" id="header">
						<div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center", "fontSize": "10pt" }}>
							<div className="logo" style={{ "display": "inline-block" }}></div>
							<div style={{ "display": "inline-block" }}>
								<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block", "textTransform":"capitalize" }}> {value.data.companyName} </h2></div>
								<div>{value.data.address} <br /> {value.data.area} <br/> Mobile: {value.data.contactNo ? value.data.contactNo : "9003223661"} </div>
							</div>
							<div style={{ "marginLeft": "auto", "lineHeight": "16px" }}>
								<h4 style={{ "marginBottom": "0px", "fontWeight": "bold" }}> DUPLICATE BILL</h4>
								<div> PAWN TICKET </div>
								<div> Form F Section 7 &amp; Rule 8 </div>
								<div> L.No. {value.data.license} </div>
							</div>
						</div>
					</div>
					 <p> The following articles are pawned with me: </p> 
					<table className="pledge-details" style={{"fontSize":"10pt"}}>
						<tbody>
						<tr>
								<td>Bill No.</td>
								<td className='bold'>{billDetails.billNumber}</td>
								<td>Pledge Date</td>
								<td className='bold'> {billDetails.date == "" || billDetails.date == undefined || billDetails.date == null || billDetails.date == "Invalid date" ? '' : moment(billDetails.date).format('DD/MM/YYYY')} </td>
								<td>Mobile No.</td>
								<td className='bold'>{billDetails.contactNo}</td>
								
							</tr>
							<tr>
								<td>Pawner's Name</td>
								<td className='bold'>{billDetails.cName}</td>
								<td>Address</td>
								<td className='bold capitalize' >{billDetails.address} {billDetails.cityPincode ? billDetails.cityPincode : "chennai 600-081"} </td>
								<td>Identity Proof</td>
								<td className='bold'> {billDetails.idProof}</td>
							</tr>
														
							<tr className="empty-child">
							<td>Principle of the loan amount</td>
								<td className='bold'>{billDetails.amount}</td>
								<td style={{ "borderLeft": "1px solid #000" }}>Rupees in words</td>
								<td style={{ "borderLeft": "1px solid #000" }} className='bold'>{billDetails.amount ? toWords.convert(parseInt(billDetails.amount), { currency: true }) : ""} </td>
								<td>Old Bill No.</td>
								<td className='bold'> {billDetails.oldBillNumber}</td>
							</tr>
							<tr>
								
								
								
							</tr>
						</tbody>
					</table>
					<p>
						( Rate of interest charged at 16% per annum. The time agreed upon for redemption of the article is 1 year. கடைசி தவணை 1 வருடம் 7 நாள் )
					</p>
					<table className="articles-table" style={{"fontSize":"10pt"}}>
						<tbody>
							<tr className="articles-table-header">
								<td style={{ "width": "80%" }}>Particulars of the pledge</td>
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
									<ul className='article-lists'  style={{"fontSize":"10pt"}}>
										{billDetails.articleName.length> 0 ?billDetails.articleName.map((item, index) => {
											return <li>{item} - {billDetails.metal} </li>
										}) : ""}
										
									</ul>
									</div>
								</td>
								<td style={{ "padding": "0" }}>
									<div style={{ "width": "100%", "display": "flex", "borderTop": "1px solid #000", "minHeight": "55px" }}>
										<div style={{ "padding": "0", "border": "0", "borderRight": "1px solid #000", "display": "inline-block", "width": "49.5%", "paddingTop": "15px" }} className='bold'>{billDetails.gram}</div>
										<div style={{ "padding": "0", "border": "0", "display": "inline-block", "width": "48%", "paddingTop": "15px" }} className='bold'>{billDetails.mg}</div>
									</div>
								</td>
							</tr>
							<tr className="articles-table-body">
								<td></td>
								<td style={{ "borderTop": "1px solid #000", "paddingBottom": "5px" }}><b>PRESENT VALUE</b></td>
							</tr>
							<tr className="articles-table-body">
								<td></td>
								<td style={{ "paddingBottom": "5px" }} className='bold'>{billDetails.presentValue}</td>
							</tr>
						</tbody>
					</table>
					<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0", "borderBottom":"1px solid #000" }}>
						<div> Signature of pawn broker </div>
						<div style={{ "marginLeft": "auto" }}> Sign / LHTI of pawner </div>
					</div>
					
					<p style={{ "fontWeight": "bold", "textAlign": "center", "fontSize": "16px", "margin":"7px 0px" }}>Terms &amp; Conditions</p>
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
					<div className="bill-footer">
						<div> Working hours: 9:00 AM to 9:00 PM </div>
						<div> Every Friday &amp; other important festival days </div>
					</div>
				</div>
			</div>
		)
	}
	// Default page state with pagination
	const RenderTableData = () => {
		let data = currentTableData.map(function (data, idx) {
			
			return (
				<ul className="table-body" key={data._id}>
					<li>{data.cName}</li>
					<li style={{ "textAlign": "left", "paddingLeft": "10px" }}>
						{data.address}
						{data.contactNo == "" || data.contactNo == undefined || data.contactNo == null ? "" : <div className="contact-number"> {data.contactNo} </div>}
					</li>
					<li>{data.date == "" || data.date == undefined || data.date == null || data.date == "Invalid date" ? '' : moment(data.date).format('DD/MM/YYYY')} </li>
					<li>{data.billNumber}</li>
					<li>{data.amount}</li>
					<li>
						<div style={{ "position": "relative" }} className="showMore"> {data.articleName[0]}
							<ul className="all-articles">
								{renderArticleList(data.articleName)}
							</ul>
						</div>
					</li>
					<li> {data.gram}.{data.mg} </li>
					<li style={{ "color": "red" }}>
						{data.redemptionDate == "" || data.redemptionDate == undefined || data.redemptionDate == null || data.redemptionDate == "Invalid date" ? '' : moment(data.redemptionDate).format('DD/MM/YYYY')} </li>
					{/* <li>{data.remark}</li> */}
					<li> {data.redemptionAmount} </li>
					<li className="actions">
						<button onClick={() => printDeliveryNote(data)} className="deliveryNote-icon">DLY</button>
						<button onClick={() => editData(data._id)} className="edit-icon"></button>
						<button onClick={() => deleteDataConfirmation(data._id)} className="delete-icon"></button>
						<button onClick={() => printBill(data)} className="print-icon"></button>
					</li>
				</ul>
			);
		});
				return data
	}

	// Show only search result
	
	const RenderSearchData = () => {
		
		let data = filterRedeemed.filter((ele) => ele.cName.toLowerCase() == searchText.toLowerCase() || ele.billNumber == searchText || ele.address.toLowerCase().includes(searchText.toLowerCase())).map(function (data, idx) {
			return (
				<ul className="table-body" key={data._id}>
					<li>{data.cName}</li>
					<li style={{ "textAlign": "left", "paddingLeft": "10px" }}>
						{data.address}
						{data.contactNo == "" || data.contactNo == undefined || data.contactNo == null ? "" : <div className="contact-number"> {data.contactNo} </div>}
					</li>
					<li>{data.date == "" || data.date == undefined || data.date == null || data.date == "Invalid date" ? '' : moment(data.date).format('DD/MM/YYYY')} </li>
					<li>{data.billNumber}</li>
					<li>{data.amount}</li>
					<li>
						<div style={{ "position": "relative" }} className="showMore"> {data.articleName[0]}
							<ul className="all-articles">
								{renderArticleList(data.articleName)}
							</ul>
						</div>
					</li>
					<li> {data.gram}.{data.mg} </li>
					<li style={{ "color": "red" }}>
						{data.redemptionDate == "" || data.redemptionDate == undefined || data.redemptionDate == null || data.redemptionDate == "Invalid date" ? '' : moment(data.redemptionDate).format('DD/MM/YYYY')} </li>
					<li>{data.remark}</li>
					<li className="actions">
						<button onClick={() => printDeliveryNote(data)} className="deliveryNote-icon">DLY</button>
						<button onClick={() => editData(data._id)} className="edit-icon"></button>
						<button onClick={() => deleteDataConfirmation(data._id)} className="delete-icon"></button>
						<button onClick={() => printBill(data)} className="print-icon"></button>
					</li>
				</ul>
			);
		});
		return data
	}
	const [data, fetchData] = useState();
	const [editModal, showEditModal] = useState(false);
	const [search, setSearchVal] = useState();
	const [closeModal, setCloseModal] = useState();
	// State for checking if search is clicked by user
	const [isSearch, setIsSearching] = useState(false);
	const [searchText, setSearchText] = useState();

	let filteredEntry;

	function callbackFunction(childData) {
		console.log('child Data', childData)
		setSearchVal(childData);
		// setFilterRedeemed(filtered);
		if (childData == "clear") {
			setIsSearching(false);
			getLists();
			//setFilterRedeemed(filtered);
			setSearchFiltering([]);
		}
		else {
			setSearchText(childData.trim());
			setIsSearching(true);
			setFilterRedeemed(filterAllRedeemed.filter((ele) => ele.cName.toLowerCase() == childData.toLowerCase() || ele.billNumber == childData || ele.address.toLowerCase().includes(childData.toLowerCase())));
			//setSearchFiltering(data);
		}
	}

	function setModalStatus(modalStat) {
		setCloseModal(modalStat);
		setIsDeliveryNote(false);
	}

	const downloadData = async () => {
		const fileName = "entriesCopy";
		const json = JSON.stringify(entries);
		const blob = new Blob([json], { type: 'application/json' });
		const href = await URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = href;
		link.download = fileName + ".json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

	}
	useEffect(() => {
		getLists();
		// setEntries()
	}, [data, closeModal]);

	useEffect(() => {
		if(entries){
			setEntries()
		}
		
	}, [entries]);
	// pagination logic
	const [currentPage, setCurrentPage] = useState(1);
	const currentTableData = useMemo(() => {
		console.log(isSearch);
		const firstPageIndex = (currentPage - 1) * PageSize;
		const lastPageIndex = firstPageIndex + PageSize;
		console.log(filterRedeemed.length);
		return filterRedeemed.slice(firstPageIndex, lastPageIndex);
	}, [currentPage, filterRedeemed, isSearch]);
	
 
	return (
		<>
		 <NavBar page="redeemed" />
			{printDelivery ? <DeliveryNote /> : ""}
			{printPledge ? <PledgeBill /> : ""}
			<div className="entry-content">
				<div style={{ "display": "flex" }}>
					<FilterEntries parentCallback={callbackFunction} />
					<div style={{ "marginLeft": "auto" }}>
						<button onClick={downloadData} style={{ "marginRight": "15px" }}> Download </button>
						<ReactToPrint
							trigger={() => <button>Print</button>}
							content={() => componentRef}
						/>
					</div>
				</div>
				{filterRedeemed.length >= PageSize ? <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "end" ,"marginTop":"15px"}}>
					<input type="number" className="jumpPage" onChange={handleChange} onKeyPress={(e) => {
						if (e.key === "Enter") {
							setCurrentPage(Number(jumpNo));
						}
					}} />
					<Pagination
						className="pagination-bar"
						currentPage={currentPage}
						totalCount={filterRedeemed.length}
						pageSize={PageSize}
						onPageChange={page => setCurrentPage(page)}
					/>
				</div> : '' }
				{entries && entries.length ?
					<div style={{ "display": "table", "width": "100%", "marginTop":"15px" }} ref={el => (componentRef = el)} >
						<ul className="table-header" style={{ "fontWeight": "bold" }}>
							<li>Name</li>
							<li>Address</li>
							<li>Date</li>
							<li>Bill No.</li>
							<li>Amount</li>
							<li>Article Name</li>
							<li> Weight </li>
							<li style={{ "color": "red" }}>Redemption Date</li>
							<li>Remark</li>
							<li className="actions">Actions</li>
						</ul>
						<RenderTableData />
						{/* {isSearch ? <RenderSearchData /> : <RenderTableData />} */}
					</div>
					: <h3 style={{ "marginTop": "50px", "textAlign": "centre" }}> Loading... </h3>}
				{editModal && closeModal == "open" ? <EditEntryModal toEdit={editId} delivery={isDelivery} parentModalCallBack={setModalStatus} /> : ''}


				{deleteModal ?
					<>
						<div className="page-overlay"></div>
						<div className="delete-modal">
							<button className="close-modal" onClick={cancelDelete} ></button>
							<p> Are you sure you want to delete entry with Bill No: <strong> {delId} </strong> </p>
							<button onClick={() => confirmDeletion(true)}> Yes </button>
							<button onClick={cancelDelete}> No </button>
						</div>
					</>
					: ''}
			</div>
		</>
	)
}

export default AllUserEntries;
