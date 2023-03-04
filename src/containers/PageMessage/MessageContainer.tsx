import { useCallback, useEffect, useState, useRef } from 'react';
import EmojiPicker, { EmojiStyle, EmojiClickData } from "emoji-picker-react";
import { ContentEditableEvent } from 'react-contenteditable';
import { Button, IconButton } from "@material-ui/core";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import { IoSend } from "react-icons/io5";
import { io } from "socket.io-client";
import axios from 'axios';
import { UserData } from "app/reducers/auth.reducers";
import EmptyChatRoom from "./EmptyChatRoom";
import MessageBox from "./MessageBox";
import Message from "./Message";
import { config } from "app/config";
import defaultAvatar from 'images/default_avatar.png';

const MessageContainer = ({ currentchat, user, chatroomtiles }) => {
  const API_URL = config.API_URL;
  const [pick, setPick] = useState(false);
  const [online, setOnline] = useState(false);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [amigo, setAmigo] = useState<UserData>();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [down, setDown] = useState(0);
  const roomRef = useRef(null);
  const socket = useRef(null);

  /* Emoji Picker */
  const addEmoji = useCallback((emojiData: EmojiClickData, event: MouseEvent) => {
    let url = emojiData.getImageUrl(EmojiStyle.APPLE);
    let emoji = `<img class="emoji-image" src=${url} alt=${emojiData.emoji}/>`
    setNewMessage(prev => prev + emoji);
  }, [newMessage]);
  const openPicker = useCallback(() => {
    setPick(!pick);
  }, [pick]);

  useEffect(() => {
    socket.current = io(API_URL);
    socket.current.on("getMessage", (data: any) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, [API_URL]);

  useEffect(() => {
    arrivalMessage &&
      currentchat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentchat]);

  useEffect(() => {
    socket.current.emit("addUser", user?._id);
  }, [user, chatroomtiles, currentchat, socket]);

  /* Fetching the Chat Tile user details */
  useEffect(() => {
    const amigoId = currentchat?.members.find((m: any) => m !== user._id);
    socket.current.on("getUsers", (users: any) => {
      setOnline(users.find((user: any) => user.userId === amigoId));
    })
    const getAmigodetails = async () => {
      try {
        const response = await axios.post(API_URL + "api/users/findOne", {
          userId: amigoId
        });
        const amigoData = response.data.data;
        setAmigo(amigoData);
      } catch (err) { }
    };
    if (currentchat) {
      getAmigodetails();
    }
  }, [user, currentchat, API_URL]);

  /* Fetching ChatRoom Messages */
  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axios.get(API_URL + "api/messages/" + currentchat?._id);
        setMessages(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    if (currentchat) {
      getMessages();
    }
  }, [currentchat, API_URL]);

  useEffect(() => {
    scrollItThere();
  }, [messages]);

  const scrollItThere = useCallback(() => {
    roomRef.current?.scroll({
      top: roomRef.current?.scrollHeight,
      behavior: 'smooth'
    });
  }, [])

  const handleSubmit = useCallback(async (e: any) => {
    if (!newMessage) return;
    let textMessage = newMessage;
    if (textMessage.startsWith("<img") && (textMessage.match(/<img/g) || []).length === 1 && textMessage.endsWith("/>")) {
      textMessage = textMessage.replace('class="emoji-image"', 'class="emoji-image-full"');
    }
    const sendingMessage = {
      chatroomId: currentchat._id,
      senderId: user._id,
      text: textMessage,
    };

    const receiverId = currentchat.members.find(
      (member: any) => member !== user._id
    );

    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: textMessage,
    });

    try {
      const response = await axios.post(API_URL + "api/messages/", sendingMessage);
      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
    setPick(false)
  }, [newMessage, currentchat]);

  /* Posting a Message */
  const handleMessageKey = (e: any) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      setDown(prev => prev + 1);
    }
  }

  useEffect(() => {
    handleSubmit(null);
  }, [down])

  const handleMessage = (e: ContentEditableEvent) => {
    setNewMessage(e.target.value);
  }

  return (
    <div className="chatroom">
      {currentchat ? (
        <>
          <div className="chatroom-header">
            <div className="chatroom-chatinfo">
              <img className='chatroom-profilepic' src={amigo?.avatar ? `${API_URL}uploads/${amigo.avatar}` : defaultAvatar} alt='' />
              <div className="chatroom-chatinfo-right">
                <div className="chatroom-chatinfo-name">
                  <a href={`/page-author/${amigo?._id}/${amigo?.view_mode || 0}`} className="chatroom-chatinfo-name">{amigo ? amigo?.username : ""}</a>
                </div>
                <div className="chatroom-top-header">
                  <span>Last seen: 2 hours ago</span>
                  <span> | </span>
                  <span>Local time: Jan 30, 2023, 05:10</span>
                </div>
              </div>
            </div>
            {/* <div className="chatroom-search">
                  <div className="chatroom-search-container">
                    <SearchIcon className="chatroom-searchicon" />
                    <input type="text" name="chat-search" placeholder="Search message..." />
                  </div>
                </div> */}
          </div>
          <div className="chatroom-container">
            <div className="flex flex-col w-full h-full">
              <div className="chatroom-messages-container" ref={roomRef} onClick={() => { setPick(false) }}>
                {messages.map((message, index) => (
                  <div key={index}>
                    <Message message={message} amigo={amigo} own={message?.senderId === user._id} />
                  </div>
                ))}
              </div>
              <div className="chatroom-footer">
                <div className="chatroom-footer-lefticons">
                  <IconButton onClick={openPicker}>
                    <InsertEmoticonIcon />
                  </IconButton>
                </div>
                <form onSubmit={handleSubmit}>
                  <MessageBox
                    id="message-input"
                    className="message-input"
                    placeholder="Message..."
                    html={newMessage}
                    onKeyDown={handleMessageKey}
                    onChange={handleMessage}
                  />
                  <button type="submit" className="input-button" onClick={newMessage ? handleSubmit : null} > Send a Message </button>
                </form>
                <div className="chatroom-footer-righticon" onClick={newMessage ? handleSubmit : null} >
                  <Button className="btn-send">
                    <span className="send-text">SEND</span>
                    <IoSend className="ml-5" color="white" size={18} />
                  </Button>
                </div>
              </div>
            </div>
            <div className="chatroom-profile">
              <div className="flex flex-col gap-5">
                <img className="profile-photo" src={amigo?.avatar ? `${API_URL}uploads/${amigo.avatar}` : defaultAvatar} alt='' />
                <div className={online ? "profile-online" : "profile-offline"}><span /> <p className="m-0">{online ? "Active" : "Inactive"}</p></div>
              </div>
            </div>
          </div>
          <div className={pick ? "emoji-picker-open" : "emoji-picker-close"} >
            <EmojiPicker
              onEmojiClick={addEmoji}
              autoFocusSearch={false}></EmojiPicker>
          </div>
        </>
      ) : (
        <EmptyChatRoom />
      )}
    </div>
  )
}

export default MessageContainer;