import React, { useState } from "react";

const NotificationButton = ({count, onClick}) => {
  return (
    <div className="nav-item dropdown ml-auto">
      <a
        href="#"
        className="nav-link dropdown-notification-link"
        onClick={onClick}
      >
        <i
          className="fas fa-bell"
          style={{
            fontSize: "22px",
            color: "#fff",
            marginRight: "10px",
          }}
        />
        <span
          className="badge badge-danger navbar-badge"
          style={{
            position: "absolute",
            top: "1px",
            right: "3px",
            borderRadius:"50%"
          }}
        >
          {count}
        </span>
      </a>
    </div>
  );
};

export default NotificationButton;