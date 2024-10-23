import React, { useEffect, useState } from "react";
import NotificationButton from "./NotificationButton";
import NotificationList from "./NotificationList";

const Notification = () => {
  const [nCount, setNCount] = useState(0);
  const [list, setList] = useState({});
  const [showList,setShowList] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      const response = await fetch("https://api.urest.in:8096/FMTaskNotification");
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setList(data);
        setNCount(data.length);
      } else {
        setNCount(0);
      }
    };
    fetchNotification();
  }, [showList]);

  const handleShowList = () => {
    setShowList(!showList);
  };

  return (
    <>
    <NotificationButton count={nCount} onClick={handleShowList}  />
    {showList && <NotificationList nList={list} apiCall={handleShowList}/>}
    
    </>
  );
};

export default Notification;
