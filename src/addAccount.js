import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { User } from './userContext.js';

const Account = () => {
  const [accountInfo, setAccountInfo] = useState();
  let value = useContext(User);
  const navigate = useNavigate();

  const [userLogin, setUserLogin] = useState(true);
  const [userAccount, setUserAccount] = useState(false);
  const [userName, setUserName] = useState();
  const [loginError, SetLoginError] = useState(false);

  function handleChange(e) {
    let value = e.target.value;
    setAccountInfo({ ...accountInfo, [e.target.name]: value });
    value.updateAccount({ ...value.data, ...{[e.target.name]: value}} );
  }

  function handleuserChange(e) {
    let value = e.target.value;
    setUserName({ [e.target.name]: value });
   // value.updateAccount({ ...value.data, ...{[e.target.name]: value}} );
  }
  const validateUser = async (e) => {
    e.preventDefault();
    const res = await axios.get('http://localhost:4000/user/get-account', { params: { userName: userName.userName } });
    // console.log(res.data);
    if (res.data.length) {
      value.updateAccount(...res.data);
      navigate('/addEntry');
    }
    else {
      SetLoginError(true)
    }
    // setRefId(res.data._id);
  }
  const addNewAccount = (e) => {
    e.preventDefault();
    setUserLogin(false);
    setUserAccount(true);
  }

  const postAccountDetails = (e) => {
    e.preventDefault();
    // Update value to user provider so that it can be accessed all across the application
    value.updateAccount({ ...value.data, ...accountInfo, ...userName });
    // console.log(accountInfo);
    axios.post('http://localhost:4000/user/create-account/', accountInfo, { headers: { 'Content-Type': 'application/json' } })
      .then(res => {
      //  console.log(res.data)
      value.updateAccount({ ...value.data, ...accountInfo, ...userName });
        setAccountInfo({
          "userName": "",
          "companyName": "",
          "address": "",
          "area": "",
          "license": ""
        })
       // console.log(value.data);
        navigate('/addEntry');
      });

  }

  return (
    <div className='page-bg'>
      
      <form className={`addAccount ${userLogin ? "show" : "hide"}`}>
        <div>
          <label htmlFor="userName">User Name</label>
          <input type="text" name="userName" placeholder="Enter user name" onChange={handleuserChange} autoComplete="off" />
          {loginError ? <p style={{ "color": "red", "fontSize": "12px", "margin": "-10px 0 10px 0" }}>User Name does not Exist. Add New Account</p> : ""}
        </div>
        <div style={{"textAlign":"center"}}>
          <button type="submit" onClick={validateUser}> Login </button>
          <button type="submit" style={{ "marginLeft": "10px" }} onClick={addNewAccount}> Add New Account </button>
          <h5>Or</h5>
          <button type="submit">Upload Backup File</button>
        </div>
      </form>

      <form className={`addAccount ${userAccount ? "show" : "hide"}`}>

        <label htmlFor="userName">User Name</label>
        <input type="text" name="userName" placeholder="Enter user name" onChange={handleChange} autoComplete="off" />

        <label htmlFor="companyName">Trade Name</label>
        <input type="text" name="companyName" placeholder="Enter name" onChange={handleChange} autoComplete="off" />

        <label htmlFor="address">Address Line 1</label>
        <input type="text" name="address" placeholder="Address" onChange={handleChange} />

        <label htmlFor="area">Address Line 2</label>
        <input type="text" name="area" placeholder="Area" onChange={handleChange} />

        <label htmlFor="contactNo">Contact No.</label>
        <input type="number" name="contactNo" placeholder="Contact No" onChange={handleChange} />

        {/* <label htmlFor="pincode">Pin Code</label>
        <input type="text" name="pincode" placeholder="Pin Code" onChange={handleChange} /> */}

        <label htmlFor="license">License Number</label>
        <input type="text" name="license" placeholder="License Number" onChange={handleChange} />

        <label htmlFor="pTanNO">License Number</label>
        <input type="text" name="pTanNO" placeholder="PTAN Number" onChange={handleChange} />

        <button type="submit" style={{ "display": "block", "margin": "0 auto" }} onClick={postAccountDetails}> Create Account </button>
      </form>
    </div>
  );
}

export default Account;
