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
  
const FormD = (props, ref) => {
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
			const diffTime = Math.abs(new Date() - new Date(date1));
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			let months = 	Math.ceil(diffDays / 30);
			let interest = (amount * (months-1) * perValue) / 100;
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
			if((ele.billNumber) == childData) {
				return ele
			}
		});
		fetchUserEntries(filteredEntry);
		SetFilteredEntries(filteredEntry);
		}
	}

	const [formD, setFormDData] = useState();
	const printFormD = (cont) => {
		setFormDData(cont);
		setTimeout(function(){
			window.print();
		}, 100);
	}
	const FormDContent = () => {
		return (
			<div id="pledgeBill" style={{"position":"relative"}} className="page-a4">
				<div className='text-centre'>
				<h4 style={{"margin":"5px 0px 5px 0px"}}>FORM D</h4>
				<h5 style={{"margin":"5px 0px 5px 0px"}}>See Section 8 [6] and Rules 6 [1]</h5>
				<h5 style={{"margin":"5px 0px 15px 0px"}}>Declaration by Pawner of Lease Or Destruction of Pawn Ticket</h5>
				</div>
				<div style={{ "fontSize": "14px" }}>
					<div className="bill-header" id="header">
						<div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center" }}>
							<div className="logo" style={{ "display": "inline-block" }}></div>
							<div style={{ "display": "inline-block" }}>
								<div style={{ "marginBottom": "2px" }}><h2 style={{ "margin": "0px", "display": "inline-block", "textTransform":"capitalize" }}> {value.data.companyName} </h2></div>
								<div>{value.data.address} <br /> {value.data.area} </div>
							</div>
						</div>
					</div>
					<table style={{"width":"100%","borderSpacing":"7px"}}>
						<tr>
							<td><strong style={{"paddingRight":"10px"}}>Loan</strong> {formD.amount}</td>
							<td><strong style={{"paddingRight":"10px"}}>Rs</strong></td>
							<td><strong style={{"paddingRight":"10px"}}>Date</strong> {moment(formD.date).format('DD/MM/YYYY')}</td>
						</tr>
						<tr>
							<td><strong style={{"paddingRight":"10px"}}>Name</strong> {formD.cName}</td>
							<td><strong style={{"paddingRight":"10px"}}>Address</strong>{formD.address}</td>
							<td></td>
						</tr>
					</table>
					
					<p style={{"lineHeight":"24px"}}> I, <span className='content-spacer bold'>{formD.cName}</span> of <span className='content-spacer'></span> in pursuance of sub section [6] of section of Madras Pawn Brokers Act 1943 (Madras Act XXIII of 1943) do solemnly and sincerely declare that I pledge at the shop of <span className='bold'>{value.data.companyName}</span> Pawn Brokers, the articles, articles described below bring my property and having received a pawn ticket bearing No. <span className='content-spacer bold'>{formD.billNumber}</span> date <span className='content-spacer'>{moment(formD.date).format('DD/MM/YYYY')}</span> (if known) for the same, which has since been of destroyed and the pawn ticket has not been sold, issued or transferred to any person by me to the best of knowledge and belief. </p>
					<p>
						The article/articles above referred to is / are of the following description:
					</p>
					<p style={{"marginBottom":"20px"}}>
						<h3>ARTICLES:</h3>
						<ul>
						{(formD.articleName).map((item, key) => {
								return <li><stong>{item}</stong></li>
							})
							}
						</ul>
					</p> 
					<p style={{"lineHeight":"24px"}}>
						I, <span className='content-spacer'></span> or <span className='content-spacer'></span> in pursuance of sub-section 6 or 8 to the said Act do solemnly and sincerely declare that I know the person making the foregoing declaration to be
					</p>
					<div style={{"lineHeight":"25px", "float":"right"}}>
						<div>Signature of Pawner:</div>
						<div>Date: <strong>{moment(new Date()).format('DD/MM/YYYY')}</strong></div>
					</div>
				</div>
			</div>
		)
	}
	
	const RenderTableData = () => {
	 let data = entries.map(function(data, idx) {
		
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
			  <li className='actions'>
			  <button onClick={() => printFormD(data)} className="print-icon"></button>
			  </li>
			  </ul> 
		   );
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
   <NavBar page="dform" />
  <div style={{"display":"flex"}}>
  <FilterEntries parentCallback={callbackFunction} />
  </div>
  {entries && entries.length ? 
  <div style={{"display":"table", "width":"100%", "marginTop":"25px"}} className='hide-on-print'>
  <ul className="table-header" style={{"fontWeight":"bold"}}>
  <li>Name</li>
  <li>Address</li>
  <li>Date</li>
  <li>Bill Number</li>
  <li>Amount</li>
  <li>Article Name</li>
  <li> Weight </li>
  <li>Interest</li>
  <li>Form D</li>
  </ul> 
  { search != null || search != undefined ? <RenderTableData /> : '' }
  </div>
  : <h3 style={{"marginTop":"50px", "textAlign":"centre"}}> Loading... </h3>}  
  {formD ? <FormDContent /> : '' }
  </>
)
}

export default FormD;
