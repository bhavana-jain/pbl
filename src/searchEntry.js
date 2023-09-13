import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';
import EditEntryModal from './editEntryModal.js';

  
const FilterEntries = (props) => {
	const [editId, setEditModalId] = useState();
	
	const [search, setSearchVal] = useState();
	
	function handleChange(e) {
	const value = e.target.value;
	// If value is cleared manually, set clear as value, or else input value as value
	if(value == "" || value == null || value == undefined){
		setSearchVal("");
		props.parentCallback("clear");
	}
	else { setSearchVal(value); }
}

function filterEntries(e) {
	console.log(search);
	props.parentCallback(search);
	e.preventDefault();
}

function clearFilter(e) {
	setSearchVal("");
	props.parentCallback("clear");
	e.preventDefault();
}

function handleKeyPress(e) {
	 if(e.charCode == 13){
    props.parentCallback(search);
	e.preventDefault();
  }
}
useEffect(() => {
		 setSearchVal('');
	}, []);

	
  return (
  <> 
  <input type="text" placeholder="Search Name, Address, Bill" name="search"  value={search} onChange={handleChange} style={{"height":"33px" }} onKeyPress={handleKeyPress}/>
  <button onClick={filterEntries} style={{marginLeft:"15px"}}> Search </button>
  <button onClick={clearFilter} style={{marginLeft:"15px"}}> Clear </button>
  </>
)
}

export default FilterEntries;
