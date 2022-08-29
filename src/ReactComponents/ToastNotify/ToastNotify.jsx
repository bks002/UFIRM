import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

  // minified version is also included
  // import '../node_modules/react-toastify/dist/ReactToastify.min.css';
 
  class ToastNotify extends React.Component {
    
 
    render(){
      return (
        <div>          
          <ToastContainer />
        </div>
      );
    }
  }
 
export default ToastNotify;