import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import EditEntryModal from './editEntryModal.js';
import FilterEntries from './searchEntry.js';
import fileDownload from 'js-file-download';
import ReactToPrint from "react-to-print";
import moment from 'moment';
import Pagination from './components/pagination';
import _ from 'lodash';
import { ToWords } from 'to-words';
import { User } from './userContext.js';
import NavBar from './navBar.js';
import BookDataService from "./services/entries.services.js";

let PageSize = 30, finalAmount;
const toWords = new ToWords();
const AllUserEntries = (props, ref) => {
	const [entries, fetchUserEntries] = useState([]);
	const [allEntries, saveAllEntries] = useState();
	const [editId, setEditModalId] = useState();
	const [redData, setRedemptionDate] = useState();

	// Delete Entry States
	const [deleteModal, isDeleteModal] = useState(false);
	const [delId, setDelId] = useState();
	const [deleteEntry, confirmDeletion] = useState(false);

	let value = useContext(User);

	const redemDate = useRef(moment(new Date()).format('YYYY-MM-DD'));
	const principleAmount = useRef();
	const interest = useRef();
	const date= useRef();

	// Jump to page in pagination
	let jumpNo;
	const [jumpPage, setJumpPage] = useState();
	function handleChange(e) {
		jumpNo = e.target.value;
		if (jumpNo == "" || jumpNo == null || jumpNo == undefined) {
			jumpNo = 1;
		}
	}

	let componentRef = useRef();
	const billPrint = useRef({});
	const note = useRef({});

	const updateRedemptionDate = (e) => {
		setRedemptionDate({ [e.target.name]: e.target.value })
	};

	const [inputVal, setInputValue] = useState();
	const [principleInterest, setPrincipleInterest] = useState(false);
	const[principleDetails, setPrincipleDetails] = useState();
	const [newPrinciple, setNewPrinciple] = useState();

	const handlePrincipleChange = (e)  => {
		const val = e.target.value;
		const updated = {...newPrinciple, [e.target.name]: val}
		setNewPrinciple(updated);
		
	}

	const updatePrinciple = (data) => {
		console.log(data.principle);
		setPrincipleInterest(true);
		setInputValue(data);
		setPrincipleDetails(data.principle);
		
	}

	const savePrincipleDetails = useCallback (async(e) => {
		const updated = [...principleDetails, newPrinciple];
		console.log('principleDetails', updated, newPrinciple);
		// e.preventDefault();
		await axios.patch('http://localhost:4000/customers/update-student/' + inputVal._id, {"principle": updated}, { headers: { 'Content-Type': 'application/json' } })
			.then(res => {
				console.log(res.data);
				setPrincipleDetails(updated);
			});
			getLists();
			setPrincipleInterest(false);
	}, [newPrinciple]);

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

	const [filterUnredeemed, setfilterUnredeemed] = useState([]);
	const [allUnredeemed, setAllUnredeemed] = useState([]);
	const [findYear, setFindYear] = useState([]);

	let filterUnredeem = [], getYear = [], years = [];
	const filterUnreedemedEntry = () => {
		filterUnredeem = entries.filter((entry) => !entry.redemptionDate);
		years = filterUnredeem.map(function (ele, i) {
			// Push date to array only if its valid date
			if (new Date(ele.date).getFullYear()) {
				getYear.push(new Date(ele.date).getFullYear());
			}
		})
		setFindYear([...new Set(getYear)]);
		// Remove all duplicate Years
		// Setting a state, to acheive filter by year and not change the original state
		setAllUnredeemed(filterUnredeem);
		setfilterUnredeemed(filterUnredeem);
	}

	const [selectYear, setSelectYear] = useState("All");

	const handleYearChange = (e) => {
		setSelectYear(e.target.value);
		// Pass year and search text, so that pagination doesn't conflict
		setYear(e.target.value, searchText);
	};

	let selectYr;
	const setYear = (selectYear, searchText) => {
		selectYr = selectYear;
		if (searchText) {
			if (selectYr == "all") {
				// set state to default entries, if all is clicked
				let filterYear = allUnredeemed.filter((entry) => entry.cName.toLowerCase() == searchText.toLowerCase() || entry.billNumber == searchText);
				setfilterUnredeemed(filterYear);
			}
			else if (selectYr == "noDate") {
				// All unredeemed entries with no date
				let filterYear = allUnredeemed.filter((entry) => (entry.date == null || entry.date == undefined || entry.date == "" || entry.date == "Invalid date") && (entry.cName.toLowerCase() == searchText.toLowerCase() || entry.billNumber == searchText));
				setfilterUnredeemed(filterYear);
			}
			else {
				// Filter entries by selected year
				let filterYear = allUnredeemed.filter((entry) => (new Date(entry.date).getFullYear() == selectYr) && (entry.cName.toLowerCase() == searchText.toLowerCase() || entry.billNumber == searchText));
				setfilterUnredeemed(filterYear);

			}
		}
		else {
			if (selectYr == "noDate") {
				// All unredeemed entries with no date
				let filterYear = allUnredeemed.filter((entry) => (entry.date == null || entry.date == undefined || entry.date == "" || entry.date == "Invalid date"));
				setfilterUnredeemed(filterYear);
			}
			else {
				// Filter entries by selected year
				let filterYear = allUnredeemed.filter((entry) => (new Date(entry.date).getFullYear() == selectYr));
				setfilterUnredeemed(filterYear);

			}
		}
	}

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
		filterUnreedemedEntry();
	}, [allEntries, totalAmount, redemAmount]);

	// Get last bill number, after data is fetched
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return
		}
		else if (entries.length) {
			setDeliveryReceiptNumber();
		}
	}, [entries]);

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

	const transferEntry = async (e) => {
		e.preventDefault();
		console.log(redemptionDetails);
		await axios.put('http://localhost:4000/customers/update-student/' + redemptionDetails._id, {
			...redemptionDetails, "deliveryRecNum": deliveryNumber
		}, { headers: { 'Content-Type': 'application/json' } })
			.then(res => {
				setToRedeemed(false);
				console.log(res.data);
				getLists();
			});
	}

	// Cancel delete entry
	const cancelDelete = () => {
		isDeleteModal(false);
		setToRedeemed(false);
		setPrincipleInterest(false);
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

	const [billDetails, pledgeBillDetails] = useState([]);
	const [printPledge, isPrintingPledge] = useState(false);
	const printBill = (cont) => {
		pledgeBillDetails(cont);
		isPrintingDelivery(false);
		isPrintingPledge(true);
		setTimeout(function(){
			window.print();
		}, 100);
	}

	const [deliveryNt, setDeliveryNote] = useState([]);
	const [printDelivery, isPrintingDelivery] = useState(false);
	const[moveRedeem, setMoveRedeem] = useState(false);
	let today = moment(new Date()).format('DD/MM/YYYY')
	const printDeliveryNote = (cont) => {
		setDeliveryNote(cont);
		isPrintingPledge(false);
		isPrintingDelivery(true);
		setMoveRedeem(true);
		setTimeout(function(){
			window.print();
		}, 100);
	}

	window.onafterprint = (event) => {
		isPrintingPledge(false);
		if(moveRedeem){
			isPrintingDelivery(false);
			setMoveRedeem(false);
			MoveToRedeemEntry(deliveryNt);
		}
	};


	const [redeemEntry, setToRedeemed] = useState(false);
	const [redemptionDetails, setRedemptionDetails] = useState();

	const MoveToRedeemEntry = (data) => {
		setToRedeemed(true);
		let updated = {
			"redemptionDate": new Date(),
			"redemptionAmount": data.amount,
			"interest": calculateInterest(data.date, data.amount)
		}
		setRedemptionDetails({ ...data, "redemptionAmount": data.amount, "interest": calculateInterest(data.date, data.amount), "redemptionDate": new Date()});
	}

	// function calculateInterest(date1, amount) {
	// 	const diffTime = new Date().getTime() - new Date(date1).getTime();
	// 	const diffDays = diffTime / (1000 * 60 * 60 * 24);
	// 	let months = parseInt(diffDays / 30);
	// 	let interest;
	// 	// If pledge and redemption date are same, set month as 1 (get one months interest)
	// 	if (diffTime == 0) {
	// 		interest = (amount * 1.33) / 100;
	// 	}
	// 	// if current date is less or equal to the loan data, subtract a month
	// 	else if(new Date().getDate() <= new Date(date1).getDate()){
	// 		interest = (amount * (months - 1) * 1.33) / 100;
	// 	}
	// 	else {
	// 		interest = (amount * months * 1.33) / 100;
	// 	}
	// 	// Check if its valid number, because sometimes date is not defined
	// 	if (interest) {
	// 		return interest;
	// 	}
	// 	else {
	// 		return 0;
	// 	}
	// }

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
	  
		if (redeemDate.getDate() < new Date(date1).getDate()) {
		dateDiff = 1;
		}
		else { dateDiff = 0}

		diffMonth = monthDiff + yearDiff * 12	
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

	// pagination logic
	const [currentPage, setCurrentPage] = useState(1);
	const currentTableData = useMemo(() => {
		const firstPageIndex = (currentPage - 1) * PageSize;
		const lastPageIndex = firstPageIndex + PageSize;
		return filterUnredeemed.slice(firstPageIndex, lastPageIndex);
	}, [currentPage, filterUnredeemed]);

	const DeliveryNote = () => {
		return (
			<div id="delivery-note" className="page-a4">
				<h4 style={{"textAlign":"center", "margin":"0px"}}> || SHRI NAKODA BHAIRAVAYA NAMAHA || </h4>
				<h2 className="text-centre"> DELIVERY NOTE </h2>
				<div className="bill-header" id="header">
					<div className="logo" style={{ "display": "inline-block", "verticalAlign": "middle" }}></div>
					<div style={{ "display": "inline-block", "verticalAlign": "middle" }}>
						<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block" }}> {value.data.companyName} </h2></div>
						<div>{value.data.address} <br /> {value.data.area} <br/> Mobile: {value.data.contactNo} </div>
					</div>

				</div>
				<p> பெயர் <span className="content-spacer"> {deliveryNt.cName} </span> எண் <span className="content-spacer"> </span> </p>
				<p> ரசீது எண் <span className="content-spacer"> {deliveryNt.billNumber} </span> வைத்த  தேதி <span className="content-spacer"> </span>
					இந்த ரசீதில் கண்ட பொருள்களை ரசீது இல்லாமல் பூராவும் பெற்று கொண்டேன் </p>
				<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0" }}>
					<div style={{ "marginLeft": "auto" }}>
						இப்படிக்கு <br /> <br /> <br />  <br />  <br />
						கையொப்பம் </div>
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
			<div id="pledgeBill">
				<h4 style={{"textAlign":"center", "margin":"0px"}}> || SHRI NAKODA BHAIRAVAYA NAMAHA || </h4>
				<div style={{ "fontSize": "14px", "position":"relative"}}  className="page-a4">
					<div className="bill-header" id="header">
						<div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center" }}>
							<div className="logo" style={{ "display": "inline-block" }}></div>
							<div style={{ "display": "inline-block" }}>
								<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block", "textTransform":"capitalize" }}> {value.data.companyName} </h2></div>
								<div>{value.data.address} <br /> {value.data.area} <br/> Mobile: {value.data.contactNo} </div>
							</div>
							<div style={{ "marginLeft": "auto", "lineHeight": "18px" }}>
								<h4 style={{ "marginBottom": "0px", "fontWeight": "bold" }}> DUPLICATE BILL</h4>
								<div> PAWN TICKET </div>
								<div> Form F Section 7 &amp; Rule 8 </div>
								<div> L.No. {value.data.license} </div>
							</div>
						</div>
					</div>
					<p> The following articles are pawned with me: </p>
					<table className="pledge-details">
						<tbody>
							<tr>
								<td>Bill No</td>
								<td className='bold'>{billDetails.billNumber}</td>
								<td>Pledge Date</td>
								<td className='bold'>{billDetails.date == "" || billDetails.date == undefined || billDetails.date == null || billDetails.date == "Invalid date" ? '' : moment(billDetails.date).format('DD/MM/YYYY')}</td>
								<td>Mobile</td>
								<td className='bold'> {billDetails.contactNo}</td>
							</tr>
							<tr>
								<td>Name of the pawner</td>
								<td className='bold'>{billDetails.cName}</td>
								<td>Address</td>
								<td className='bold'>{billDetails.address} {billDetails.cityPincode} </td>
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
					<table className="articles-table">
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
								<td style={{ "width": "80%" }}>
									{ <ul className='article-lists'>
										{billDetails.articleName.map((item, index) => {
											return <li>{item} - {billDetails.metal} </li>
										})}
									</ul> }
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
								<td style={{ "borderTop": "1px solid #000", "paddingBottom": "15px" }}><b>PRESENT VALUE</b></td>
							</tr>
							<tr className="articles-table-body">
								<td></td>
								<td style={{ "paddingBottom": "15px" }} className='bold'>{billDetails.presentValue}</td>
							</tr>
						</tbody>
					</table>
					<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0", "borderBottom":"1px solid #000" }}>
						<div> Signature of pawn broker </div>
						<div style={{ "marginLeft": "auto" }}> Sign / LHTI of pawner </div>
					</div>
					<div className="redeemed-pi">
						<h4 style={{"margin": "7px 0px"}}> RECEIVED PRINCIPLE &amp; INTEREST </h4>
						<table style={{"borderBottom":"0px"}}>
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
							</tbody>
						</table>
					</div>
					<p style={{ "fontWeight": "bold", "textAlign": "center", "fontSize": "16px" }}>Terms &amp; Conditions</p>
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
					<p style={{ "fontSize": "12px", "lineHeight": "16px" }} >
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
		)
	}
	// Default page state with pagination
	const RenderTableData = () => {
		let data = currentTableData.map(function (data, idx) {
			
			/* Show only unrdeeemed entries */
			if (data.redemptionDate == null || data.redemptionDate == "" || data.redemptionDate == undefined) {
				return (
				
					<ul className="table-body" key={data.billNumber}>
						<li>{data.cName}</li>
						<li style={{ "textAlign": "left", "paddingLeft": "10px" }}>
							{data.address} {data.cityPincode}
							{data.contactNo == "" || data.contactNo == undefined || data.contactNo == null ? "" : <div className="contact-number"> {data.contactNo} </div>}
						</li>
						<li>{data.date == "" || data.date == undefined || data.date == null || data.date == "Invalid date" ? '' : moment(data.date).format('DD/MM/YYYY')} </li>
						<li>{data.billNumber}</li>
						<li>{data.amount} </li>
						<li>
							<div style={{ "position": "relative" }} className="showMore"> {data.articleName[0]}
								<ul className="all-articles">
									{renderArticleList(data.articleName)}
								</ul>
							</div>
						</li>
						<li> {data.gram}.{data.mg} </li>
						<li className="remarks">{data.remark}</li>
						<li className="actions">
							<button onClick={() => printDeliveryNote(data)} className="deliveryNote-icon">DLY</button>
							<button onClick={() => editData(data._id)} className="edit-icon"></button>
							<button onClick={() => deleteDataConfirmation(data._id)} className="delete-icon"></button>
							<button onClick={() => printBill(data)} className="print-icon"></button>
							<button onClick={() => updatePrinciple(data)} className="" style={{"background":"transparent", "border":"0px","height":"auto", "lineHeight":"16px"}}>P&amp;I</button>
						</li>
					</ul>
				);
			}
			else {
				return false;
			}
		});
		return data
	}

	// Show only search result
	const RenderSearchData = () => {
		let data =  allEntries.filter((ele) => ele.address.toLowerCase().includes(searchText.toLowerCase()) || ele.cName.toLowerCase() == searchText.toLowerCase() || ele.billNumber == searchText ).map(function (data, idx) {
			/* Show only unrdeeemed entries */
			if (data.redemptionDate == null || data.redemptionDate == "" || data.redemptionDate == undefined) {
				return (
					<ul className="table-body" key={data.billNumber}>
						<li>{data.cName}</li>
						<li style={{ "textAlign": "left", "paddingLeft": "10px" }}>
							{data.address} {data.cityPincode}
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
						<li>{data.remark}</li>
						<li className="actions">
							<button onClick={() => printDeliveryNote(data)} className="deliveryNote-icon">DLY</button>
							<button onClick={() => editData(data._id)} className="edit-icon"></button>
							<button onClick={() => deleteDataConfirmation(data._id)} className="delete-icon"></button>
							<button onClick={() => printBill(data)} className="print-icon"></button>
							<button onClick={() => printBill(data)} className="" style={{"background":"transparent", "border":"0px","height":"auto", "lineHeight":"16px"}}>P&amp;I</button>
						</li>
					</ul>
				);
			}
			else {
				return false;
			}
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
	const [filtered, setFilteredEntry] = useState();

	let filteredEntry;

	function callbackFunction(childData) {
		setSearchVal(childData)
		if (childData == "clear") {
			setIsSearching(false);
			setSelectYear("All");
			getLists();

		}
		else {
			setSearchText(childData.trim());
			setIsSearching(true);
			setYear("all", childData.trim());
		}
		

	}

	function setModalStatus(modalStat) {
		setCloseModal(modalStat);
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
	}, [data, closeModal]);



	return (
		<>
			<NavBar page="unreedemed" />
			{printDelivery ? <DeliveryNote /> : ""}
			{printPledge ? <PledgeBill /> : ""}
			<div className="entry-content">
				<div style={{ "display": "flex", "marginBottom": "15px" }}>
					<div> Total Amount: <strong>{diffAmount} </strong></div>
				</div>
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
				{/* Show pagination, when there are more entries */}
				<div style={{ "display": "flex", "alignItems": "center", "marginTop": "15px" }}>
					<div>
						<label style={{ "fontWeight": "bold" }}>Filter By: </label>
						<select value={selectYear} onChange={handleYearChange} style={{ "height": "40px", "fontSize": "16px" }}>
							<option value="all">All</option>
							<option value="noDate">No Date</option>
							{findYear.map((item, key) => {
								return <option value={item}>{item} </option>
							})
							}
						</select>
					</div>
					{filterUnredeemed.length >= PageSize ? <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "end", "marginLeft": "auto"}}>
						<input type="number" className="jumpPage" onChange={handleChange} onKeyPress={(e) => {
							if (e.key === "Enter") {
								setCurrentPage(Number(jumpNo));
							}
						}} />
						<Pagination
							className="pagination-bar"
							currentPage={currentPage}
							totalCount={filterUnredeemed.length}
							pageSize={PageSize}
							onPageChange={page => setCurrentPage(page)}
						/>
					</div> : ''}

				</div>
				{allEntries && allEntries.length ?
					<div style={{ "display": "table", "width": "100%", "marginTop": "20px" }} ref={el => (componentRef = el)} >
						<ul className="table-header" style={{ "fontWeight": "bold" }}>
							<li>Name</li>
							<li>Address</li>
							<li>Date</li>
							<li>Bill No.</li>
							<li>Amount</li>
							<li>Article Name</li>
							<li> Weight </li>
							<li className="remarks">Remark</li>
							<li className="actions">Actions</li>
						</ul>
						{isSearch ? <RenderSearchData /> : <RenderTableData />}
					</div> :
					<h3> Loading.. please wait </h3>}
				{editModal && closeModal == "open" ? <EditEntryModal toEdit={editId} parentModalCallBack={setModalStatus} /> : ''}

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

{principleInterest ?
					<>
						<div className="page-overlay"></div>
						<div className="delete-modal">
							<button className="close-modal" onClick={cancelDelete} ></button>
<div className='entry-form'>
<div>
				<label htmlFor="cName">Customer Name</label>
				<input type="text" name="cName"  value ={inputVal.cName} />
				</div>
				<div>
				<label htmlFor="billNumber">Bill Number</label>
				<input type="text" name="billNumber" value ={inputVal.billNumber} />
				</div>
</div>
							<form className='entry-form' style={{"clear":"both"}}
							onSubmit={(e) => {e.preventDefault()}}
			onKeyDown={(e) => {if(e.keyCode == 13) {e.preventDefault()}}}>
							<div>
					<label htmlFor="principleAmount">Principle</label>
					<input type="text" name="principleAmount"  placeholder="Enter principle" onChange={handlePrincipleChange}  ref={principleAmount}/>
				</div>
				<div>
					<label htmlFor="interest">Interest</label>
					<input type="text" name="interest"  placeholder="Enter interest" onChange={handlePrincipleChange} ref={interest}/>
				</div>
				<div>
					<label htmlFor="date">Date</label>
					<input type="date" name="date" placeholder="Enter city and pincode"  onChange={handlePrincipleChange}  ref={date} />
				</div>
				<button onClick={savePrincipleDetails}
				onKeyDown={(e) => {if(e.keyCode == 13) {savePrincipleDetails()}}}
				>Save</button>
								</form>
								{principleDetails && principleDetails.length  ? 
							<table className="principleDetails">
								<thead>
									<td>No.</td>
									<td>Principle Amount</td>
									<td>Interest Month</td>
									<td>Date</td>
								</thead>
								{principleDetails.map((item, index) => {
											return (
											<tr>
												<td>{index+1}</td>
												 <td>{item.principleAmount}</td>
												<td>{item.interest}</td>
												<td>{moment(new Date(item.date)).format('DD/MM/YYYY') }</td> 
											</tr>
												)
										})}
							</table> : ''
							}
						
						</div>	
					</>
					: ''}

				{redeemEntry && redemptionDetails?
					<>
						<div className="page-overlay"></div>
						<div className="delete-modal">
							<button className="close-modal" onClick={cancelDelete} ></button>
							<p> Are you sure you want to redeem entry with Bill No: <strong> {redemptionDetails.billNumber} </strong> </p>
							<p><label htmlFor='redemptionDate'></label>
								<input type="date" name="redemptionDate" placeholder="Enter date"
									defaultValue={moment(new Date()).format('YYYY-MM-DD')}
									value={redData ? moment(new Date(redData.redemptionDate)).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD')}
									onChange={updateRedemptionDate}
								/>								
							</p>
							<p><strong>Redemption Amount: </strong> {redemptionDetails.amount} </p>
							<p><strong> Interest: </strong>{calculateInterest(redemptionDetails.date, redemptionDetails.amount)}</p>
							<button onClick={transferEntry}> Yes </button>
							<button onClick={cancelDelete}> No </button>
						</div>
					</>
					: ''}
			</div>
		</>
	)
}

export default AllUserEntries;
