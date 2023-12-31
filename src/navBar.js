import React, { useContext} from 'react';
import {Link } from 'react-router-dom';
import './App.css';
import { User } from './userContext.js';
import GetAllTotal from './getTotals.js'

const NavBar = (props) => {
  let value = useContext(User);

  return (
    <div className="navbar" >
          <ul className="tabs" id="page-tabs">
            <li className={`${props.page=="addEntry" ? "active" : ""}`}>
              <Link to="/addEntry">Add Entry</Link>
            </li>
            <li className={`${props.page=="unreedemed" ? "active" : ""}`}>
              <Link to="/unredeemed">Unredeemed Entries</Link>
            </li>
            <li className={`${props.page=="redeemed" ? "active" : ""}`}>
              <Link to="/redeemed"> Redeemed Entries</Link>
            </li>
            <li className={`${props.page=="interestCalc" ? "active" : ""}`}>
              <Link to="/InterestCalculator"> Interest Calculator</Link>
            </li>
            <li className={`${props.page=="pledge" ? "active" : ""}`}>
              <Link to="/pledge"> Pledge</Link>
            </li>   
            <li className={`${props.page=="notice" ? "active" : ""}`}>
              <Link to="/Notice"> Notice Issue</Link>
            </li>   
            <li className={`${props.page=="dform" ? "active" : ""}`}>
              <Link to="/FormD"> Form D</Link>
            </li>            
          </ul>
          <div style={{"marginLeft": "auto", "display":"flex", "textAlign":"right", "flexDirection":"column", "alignItems":"flex-start"}}>
            <div style={{"display":"flex"}}>
            <h5 style={{"margin": "0"}}>Welcome {value.data.userName} !</h5>
            <div style={{"textAlign": "right", "fontSize":"12px"}}> 
            <Link to="/" className='icon-exit'> </Link>
              </div>
            </div>
            
            <div className='totals'><GetAllTotal/></div>
          </div>
        </div>
  )
}

export default NavBar;
