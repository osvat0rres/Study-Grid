import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated  } from "../../auth";

function ProtectedRoute({ children}){
    // check weather an access token exits
    if (!isAuthenticated()){
        return <Navigate to="/login" replace />;
    }

    //If authenticated, display the requested component
    return children;
};


export default ProtectedRoute;