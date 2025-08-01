import React, { useEffect, useState } from "react";
import NotificationButton from "./NotificationButton";
import NotificationList from "./NotificationList";
import { connect } from "react-redux";
import {fetchNotifications} from "../../Services/notificationService";

const NOTIFICATION_TYPES = ["task", "asset", "complaint"];

const Notification = ({ propId }) => {
  const [dataMap, setDataMap] = useState({
    task: [],
    asset: [],
    complaint: [],
  });
  const [showType, setShowType] = useState(null);

  const loadNotification = async (type) => {
    
    // Check if property ID is valid
    if (!propId || propId === 0) {
      console.warn(`Property ID is invalid: ${propId}. Skipping ${type} notification load.`);
      return;
    }
    
    try {
      const data = await fetchNotifications(type, propId);
      setDataMap((prev) => ({ ...prev, [type]: data }));
    } catch (error) {
      console.error(`Error loading ${type} notifications:`, error);
      setDataMap((prev) => ({ ...prev, [type]: [] }));
    }
  };

  useEffect(() => {
    if (propId && propId !== 0) {
      NOTIFICATION_TYPES.forEach((type) => loadNotification(type));
    } else {
      console.warn("Property ID is not set or invalid:", propId);
    }
  }, [propId,showType]);

  const handleShowList = (type) => {
    setShowType((prev) => (prev === type ? null : type));
  };

  return (
      <>
        {NOTIFICATION_TYPES.map((type) => (
            <NotificationButton
                key={type}
                count={dataMap[type].length}
                type={type}
                onClick={() => handleShowList(type)}
            />
        ))}

        {showType && (
            <NotificationList
                nList={dataMap[showType]}
                apiCall={() => loadNotification(showType)}
            />
        )}
      </>
  );
};

const mapStateToProps = (state) => ({
  propId: state.Commonreducer.puidn,
});

export default connect(mapStateToProps)(Notification);