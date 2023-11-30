import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Account from './addAccount.js';
import AddEntry from './addEntry.js';
import AllUserEntries from './entryTable.js';
import RedeemedEntries from './redeemedEntries.js';
import PledgeBill from './pledgeBill.js';
import InterestCalculator from './interestCalculator.js';
import NavBar  from './navBar';
import AllPledge from './pledge';

const MainPage = () => {
  return (
    <>
    <div>
    <NavBar />
    </div>       
    <Routes>
      <Route  index path='/addEntry' element={< AddEntry />}></Route>
      <Route path='/unredeemed' element={< AllUserEntries />}></Route>
      <Route  path='/redeemed' element={< RedeemedEntries />}></Route>
      <Route  path='/pledgeBill' element={< PledgeBill />}></Route>
      <Route  path='/interestCalculator' element={< InterestCalculator />}></Route>
      <Route path='/pledge' element={< AllPledge />}></Route>
      
    </Routes>
    </>
  );
}

export default MainPage;
