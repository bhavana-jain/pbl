import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
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

let PageSize = 30;
const toWords = new ToWords();
const OldEntries = (props, ref) => {
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
		axios.get("http://localhost:4000/customers/get-result", {params: {createdBy: value.data.userName}})
			.then(response => {
				fetchUserEntries(response.data);
				saveAllEntries(response.data);
			});
	};

	const filterUnredeemed = entries.filter((entry) => entry.redemptionDate == null || entry.redemptionDate == undefined || entry.redemptionDate == "");

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

	function calculateInterest(date1, amount) {
		const diffTime = Math.abs(new Date() - new Date(date1));
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		let months = Math.ceil(diffDays / 30);
		let interest = (amount * (months - 1) * 1.33) / 100;
		return interest;
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
	}, [currentPage, entries]);

	const DeliveryNote = () => {
		return (
			<div id="delivery-note">
				<div className="bill-header" id="header">
					<div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center" }}>
						<div className="logo" style={{ "display": "inline-block" }}></div>
						<div style={{ "display": "inline-block" }}>
							<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block" }}> NAKODA </h2> Pawn Broker</div>
							<div> Plot No.9, V.O.C. Nagar, Market Lane, <br /> Tondiarpet, Chennai- 600 081 </div>
						</div>
						<div style={{ "marginLeft": "auto", "lineHeight": "18px" }}>
							<div> PAWN TICKET </div>
							<div> Form F Section 7 &amp; Rule 8 </div>
							<div> L.No. 2118/2020-21 </div>
						</div>
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
				<h3 className="text-centre"> Delivery Note </h3>
				<p className="text-centre" style={{ "width": "70%", "margin": "0 auto", "lineHeight": "27px" }}>
					THE AMOUNT OF EVERY PAYMENT RECEIVED TOWARDS LOAN DATE
					<span className="content-spacer">
						{deliveryNt.date == "" || deliveryNt.date == undefined || deliveryNt.date == null || deliveryNt.date == "Invalid date" ? '' : moment(deliveryNt.date).format('DD/MM/YYYY')}</span>
					FOR PRINCIPLE <span className="content-spacer"> {deliveryNt.amount}</span> FOR INTEREST </p>
				<p style={{ "lineHeight": "27px" }}> I HAVE THIS DAY PAID RS <span className="content-spacer"> </span>
					TOWARDS PRINCIPLE &amp; RS <span className="content-spacer"> {calculateInterest(deliveryNt.date, deliveryNt.amount)} </span> TOWARDS INTEREST &amp; RECEIVED THE ARTICLE MENTIONED OVER LEAF WITH FULL
					MANUFACTION </p>
				<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0", "alignItems":"center" }}>
					<div> 
						<div> Date: <span className="content-spacer"> {today} </span> </div>
						<div style={{"paddingTop":"5px"}}> Delivery Receipt No: <span className="content-spacer"> </span> </div>
						</div>
					<div style={{ "marginLeft": "auto" }}> Total: <span className="content-spacer"> </span> </div>
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
				<div style={{ "fontSize": "14px" }} className="page-a4">
					<div className="bill-header" id="header">
						<div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center" }}>
							<div className="logo" style={{ "display": "inline-block" }}></div>
							<div style={{ "display": "inline-block" }}>
								<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block" }}> NAKODA </h2> Pawn Broker</div>
								<div> Plot No.9, V.O.C. Nagar, Market Lane, <br /> Tondiarpet, Chennai- 600 081 </div>
							</div>
							<div style={{ "marginLeft": "auto", "lineHeight": "18px" }}>
								<h4 style={{ "marginBottom": "0px", "fontWeight": "bold" }}> DUPLICATE BILL</h4>
								<div> PAWN TICKET </div>
								<div> Form F Section 7 &amp; Rule 8 </div>
								<div> L.No. 2118/2020-21 </div>
							</div>
						</div>
					</div>
					<p> The following articles are pawned with me: </p>
					<table className="pledge-details">
						<tbody>
							<tr>
								<td>Bill No</td>
								<td>{billDetails.billNumber}</td>
								<td>Pledge Date</td>
								<td>{moment(billDetails.date).format('DD/MM/YYYY')}</td>
								<td>Mobile</td>
								<td> {billDetails.contactNo}</td>
							</tr>
							<tr>
								<td>Name of the pawner</td>
								<td>{billDetails.cName}</td>
								<td>Address</td>
								<td>{billDetails.address}</td>
								<td>Identity Proof</td>
								<td> {billDetails.idProof}</td>
							</tr>
							<tr className="empty-child">
								<td>Principle of the loan amount</td>
								<td>{billDetails.amount}</td>
								<td style={{ "borderLeft": "1px solid #ccc" }} >Rupees in words</td>
								<td style={{ "borderLeft": "1px solid #ccc" }} colSpan="3">{toWords.convert(parseInt(billDetails.amount), { currency: true })} </td>
							</tr>
							<tr>
							</tr>
						</tbody>
					</table>
					<p>
						( Rate of interest charged at 16% per annum. The time agreed upon for redemption of the article is 1 year )
					</p>
					<table className="articles-table">
						<tbody>
							<tr className="articles-table-header">
								<td style={{ "width": "80%" }}>Particulars of the pledge</td>
								<td style={{ "padding": "0" }}>
									<div style={{ "lineHeight": "30px" }}>Gross Wt</div>
									<div style={{ "width": "100%", "display": "table", "borderTop": "1px solid #ccc" }}>
										<div style={{ "padding": "0", "border": "0", "borderRight": "1px solid #ccc" }}>Gm</div>
										<div style={{ "padding": "0", "border": "0" }}>Mg</div>
									</div>
								</td>
							</tr>
							<tr className="articles-table-body">
								<td style={{ "width": "80%" }}>{billDetails.articleName.length > 0 ? billDetails.articleName.join(', ') : ''}</td>
								<td style={{ "padding": "0" }}>
									<div style={{ "width": "100%", "display": "table", "borderTop": "1px solid #ccc", "minHeight": "55px" }}>
										<div style={{ "padding": "0", "border": "0", "borderRight": "1px solid #ccc", "width": "51%" }}>{billDetails.gram}</div>
										<div style={{ "padding": "0", "border": "0" }}>{billDetails.mg}</div>
									</div>
								</td>
							</tr>
							<tr className="articles-table-body">
								<td></td>
								<td style={{ "borderTop": "1px solid #ccc", "paddingBottom": "15px" }}><b>PRESENT VALUE</b></td>
							</tr>
							<tr className="articles-table-body">
								<td></td>
								<td style={{ "paddingBottom": "15px" }}>{billDetails.presentValue}</td>
							</tr>
						</tbody>
					</table>
					<div style={{ "display": "flex", "fontWeight": "bold", "padding": "30px 0 10px 0" }}>
						<div> Signature of pawn broker </div>
						<div style={{ "marginLeft": "auto" }}> Sign / LHTI of pawner </div>
					</div>
					<div className="redeemed-pi">
						<h4> REDEEMED PRINCIPLE &amp; INTEREST </h4>
						<table>
							<tbody>
								<tr>
									<td>1. Received<span style={{ "width": "50px", "display": "inline-block" }}></span>months interest on</td>
									<td>2. Received<span style={{ "width": "50px", "display": "inline-block" }}></span>months interest on</td>
								</tr>
								<tr>
									<td>3. Received<span style={{ "width": "50px", "display": "inline-block" }}></span>months interest on</td>
									<td>4. Received<span style={{ "width": "50px", "display": "inline-block" }}></span>       months interest on </td>
								</tr>
							</tbody>
						</table>
					</div>
					<ol className="tos">
						<li> The rate of interest on any pledge shall be 16% per annum simple interest that is to say one paise per one rupees per mensum simple interest. </li>
						<li> Every pledge shall be redeemable within a period of one year of such longer period ass may be provided in the contract between the parties from the day of powing (exclusive of that day) and shall continue to be redeemable during seven days of
							grace following the said period. A pledge shall further continue to be redeemable until it is disposed of as provided in tha Act althrough the period of
							redemption and says of grace have expired. </li>
						<li> A pawn may be in addition to the cost of revenue stamp demand and take from the pawner sum not exceeding 25 paise for any loan not exceeding rupees 250 and 50 paise
							for and loan exceeding Rs. 250 for incidental expenses connected with the advances of such loan. </li>
						<li> The pawn broker empowered to reledge the jewels with any bank or bankers. </li>
						<li> The pawner shall communicate his change of address in writing and the article will be delivered the next day of payment. </li>
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
		console.log('1');
		let data = currentTableData.map(function (data, idx) {
			/* Show only unrdeeemed entries */
			if (data.redemptionDate == null || data.redemptionDate == "" || data.redemptionDate == undefined) {
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
						<li>{data.remark}</li>
						<li className="actions">
							<button onClick={() => printDeliveryNote(data)} className="deliveryNote-icon">DLY</button>
							<button onClick={() => editData(data._id)} className="edit-icon"></button>
							<button onClick={() => deleteDataConfirmation(data._id)} className="delete-icon"></button>
							<button onClick={() => printBill(data)} className="print-icon"></button>
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
		console.log('2');
		let data = allEntries.filter((ele) => ele.cName.toLowerCase() == searchText.toLowerCase() || ele.billNumber == searchText).map(function (data, idx) {
			/* Show only unrdeeemed entries */
			if (data.redemptionDate == null || data.redemptionDate == "" || data.redemptionDate == undefined) {
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
						<li>{data.remark}</li>
						<li className="actions">
						<button onClick={() => printDeliveryNote(data)} className="deliveryNote-icon">DLY</button>
							<button onClick={() => editData(data._id)} className="edit-icon"></button>
							<button onClick={() => deleteDataConfirmation(data._id)} className="delete-icon"></button>
							<button onClick={() => printBill(data)} className="print-icon"></button>
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
				{filterUnredeemed.length >= PageSize  ? <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "end" }}>
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
				</div> : '' }
				{allEntries && allEntries.length ?
					<div style={{ "display": "table", "width": "100%", "marginTop": "20px"}} ref={el => (componentRef = el)} >
						<ul className="table-header" style={{ "fontWeight": "bold" }}>
							<li>Name</li>
							<li>Address</li>
							<li>Date</li>
							<li>Bill No.</li>
							<li>Amount</li>
							<li>Article Name</li>
							<li> Weight </li>
							<li>Remark</li>
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
			</div>
		</>
	)
}

export default OldEntries;
