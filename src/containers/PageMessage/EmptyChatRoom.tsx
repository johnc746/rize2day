import emptyImage from 'images/empty-message.png'

function EmptyChatRoom() {
  return (
    <div>
      <div className="EmptyChatroom">
        <img className="emptychatroom-img"
          src={emptyImage}
          alt=""
        ></img>
        <p className="empty-chatroom-mainhead">Welcome To Our Rize Chat!</p>
      </div>
    </div>
  );
}

export default EmptyChatRoom;
