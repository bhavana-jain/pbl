import React, {useState, useEffect, useRef} from 'react';
import './App.css';
import axios from 'axios';
import EditEntryModal from './editEntryModal.js';
import FilterEntries from './searchEntry.js';
import fileDownload from 'js-file-download';
import ReactToPrint from "react-to-print";
import { useReactToPrint } from "react-to-print";
import moment from 'moment';
import _ from 'lodash';
import PledgeBill from './pledgeBill.js';
  
const RedeemedEntries = (props, ref) => {
	const [entries, fetchUserEntries] = useState();
	const [allEntries, saveAllEntries] = useState();
	const [editId, setEditModalId] = useState();
	const[deleteModal, isDeleteModal] = useState(false);
	const[delId, setDelId] = useState();
	const [deleteEntry, confirmDeletion] = useState(false);
	const [dataLoaded,  setDataLoaded] = useState(false);
const onBeforeGetContentResolve = useRef();
	let componentRef = useRef();
	
	// print a particular bill
	const[isPrint, setIsPrint] = useState(false);
	
	const[billNo, setBillRef] = useState();
	let billPrint = useRef();
	const handleOnBeforeGetContent = (billId) => {
};


	
	const resetdata = () => {
		setBillRef({
		"cName":"",
		"date":"",
		"address":"",
		"amount":"",
		"redemptionAmount":"",
		"billNumber":"",
		"redemptionDate":"",
		"articleName":"",
		"remark":"",
		"contactNo":"",
		"gram":"",
		"mg":""
	})
	}
	

	const getLists = () => {
  axios.get("http://localhost:4000/customers")
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
	
const editData = (id) => {
	console.log(id, 'edit');
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
                console.log('Student successfully deleted!');
				getLists();
				setEntryId('');
				console.log('list updated');
            }).catch((error) => {
                console.log(error)
            })
}

useEffect(() => {
	if(deleteEntry) {
		deleteData(entryId);
		cancelDelete();
		confirmDeletion(false);
	}
}, [deleteEntry]);

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


 const RenderTableData = () => {
	 let data = entries.map(function(data, idx) {
		// console.log(data.date);
		 /* Show only redeeemed entries */
		 if(data.redemptionDate == null || data.redemptionDate == "" || data.redemptionDate == undefined) {
		  return false;
		 }
		 else {
			  return (
			   <ul className="table-body" key={data._id}>
			  <li>{data.cName}</li>
			  <li style={{"textAlign":"left", "paddingLeft":"10px", "width":"20%"}}>
				{data.address}
				{data.contactNo == "" || data.contactNo == undefined || data.contactNo == null ? "" : <div className="contact-number"> {data.contactNo} </div> }
			  </li>
			  <li>{data.date == "" || data.date == undefined || data.date == null || data.date == "Invalid date" ? '' : moment(data.date).format('DD/MM/YYYY')} </li>
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
			  <li style={{"color":"red"}}> 
			  {data.redemptionDate == "" || data.redemptionDate == undefined || data.redemptionDate == null || data.redemptionDate == "Invalid date" ? '' : moment(data.redemptionDate).format('DD/MM/YYYY')} </li>
			  <li>{data.remark}</li>
			  <li>
				<button onClick={()=> editData(data._id)} className="edit-icon"></button>
				<button onClick={()=> deleteDataConfirmation(data._id)} className="delete-icon"></button>
				<ReactToPrint
          trigger={() => <button className="print-icon"> </button>}
           content={() => billPrint}
		  onBeforeGetContent={() => handleOnBeforeGetContent(data._id) }
		  onAfterPrint = { () => resetdata() }
        />
			  </li>
			  </ul> 
		   );
		 }
});
return data
 }
	const [data, fetchData] = useState();
	const [editModal, showEditModal] = useState(false);
	const [search, setSearchVal] = useState();
	const[closeModal, setCloseModal] = useState();
	const [print, printBill] = useState(false);
	
	 let filteredEntry;
	 
	 function callbackFunction(childData) {
		setSearchVal(childData)
		console.log('fromChild', childData);
		if(childData == "clear" ) {
			getLists();
		}
		else {
			 filteredEntry = allEntries.filter(function(ele) {
			if(ele.cName.toLowerCase() == childData.toLowerCase() || ele.billNumber == childData) {
				return ele
			}
		});
		fetchUserEntries(filteredEntry);
		//console.log(filteredEntry);
		
		}
	}
	
	function setModalStatus(modalStat) {
		setCloseModal(modalStat);
		console.log('close modal', modalStat);
		//getLists();
	}
	
	const downloadData = async() => {
		const fileName = "redeemed"+new Date();
  const json = JSON.stringify(entries);
  const blob = new Blob([json],{type:'application/json'});
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
  <div style={{"display":"flex", "marginBottom":"15px"}}>
  </div>
  <div style={{"display":"flex"}}>
  <FilterEntries parentCallback={callbackFunction} />
  <div ref={el => (billPrint = el)} >
	  <PledgeBill billNum = {billNo} /> 
  </div>
  <div style={{"marginLeft":"auto"}}>
  <button onClick={downloadData} style={{"marginRight":"15px"}}> Download </button>
  <ReactToPrint
          trigger={() => <button>Print</button>}
          content={() => componentRef}
        />
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
  <li style={{"color":"red"}}>Redemption Date</li>
  <li>Remark</li>
  <li>Actions</li>
  </ul> 
  <RenderTableData /> 
  </div>
  : <h3 style={{"marginTop":"50px", "textAlign":"centre"}}> Loading... </h3>} 
  {editModal && closeModal == "open" ? <EditEntryModal toEdit={editId} parentModalCallBack={setModalStatus} /> : ''}
   
  
  {deleteModal && (delId != undefined || delId != '' || delId != null) ? 
<>  
  <div className="page-overlay"></div>
  <div className="delete-modal">
	<button className="close-modal" onClick={cancelDelete} ></button>
	<p> Are you sure you want to delete entry with Bill No: {delId} </p>
	<button onClick={() => confirmDeletion(true)}> Yes </button> 
	<button onClick={cancelDelete}> No </button>
  </div>
  </>
  : '' }
  </>
  
)
}

export default RedeemedEntries;
