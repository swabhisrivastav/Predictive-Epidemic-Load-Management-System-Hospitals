import React, { Component } from 'react'
import Home from './Dashboard'
import '../Stylesheets/MyStyle.css';
import Styles from '../Stylesheets/MyStyles.module.css'
import { Navigate } from 'react-router-dom'; 


export class Login extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      userName: '',
      Password: '',
      blankError: '',
      loginError: '',
      displayForm: false,
     
    }
  }
  // creating  array of 10 employees
  employees = [
    { employeeid: 1, employeename: 'Swabhi', username: 'Swabhi16', password: 'swabhi1234', salary: 25000 },
    { employeeid: 2, employeename: 'Sanvi', username: 'Sanvi12', password: 'san123', salary: 10000 },
    { employeeid: 3, employeename: 'Anya', username: 'Anya89', password: 'anya12', salary: 50000 },
    { employeeid: 4, employeename: 'Rohan', username: 'Rohan1', password: 'rohan123', salary: 12000 },
    { employeeid: 5, employeename: 'Priya', username: 'Priya56', password: 'priya789', salary: 60000 },
    { employeeid: 6, employeename: 'Aditya', username: 'Aditya12', password: 'password', salary: 50000 },
    { employeeid: 7, employeename: 'Swati', username: 'swati', password: 'swati123', salary: 70000 },
    { employeeid: 8, employeename: 'Abhishek', username: 'abhi', password: 'abhi12', salary: 57000 },
    { employeeid: 9, employeename: 'Harsh', username: 'Harsh123', password: 'harshpass', salary: 56000 },
    { employeeid: 10, employeename: 'Riya', username: 'riyaa', password: 'ri789', salary: 30000 },
  ];
  handleUserNameChange = (event) => {
    this.setState({userName:event.target.value,blankError: '',loginError:''})
  }
  handlePasswordChange = (event) => {
    this.setState({Password:event.target.value,blankError: '',loginError:''})
  }
  handleSubmit = (event) => {
    event.preventDefault(); // to prevent reloading of page 
    const { userName, Password } = this.state;
     //checking for blank fields
    if (!userName || !Password) {
      this.setState({ blankError: 'Username or Password cannot be blank.' });
      return;} 
    // checking for valid user from employee array 
    let validUser = false;
    this.employees.map(employee => {if(employee.username === userName && employee.password === Password){
            validUser = true;} 
            return employee });
    //if user is valid set display form to true
    if (validUser) {
        this.setState({displayForm: true, blankError: '', loginError: '' });
    } else {
        this.setState({ loginError: 'Incorrect username or password.', blankError: '',displayForm: false });
    }
  }
  
  render() {
    const { userName,Password,blankError,loginError,displayForm} = this.state
    if (displayForm) {
        return <Navigate to="/" />;
      }
      // to display home page if no error
    return ( 
    <div>
      <form onSubmit = {this.handleSubmit}>
        <label> Username</label>
        <input type = "text" value = {userName} onChange = {this.handleUserNameChange}/><br/><br/>
        <label> Password</label>
        <input type = "password" value = {Password} onChange = {this.handlePasswordChange}/><br/><br/> 
        <button type = 'submit' > Login</button>
        {blankError ? <p className="error">{blankError}</p> : null} {/* using stylesheet css */}
        {loginError ? <p className={Styles.error}>{loginError}</p> : null} {/* using css module */}
      </form>
    </div>
    );
  }
}

export default Login; 