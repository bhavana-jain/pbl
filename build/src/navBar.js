import React, { useContext} from 'react';
import {Link } from 'react-router-dom';
import './App.css';
import { User } from './userContext.js';


const NavBar = () => {
  let value = useContext(User);

  return (
    <div className="navbar" >
          <ul className="tabs" id="page-tabs">
            <li>
              <Link to="/addEntry">Add Entry</Link>
            </li>
            <li>
              <Link to="/unredeemed">Unredeemed Entries</Link>
            </li>
            <li>
              <Link to="/redeemed"> Redeemed Entries</Link>
            </li>
            <li>
              <Link to="/InterestCalculator"> Interest Calculator</Link>
            </li>
            <li>
              <Link to="/pledge"> Pledge</Link>
            </li>            
          </ul>
          <div style={{"marginLeft": "auto"}}>
            <h5 style={{"margin": "0"}}>Welcome {value.data.userName} !</h5>
            <div style={{"textAlign": "right", "fontSize":"12px"}}>
            <Link to="/"> Logout </Link>
            </div>
          </div>
        </div>
  )
}

export default NavBar;
