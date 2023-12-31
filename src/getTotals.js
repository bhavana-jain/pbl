import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import './App.css';
import axios from 'axios';
import { User } from './userContext.js';
import _ from 'lodash';

  
const GetAllTotal = (props) => {
	
	const [entries, fetchUserEntries] = useState([]);
	const [allEntries, saveAllEntries] = useState();
	let value = useContext(User);
	
	const getLists = () => {
		axios.get("http://localhost:4000/customers/get-result", { params: { createdBy: value.data.userName } })
			.then(response => {
				fetchUserEntries(response.data);
				saveAllEntries(response.data);
			});
	};

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

	const [totals, showAllTotals] = useState(false);

	const showTotals = () => {
		showAllTotals(!totals);
	}

	useEffect(() => {
		getLists();
	}, []);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return
		}
		getTotals();
		getDifference();
		filterUnreedemedEntry();
	}, [allEntries, totalAmount, redemAmount]);


  return (
  <> 
<div>
<span className={totals ? 'icon-eye-blocked' : 'icon-eye' } onClick={showTotals}>  </span>
<span>{totals ? diffAmount: 'View Details'} </span>
</div>
 </>
 )
}

export default GetAllTotal;
