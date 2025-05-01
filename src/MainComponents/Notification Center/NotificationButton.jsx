import React from "react";
import FontAwesome from "react-fontawesome";

const NotificationButton = ({ count = 0, type, onClick = () => {} }) => {
    // Decide the icon name based on type
    const getIconName = () => {
        switch (type) {
            case 'asset':
                return 'cog'; // gear icon
            case 'complaint':
                return 'exclamation-circle'; // complaint-related icon
            default:
                return 'check-circle'; // default icon
        }
    };

    return (
        <div className="nav-item dropdown ml-auto">
            <a
                href="#"
                className="nav-link dropdown-notification-link"
                onClick={onClick}
                role="button"
                aria-label={`You have ${count} new notifications`}
            >
                <FontAwesome
                    name={getIconName()}
                    className="notification-icon"
                    style={{
                        fontSize: "22px",
                        color: "#fff",
                        marginRight: "10px",
                    }}
                />
                {count > 0 && (
                    <span
                        className="badge badge-danger navbar-badge"
                        style={{
                            position: "absolute",
                            top: "1px",
                            right: "3px",
                            borderRadius: "50%",
                        }}
                    >
                        {count}
                    </span>
                )}
            </a>
        </div>
    );
};

export default NotificationButton;
