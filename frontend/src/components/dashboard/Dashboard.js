import React from 'react';
import { Link } from "react-router-dom";
import { logoutUser } from '../../auth';
import { useNavigate  } from 'react-router-dom';

function Dashboard() {
    /* Hook that allows to naviaget from one page to another programmatically
        without needing the user to click a regular link 
    */
    const navigate = useNavigate(); 

    //When the user logs out, it sends them to the login page
    const handleLogout = () =>{
        logoutUser();
        navigate("/login")
    }
    return(
        <>
        </>
    );
};

export default Dashboard;