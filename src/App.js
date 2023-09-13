import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Account from './addAccount.js';
import MainPage from './main.js';
import AddEntry from './addEntry.js';
import AllUserEntries from './entryTable.js';
import RedeemedEntries from './redeemedEntries.js';
import PledgeBill from './pledgeBill.js';
import InterestCalculator from './interestCalculator.js';
import AllPledge from './pledge.js'; 
import NoticeIssue from './noticeIssue.js';
import { User } from './userContext.js';
import NavBar from './navBar';


const App = () => {
  const [user, setUser] = useState({
    "companyName": "",
    "accountName": "",
    "address": "",
    "area": "",
    "pincode": "",
    "license": "",
    "pcanNO": ""
  });

  return (
    <User.Provider value={{ data: user, updateAccount: setUser }}>
      <div className="App">
        <div>
        <Routes>
        <Route exact path='/' element={< Account />}></Route>
        </Routes>
        </div>
       <div>      
        <Routes>
          <Route  path='/addEntry' element={< AddEntry />}></Route>
          <Route path='/unredeemed' element={< AllUserEntries />}></Route>
          <Route  path='/redeemed' element={< RedeemedEntries />}></Route>
          <Route  path='/pledgeBill' element={< PledgeBill />}></Route>
          <Route  path='/interestCalculator' element={< InterestCalculator />}></Route>
          <Route path='/pledge' element={< AllPledge />}></Route>
          <Route path='/notice' element={< NoticeIssue />}></Route>
          
        </Routes>
       </div>

      </div>
    </User.Provider>
  );
}

export default App;
