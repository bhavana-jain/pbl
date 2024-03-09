import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import moment from 'moment';
import ReactToPrint from "react-to-print";
import PledgeBill from './pledgeBill.js';
import ListExample from './listFunction.js';
import FilterEntries from './searchEntry.js';
import { User } from './userContext.js';
import NavBar from './navBar.js';

const AddEntry = () => {
	const [entries, fetchUserEntries] = useState([]);
	const [loading, isSetLoading] = useState(false);
	const isFirstRender = useRef(true);
	let value = useContext(User);
	const date = useRef();
	const cName = useRef();
	const address = useRef();
	const cityPincode = useRef();
	const metalType = useRef();
	const page = useRef(null);

	// Fetch entries to get last bill number
	const getLists = () => {
		isSetLoading(false);
		axios.get("http://localhost:4000/customers/get-result", { params: { createdBy: value.data.userName } })
			.then(response => {
				fetchUserEntries(response.data);
				isSetLoading(true);
			});

	};

	const [names, setAllNames] = useState([]);
	const [addresses, setAllAddress] = useState([]);
	const[items, setAllItems] = useState([]);
	let allNames = [], allAddress = [], allItems = [];

	const fetchNameAddress = () => {
		entries.map(function (ele, i) {
			let art = ele.articleName;
			allNames.push(ele.cName);
			allAddress.push(ele.address);
			
			allItems.push(...art);
		})
		
		// Remove duplicates from name, address and article name array
		setAllNames([...new Set(allNames)]);
		setAllAddress([...new Set(allAddress)]);
		setAllItems([...new Set(allItems)]);
	}

	// Create and update new bill number
	const [updatedBillNum, setNewBillNum] = useState(0);
	const setBillNumber = () => {
		let newBill, len, currentYear = new Date().getFullYear();
		if (entries.length > 0) {
			len = entries.length;
			let arrlen = (entries[len - 1].billNumber);
			// Temp bill number check -- to be removed later
			
			// if (arrlen.split('/').length > 1 && currentYear == arrlen.split('/')[1]) {
				if (arrlen.split('/').length > 1) {
				newBill = parseInt((arrlen.split('/')[0])) + 1;
			}
			else {
				// newBill = 1;
			}
		}

		else {
			newBill = 1;
		}
		let newBillNum = newBill + "/" + new Date().getFullYear();
		setNewBillNum(newBillNum);
	}


	useEffect(() => {
		console.log('1');
		setTimeout(function(){
			setBillNumber();
		}, 100);
		fetchNameAddress();
	}, [entries]);
	useEffect(() => {
		getLists();
	}, []);

	// Get last bill number, after data is fetched
	useEffect(() => {
		console.log('2');
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return
		}
		else if (entries.length) {
			setTimeout(function(){
				setBillNumber();
			}, 100);
		}
	}, [loading, entries]);

	const [inputVal, setInputValue] = useState(
		{
			"cName": "",
			"date": "",
			"address": "",
			"cityPincode": "Chennai - 600 081",
			"amount": "",
			"redemptionAmount": "",
			"billNumber": updatedBillNum,
			"redemptionDate": "",
			"articleName": "",
			"metal": "",
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
		console.log('triggering');
		let value;
		if (e.target.name == "billNumber") {
			setNewBillNum(e.target.value)
		}
		else {
			value = e.target.value;
		}
		setInputValue({ ...inputVal, [e.target.name]: value, "articleName": article, "billNumber": updatedBillNum });
	}

	const [oldBill, setOldBill] = useState();

	function setBillDetails(e){
		setInputValue({ ...inputVal, [e.target.name]: e.target.value });
		setOldBill(e.target.value);
	}

	const fetchBillDetails = async () => {
		let existing;
		let filteredEntry = entries.filter(function(ele) {
			if((ele.billNumber) == oldBill) {
				return ele
			}
		});
		const response = await axios.get("http://localhost:4000/customers/update-student/" + filteredEntry[0]._id);
		existing = response.data;
		delete existing._id
		setInputValue(existing);
		articleList(article => article.concat(existing.articleName));
	}

	const [article, articleList] = useState([]);
	const [newArticle, setNewArticle] = useState('');

	// Append articles to the list on top of article name input field
const updateArticles = (e) => {
	if(e.keyCode == 13) {
		console.log(e.target.value);
		articleList(article => article.concat(e.target.value));
		setNewArticle('')
	}
}

// Remove clicked article name 
const removeArticle = (index) => {
	articleList([
    ...article.slice(0, index),
    ...article.slice(index + 1, article.length)
  ]);
}
	const [nameSuggestion, showNameSuggestion] = useState("");
	const [addressSuggestion, setAddressSuggestion] = useState(false);
	const[articleSuggestion, setArticleSuggestion] = useState(false);
	const [navigateList, setListNumber] = useState(0);
	let fieldvalue;

	const checkIfDropdown = (e) => {
		if (!e.target.classList.contains('suggestion-name')) {
			showNameSuggestion(false);
			setAddressSuggestion(false);
			setArticleSuggestion(false);
		}

	}
	function showNames(e) {
		showNameSuggestion(true);
	}

	function showAddress(e) {
		setAddressSuggestion(true);
	}

	function showItems(e) {
		setArticleSuggestion(true);
	}

	const updateInput = (name, refName) => {
		console.log(refName);
		setInputValue({ ...inputVal, "cName": name });
	}

	const [metal, setMetal] = useState();
	function updateMetal(e) {
		setMetal(e.target.value);
	}

	
	
	function updateArticleName(e) {
		let value = e.target.value;
		articleList(article => {
			article.concat(value);
			
		});
	}

	
	function appendInput(e) {
		inputCounter(counter + 1);
		let ele = document.createElement("input");
		ele.type = "text";
		ele.placeholder = "Enter article Name";
		ele.id = "article" + counter;
		document.getElementById("addArticle").appendChild(ele);
		ele.setAttribute('autosuggest', 'off');
		ele.onblur = function (ele) {
			saveArticle(ele);
		}
		// Add new input field, when enter key is pressed
		ele.onkeydown = (e) =>  {
			if(e.keyCode == 13){
				console.log('is enter');
				appendInput();
			}
		}
	}

	let listVal = [], val = '';
	const [name, articleName] = useState();

	useEffect((e) => {
		// Add add article input dynamically 
		// appendInput();
	}, []);

	useEffect((e) => {
		//	appendInput();
		setInputValue({ ...inputVal, "articleName": article });
	}, [article]);


	// Create list of articles array
	function saveArticle(e) {
		var art = document.getElementById('addArticle');
		var allArt = art.getElementsByTagName("input"), list = [];
		for (let i = 0; i < allArt.length; i++) {
			list.push(allArt[i].value);
		}
		articleList(list);

	}

	useEffect((e) => {
		// Duplicating for printing bill, as original form values will be cleared once data is posted
		setFormVal({ ...inputVal, "date": date.current.value, "metal": metalType.current.value, "createdBy": value.data.userName });
	}, [inputVal]);


	// Save button only - added temp
	const postDataOnly = (e) => {
		e.preventDefault();
		postData();
	}

	const postData = (e) => {
		// e.preventDefault();
		//console.log(article, 'after update');
		console.log('articles', article)
		axios.post('http://localhost:4000/customers/create-student', { ...inputVal, "date": date.current.value, "metal": metalType.current.value, "createdBy": value.data.userName, "cityPincode": cityPincode.current.value }, { headers: { 'Content-Type': 'application/json' } })
			.then(res => {
				console.log(res.data);
				setInputValue({
					"cName": "",
					"date": "",
					"address": "",
					"cityPincode": "Chennai - 600 081",
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
		// articleList([]);
		// document.getElementById("addArticle").innerHTML = "";
		// document.getElementById("first-field").focus();
		// appendInput();
	}

	const setData = (e) => {
		postData(e);
	}


	return (
		<div className='add-entry' onClick={checkIfDropdown} ref={page} style={{ "minHeight": "100vh" }}>
			<NavBar page="addEntry" />
			<form className="entry-form" 
			onSubmit={(e) => {e.preventDefault()}}
			onKeyDown={(e) => {if(e.keyCode == 13) {e.preventDefault()}}}
			>
				<div className={`relative ${nameSuggestion ? "hasDropdown" : ""}`}>
					<label htmlFor="cName">Name</label>
					<input type="text" name="cName" id="first-field" placeholder="Enter name" value={inputVal.cName} AutoComplete="off"
						onChange={e => { handleChange(e); showNameSuggestion("cName"); setListNumber(0) }}
						className={`suggestion ${nameSuggestion ? "active" : ""}`}
						onBlur={(e) => showNameSuggestion(false)}
						onKeyDown={(e) => {
							let count = names.filter((ele) => ele.toLowerCase().startsWith(inputVal.cName.toLowerCase()));
							// setListNumber(navigateList+1);
							if (e.keyCode == 40) {
								console.log(navigateList, count.length)
								if (navigateList == count.length - 1) {
									console.log('equal equal');
								}
								else {
									setListNumber(navigateList + 1);
									
								}
							}
							else if (e.keyCode == 38 && navigateList >= 1) {
								console.log(navigateList, count.length)

								//	if(navigateList == 1){ return false} 
								if (navigateList == 1) {
									setListNumber(0);
								}
								else {
									setListNumber(navigateList - 1);
								}

							}
							else if (e.keyCode == 13) {
								setInputValue({ ...inputVal, "cName": count[navigateList] })
								setListNumber(0);
								showNameSuggestion(false);

							}
						}}
						ref={cName} />
					<ul className="suggestion-list">
						{names.filter((ele) => ele.toLowerCase().startsWith(inputVal.cName.toLowerCase())).map(function (data, idx) {
							return <li className={`suggestion-name ${navigateList == idx ? "highlight" : ""}`}
								onClick={() => {
									setInputValue({ ...inputVal, "cName": data }); showNameSuggestion(false);
								}}
								onMouseDown={(e) => e.preventDefault()} // Added to prevent the blur event trigger
							>{data}

								{/* Assigning highlighted value to the var fieldvalue, as using state here causes infinite re-render issue */}
								<div style={{ "display": "none" }}>{navigateList == idx ? fieldvalue = data : ''}</div>
							</li>

						})}
					</ul>
				</div>
				<div className={`relative ${addressSuggestion ? "hasDropdown" : ""}`}>
					<label htmlFor="address">Address</label>
					<input type="text" name="address" placeholder="Enter address" value={inputVal.address}
						onChange={e => { handleChange(e); showAddress(e); setListNumber(0) }}
						onBlur={(e) => setAddressSuggestion(false)}
						className={`suggestion ${addressSuggestion ? "active" : ""}`}
						autoComplete='off'
						onKeyDown={(e) => {
							let count = addresses.filter((ele) => ele.toLowerCase().includes(inputVal.address.toLowerCase()));
							console.log('address', count);
							// setListNumber(navigateList+1);
							if (e.keyCode == 40) {
								console.log(navigateList, count.length)
								if (navigateList == count.length - 1) {
									console.log('equal equal');
								}
								else {
									setListNumber(navigateList + 1);
								}
							}
							else if (e.keyCode == 38 && navigateList >= 1) {
								console.log(navigateList, count.length)

								//	if(navigateList == 1){ return false} 
								if (navigateList == 1) {
									setListNumber(0);
								}
								else {
									setListNumber(navigateList - 1);
								}

							}
							else if (e.keyCode == 13) {
								setInputValue({ ...inputVal, "address": count[navigateList] })
								setListNumber(0);
								setAddressSuggestion(false)

							}
						}}
						ref={address}
					/>
					<ul className='suggestion-list'>
						{addresses.filter((ele) => ele.toLowerCase().includes(inputVal.address.toLowerCase())).map(function (data, idx) {
							return <li className={`suggestion-name ${navigateList == idx ? "highlight" : ""}`} 
							onClick={() => updateInput(data, address)}
							onMouseDown={(e) => e.preventDefault()}
							>{data} 
							{/* Assigning highlighted value to the var fieldvalue, as using state here causes infinite re-render issue */}
							<div style={{ "display": "none" }}>{navigateList == idx ? fieldvalue = data : ''}</div>
							</li>
						})}
					</ul>
				</div>
				<div>
					<label htmlFor="cityPincode">City</label>
					<input type="text" name="cityPincode" placeholder="Enter city and pincode" value={inputVal.cityPincode} defaultValue="Chennai - 600 081" onChange={handleChange} autoComplete="off" ref={cityPincode} />
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
						value={inputVal.oldBillNumber} 
						onChange={setBillDetails} 
						onKeyDown={(e) => {if(e.keyCode == 13) {fetchBillDetails()}}}
						/>
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
				{/* <div>
					<label htmlFor="remark">Remarks</label>
					<input type="text" name="remark" placeholder="Remark" onChange={handleChange} value={inputVal.remark} autoComplete="off" />
				</div> */}
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
				<div style={{ "float": "none" }}> 
					<label htmlFor="articleName" style={{ "display": "inline-block" }}>Article Name</label>				
					{/* <button className="add-more" onClick={appendInput} style={{ "display": "inline-block" }}> + </button> */}
					{article.length > 0 ? <ul className='articles'>{article.map(function (ele, i) {
			return <li onClick={() => removeArticle(i)}>{ele} <span style={{ "display": "inline-block", "marginLeft":"5px"}}>X</span></li>
		})}</ul> : ''} 
					{/* <div id="addArticle">
					</div> */}
					<input type="text" name="articleName" placeholder="Article Name" 
					 autoComplete="off"
					 value={newArticle}
					 className={`suggestion ${articleSuggestion ? "active" : ""}`}
						onBlur={(e) => setArticleSuggestion(false)}
					 onChange={(e) => {setNewArticle(e.target.value);setArticleSuggestion(true); setListNumber(0) }}
					 onKeyDown={(e) => {
						console.log(items);
						let count = items.filter((ele) => ele.toLowerCase().includes(newArticle.toLowerCase()));
						// setListNumber(navigateList+1);
						if (e.keyCode == 40) {
							console.log(navigateList, count.length)
							if (navigateList == count.length - 1) {
								console.log('equal equal');
							}
							else {
								setListNumber(navigateList + 1);
							}
						}
						else if (e.keyCode == 38 && navigateList >= 1) {
							console.log(navigateList, count.length)

							//	if(navigateList == 1){ return false} 
							if (navigateList == 1) {
								setListNumber(0);
							}
							else {
								setListNumber(navigateList - 1);
							}

						}
						else if (e.keyCode == 13) {
							console.log('enter key pressed');
							setNewArticle(count[navigateList]);
							setInputValue({ ...inputVal, "articleName": article })
							setListNumber(0);
							articleList(article => article.concat(count[navigateList]));
							setArticleSuggestion(false);
							setNewArticle('');

						}
					}}
					/>
					<ul className="suggestion-list">
						{items.filter((ele) => ele.toLowerCase().includes(newArticle.toLowerCase())).map(function (data, idx) {
							return <li className={`suggestion-name ${navigateList == idx ? "highlight" : ""}`}
								onClick={() => {
									articleList(article => article.concat(data));
									setInputValue({ ...inputVal, "articleName": article }); setArticleSuggestion(false);
									setNewArticle(data);
								}}
								onMouseDown={(e) => e.preventDefault()} // Added to prevent the blur event trigger
							>{data}

								{/* Assigning highlighted value to the var fieldvalue, as using state here causes infinite re-render issue */}
								<div style={{ "display": "none" }}>{navigateList == idx ? fieldvalue = data : ''}</div>
							</li>
						})}
					</ul>
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
				 <PledgeBill test={formVal} billType="Original Bill" />
				<PledgeBill test={formVal} billType="Duplicate Bill" /> 
			</div> 
		</div>
	);
}

export default AddEntry;