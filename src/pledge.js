import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import EditEntryModal from './editEntryModal.js';
import FilterEntries from './searchEntry.js';
import fileDownload from 'js-file-download';
import ReactToPrint from "react-to-print";
import NavBar from './navBar.js';
import moment from 'moment';
import Pagination from './components/pagination';
import * as html2canvas from "html2canvas"
import _ from 'lodash';
import { ToWords } from 'to-words';
import { User } from './userContext.js';

let PageSize = 30, finalAmount, page1, page2;
const toWords = new ToWords();
const AllUserEntries = (props, ref) => {
	const [entries, fetchUserEntries] = useState([]);
	const [allEntries, saveAllEntries] = useState();
	const [editId, setEditModalId] = useState();

	// Delete Entry States
	const [deleteModal, isDeleteModal] = useState(false);
	const [delId, setDelId] = useState();
	const [deleteEntry, confirmDeletion] = useState(false);

	let value = useContext(User);

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

	let componentRef = useRef();
	const billPrint = useRef({});
	const note = useRef({});

	const getLists = () => {
		axios.get("http://localhost:4000/customers/get-result", { params: { createdBy: value.data.userName } })
			.then(response => {
				fetchUserEntries(response.data);
				saveAllEntries(response.data);
			});
	};
	const printEntries = () => {
		window.print();
	}
	const [filterUnredeemed, setfilterUnredeemed] = useState([]);
	const [allUnredeemed, setAllUnredeemed] = useState([]);
	const [findYear, setFindYear] = useState([]);

	let filterUnredeem = [], getYear = [], years = [];
	const filterUnreedemedEntry = () => {
		filterUnredeem = entries.filter((entry) => entry.redemptionDate == null || entry.redemptionDate == undefined || entry.redemptionDate == "");
		years = filterUnredeem.map(function (ele, i) {
			// Push date to array only if its valid date
			if (new Date(ele.date).getFullYear()) {
				getYear.push(new Date(ele.date).getFullYear());
			}
		})
		setFindYear([...new Set(getYear)]);
		// Remove all duplicate Years
		console.log([...new Set(getYear)]);
		// Setting a state, to acheive filter by year and not change the original state
		setAllUnredeemed(filterUnredeem);
		setfilterUnredeemed(filterUnredeem);
	}

	const [selectYear, setSelectYear] = useState("1.33");

	const handleYearChange = (e) => {
		setSelectYear(e.target.value);
		setYear(e.target.value);
	};

	let selectYr;
	const setYear = (selectYear) => {
		selectYr = selectYear;
		if (selectYr == "all") {
			// set state to default entries, if all is clicked
			setfilterUnredeemed(allUnredeemed);
		}
		else if (selectYr == "noDate") {
			// All unredeemed entries with no date
			let filterYear = allUnredeemed.filter((entry) => entry.date == null || entry.date == undefined || entry.date == "" || entry.date == "Invalid date");
			setfilterUnredeemed(filterYear);
		}
		else {
			// Filter entries by selected year
			let filterYear = allUnredeemed.filter((entry) => new Date(entry.date).getFullYear() == selectYr);
			setfilterUnredeemed(filterYear);

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
		// return Math.abs(interest).toFixed(2);
		return finalAmount;

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
const generateImages = () => {
	alert('me');
	let newwin;
	var divToPrint = document.getElementById("print-area");
	var styles = document.createElement("style");
	styles.setAttribute("id","landscape");
	styles.setAttribute("type", "text/css");
	styles.setAttribute("media", "print");
	styles.textContent = `@page { size: landscape; }.pledge-entries {
		table-layout: fixed;
	}
	.pledge-entries .table-header>li {
		font-size: 10px !important;
		word-spacing: 1px;
	}
	.pledge-entries .table-header>li,
	.pledge-entries .table-body>li {
		font-size: 12px;
		word-spacing: 1px;
	}.table-header,
	.table-body {
		display: table-row;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	
	.table-header>li,
	.table-body>li {
		border: 1px solid #ccc;
		border-right: 0;
		font-size: 14px;
		text-align: center;
		padding: 5px;
		display: table-cell;
		vertical-align: middle;
		text-transform: uppercase;
		vertical-align: middle;
	}
	
	.table-body>li  {
		font-size: 12px;
	}
	
	.table-header>li,
	.table-body>li:last-child {
		border-right: 1px solid #ccc;
	}
	
	.table-header>li {
		padding: 10px 5px;
	}
	#page2 .table-header > li {
		height: autopx;
		padding: 10px 5px !important;
		font-size: 12px;
	  }
	`;
	document.head.appendChild(styles);
	var divToPrintHTML = divToPrint.outerHTML;
	window.print();
	
}
window.onafterprint = (event) => {
	console.log("After print");
	document.getElementById('landscape').remove();
  };
  const SetHeader = () => {
return(
	<div className="bill-header show-on-print" id="header" style={{ "marginBottom": "0", "borderBottom":"0" }}>
					
					<div style={{ "display": "flex", "alignItems":"baseline" }}>
					<div>
						<div style={{ "marginBottom": "2px", "fontSize": "12px", "paddingLeft": "10px" }}> PLEDGE BOOk - NAKODA Pawn Broker  Plot No.9, V.O.C. Nagar, Market Lane,  Tondiarpet, Chennai- 600 081 </div>
							
							<div style={{ "padding": "5px 0 5px 10px", "fontSize": "12px", "float":"left"}}> FORM E Section 10[1] (a) &amp; Rule 7</div>
							<div style={{ "padding": "5px 0 5px 0", "fontSize": "12px", "float":"right"}}>P.B.L No. <span style={{ "display": "inline-block", "width": "150px" }}>{value.data.license}</span></div>
							</div>
							<div style={{ "fontSize": "12px", "width":"40%", "marginLeft":"auto"}}>
								<ul>
									<li>All items in the PLEDGE BOOK except items 6, 11 &nbsp; 13 respecting each pledge shall made on the day of the pawning thereof</li>
									<li>4 Rate of Interest charged 16%</li>
									<li>9 The time agreed upon for the redemption  of the pawn - one year</li>
								</ul>
							</div>
						</div>
					</div>
)
  }
	const SetPrintPages = (page1) => {
return (
	<>
				<div style={{ "display": "table", "width": "100%"}} className="pledge-entries">
						<ul className="table-header" style={{ "fontWeight": "bold" }}>
							<li style={{ "width": "10%", "wordBreak":"break-all"}}>Name</li>
							<li style={{ "width": "15%" }}>Address</li>
							<li style={{ "width": "6%" }}>Date</li>
							<li style={{ "width": "5%" }}>Bill No.</li>
							<li style={{ "width": "5%" }}>Amount</li>
							<li style={{ "width": "7%" }}>Redemption Amount</li>
							<li>Article Name</li>
							<li style={{ "width": "4%" }}> Weight </li>
							<li style={{ "width": "4%" }}> Present Value </li>
							<li style={{ "width": "6%" }}>Redemption Date</li>
							<li style={{ "width": "5%" }}>DLY Receipt #</li>
							<li style={{ "width": "6%" }}>Redeemer's Name</li>
						</ul>
						{DataTable(page1)}
					</div> 
					</>
)
	}

	// pagination logic
	const [currentPage, setCurrentPage] = useState(1);
	const [isSearch, setIsSearching] = useState(false);
	const currentTableData = useMemo(() => {
		const firstPageIndex = (currentPage - 1) * PageSize;
		const lastPageIndex = firstPageIndex + PageSize;
		console.log(entries);
		return entries.slice(firstPageIndex, lastPageIndex);
	}, [currentPage, entries, isSearch]);

	const DataTable = (entry) => {
		let data = entry.map(function (data, idx) {
			
			return (
				<ul className="table-body pledge-table" key={data.billNumber}>
					<li style={{ "textAlign": "left" }}>{data.cName}</li>
					<li style={{ "textAlign": "left", "paddingLeft": "10px" }}>
						{data.address} {data.cityPincode ? data.cityPincode : "chennai 600-081"}
						{data.contactNo == "" || data.contactNo == undefined || data.contactNo == null ? "" : <div className="contact-number hide-on-print"> {data.contactNo} </div>}
					</li>
					<li>{data.date == "" || data.date == undefined || data.date == null || data.date == "Invalid date" ? '' : moment(data.date).format('DD/MM/YYYY')} </li>
					<li>{data.billNumber}</li>
					<li>{data.amount}</li>
					<li>
						{ data.redemptionDate ? calculateInterest(data.date, data.amount, data.redemptionDate) : " " }
						</li>
					<li><div style={{"width":"100%", "wordBreak":"break-all", "fontSize": data.articleName.length > 2 ? "10px" : "12px" }}>
					{data.articleName.map((item, index) => {
						return <span>{item},</span>
					})} ({data.metal})
					</div>
					</li>
					<li> {data.gram}.{data.mg} </li>
					<li>{data.presentValue}</li>
					<li className="">{data.redemptionDate == "" || data.redemptionDate == undefined || data.redemptionDate == null || data.redemptionDate == "Invalid date" ? '' : moment(data.redemptionDate).format('DD/MM/YYYY')}</li>
					
					<li>{data.deliveryRecNum}</li>
					<li className="">{data.redemptionDate == "" || data.redemptionDate == undefined || data.redemptionDate == null || data.redemptionDate == "Invalid date" ? '' : data.redeemer}</li>
				</ul>
			);

		});
		return data
	}
	// Default page state with pagination
	const RenderTableData = () => {
		page1= currentTableData.slice(0, 15);
		return (
			<div style={{"pageBreakAfter":"always"}}>
			<SetHeader />
			{SetPrintPages(page1)}
			</div>
		)
	}
	const RenderTableData2 = () => {
		page2= currentTableData.slice(15, 30);
		if(currentTableData.length > 15 ){
			return (
				<div id="page2" style={{"pageBreakAfter":"always"}}>
				<SetHeader />
				{SetPrintPages(page2)}
				</div>
			)
		}
		else {
			return false;
		}
		
	}
	// Show only search result
	const RenderSearchData = () => {
		let data = entries.filter((ele) => ele.cName.toLowerCase() == searchText.toLowerCase() || ele.billNumber == searchText).map(function (data, idx) {
			
				return (
					
					<ul className="table-body pledge-table"  key={data.billNumber}>
						<li>{data.cName}</li>
						<li style={{ "textAlign": "left", "paddingLeft": "10px" }}>
							{data.address} {data.cityPincode}
							{data.contactNo == "" || data.contactNo == undefined || data.contactNo == null ? "" : <div className="contact-number"> {data.contactNo} </div>}
						</li>
						<li>{data.date == "" || data.date == undefined || data.date == null || data.date == "Invalid date" ? '' : moment(data.date).format('DD/MM/YYYY')} </li>
						<li>{data.billNumber}</li>
						<li>{data.amount}</li>
						<li>
						{ data.redemptionDate ? calculateInterest(data.date, data.amount, data.redemptionDate) : " "  }
						</li>
						<li><div style={{"width":"100%", "wordBreak":"break-all", "fontSize": data.articleName.length > 2 ? "10px" : "12px" }}>
					{data.articleName.map((item, index) => {
						return <span>{item},</span>
					})} ({data.metal})
					</div>
					</li>
						<li> {data.gram}.{data.mg} </li>
						<li>{data.presentValue}</li>
						<li className="">{data.redemptionDate == "" || data.redemptionDate == undefined || data.redemptionDate == null || data.redemptionDate == "Invalid date" ? '' : moment(data.redemptionDate).format('DD/MM/YYYY')}</li>
						<li>{data.deliveryRecNum}</li>
						<li className="">{data.redemptionDate == "" || data.redemptionDate == undefined || data.redemptionDate == null || data.redemptionDate == "Invalid date" ? '' : data.redeemer}</li>
											</ul>
				);
		});
		// fetchUserEntries(data);
		console.log(data);
		return data
	}


	const [data, fetchData] = useState();
	const [editModal, showEditModal] = useState(false);
	const [search, setSearchVal] = useState();
	const [closeModal, setCloseModal] = useState();
	// State for checking if search is clicked by user
	
	const [searchText, setSearchText] = useState();

	let filteredEntry;

	function callbackFunction(childData) {
		setSearchVal(childData)
		if (childData == "clear") {
			setIsSearching(false);
			getLists();
		}
		else {
			setSearchText(childData.trim());
			setIsSearching(true);
		}
	}

	function setModalStatus(modalStat) {
		setCloseModal(modalStat);
	}

	const downloadData = async () => {
		// const fileName = "entriesCopy";
		// const json = JSON.stringify(entries);
		// const blob = new Blob([json], { type: 'application/json' });
		// const href = await URL.createObjectURL(blob);
		// const link = document.createElement('a');
		// link.href = href;
		// link.download = fileName + ".json";
		// document.body.appendChild(link);
		// link.click();
		// document.body.removeChild(link);
		axios.get("http://localhost:4000/customers/download", { params: { createdBy: (value.data.userName).trim() } })
			.then(response => {
				console.log("data backed up");
				alert("backup complete");
			});

	}
	useEffect(() => {
		getLists();
	}, [data, closeModal]);



	return (
		<>
		 <NavBar page="pledge" />
			<div>
				<div className='hide-on-print'>
					<div style={{ "display": "flex", "alignItems": "end", "marginBottom":"15px" }}>
						<div>
						{/* <div style={{"marginBottom":"15px"}}> Total Amount: <strong>{diffAmount} </strong></div> */}
						 <FilterEntries parentCallback={callbackFunction} /> </div>
						<div style={{"marginLeft": "auto", "display": "flex", "alignItems": "center"}}>
						{/* Show pagination, when there are more entries */}
						{entries.length >= PageSize && !isSearch 	? <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "end", "marginLeft": "auto" }}>
							<input type="number" className="jumpPage" onChange={handleChange} onKeyPress={(e) => {
								if (e.key === "Enter") {
									setCurrentPage(Number(jumpNo));
								}
							}} />
							<Pagination
								className="pagination-bar"
								currentPage={currentPage}
								totalCount={entries.length}
								pageSize={PageSize}
								onPageChange={page => setCurrentPage(page)}
							/>
						</div> : ''}
						<div>
							<button onClick={downloadData} style={{ "marginRight": "15px" }}> Download </button>
							<button onClick={generateImages}>Print</button>
						</div>
						</div>
					</div>
				</div>
				<div id="print-area">
				{entries && entries.length ?
					<div>
						{isSearch ? 
						
				<div style={{ "display": "table", "width": "100%"}} className="pledge-entries">
				<ul className="table-header" style={{ "fontWeight": "bold" }}>
					<li style={{ "width": "10%", "wordBreak":"break-all"}}>Name</li>
					<li style={{ "width": "15%" }}>Address</li>
					<li style={{ "width": "6%" }}>Date</li>
					<li style={{ "width": "5%" }}>Bill No.</li>
					<li style={{ "width": "5%" }}>Amount</li>
					<li style={{ "width": "7%" }}>Redemption Amount</li>
					<li>Article Name</li>
					<li style={{ "width": "4%" }}> Weight </li>
					<li style={{ "width": "4%" }}> Present Value </li>
					<li style={{ "width": "6%" }}>Redemption Date</li>
					<li style={{ "width": "5%" }}>DLY Receipt #</li>
					<li style={{ "width": "6%" }}>Redeemer's Name</li>
				</ul>
				<RenderSearchData /> 
			</div> 
						
						: <><RenderTableData /><RenderTableData2 /> </>}
					</div> :
					<h3> Loading.. please wait </h3>}
</div>
			</div>
		</>
	)
}

export default AllUserEntries;
