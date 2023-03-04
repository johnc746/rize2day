import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { io } from "socket.io-client"
import { FaStar } from "react-icons/fa"
import { FiStar } from "react-icons/fi"
import { RiMailOpenLine } from "react-icons/ri"
import { format } from "timeago.js"
import { config } from 'app/config'
import defaultAvatar from "images/default_avatar.png";

function SidebarChat({ chatroomtile, currentChat, currentUser }) {
    const [user, setUser] = useState(null)
    const [isSelected, SetIsSelected] = useState(false);
    const [online, setOnline] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [latestAt, setLatestAt] = useState('');
    const socket = useRef(null)

    const API_URL = config.API_URL

    useEffect(() => {
        socket.current = io(API_URL);
    }, [API_URL])

    useEffect(() => {
        const amigoId = chatroomtile.members.find((m) => m !== currentUser._id);
        const currentId = currentChat?.members.find((m) => m !== currentUser._id);
        if (amigoId === currentId) {
            SetIsSelected(true);
        } else {
            SetIsSelected(false);
        }
        socket.current.on("getUsers", (users: any) => {
            setOnline(users.find((user: any) => user.userId === amigoId));
        })
        const getAmigodetails = async () => {
            try {
                const response = await axios.post(`${API_URL}api/users/findOne`, {
                    userId: amigoId
                })
                setUser(response.data.data)
            }
            catch (err) {
                console.log(err)
            }
        }
        const getLatestMessage = async () => {
            try {
                const response = await axios.get(API_URL + 'api/messages/latest/' + chatroomtile?._id)
                const data = response.data;
                if (data.length > 0) {
                    setLatestAt(format(data[0].createdAt));
                }
            } catch (err) {
                console.log(err);
            }
        }
        getAmigodetails()
        getLatestMessage()
    }, [currentUser, currentChat, chatroomtile, online, API_URL])

    return (
        <div className={isSelected ? 'sidebarchat sidebarchat-select' : 'sidebarchat'}>
            <div className='flex align-items-center'>
                <img className='amigo-profilepic' src={user?.avatar ? `${API_URL}uploads/${user.avatar}` : defaultAvatar} alt='' />
                <div className={online ? "online" : "offline"}></div>
                <div className='flex flex-col justify-center'>
                    <p className="sidebarchat-info-name">{user ? user?.username : ""}</p>
                </div>
            </div>
            <div className='flex flex-col'>
                <div className='flex gap-10 justify-end'>
                    <span className='latest_time'>{latestAt ? latestAt : 'Just now'}</span>
                    {/* <button name="favorite" className='btn-favorite' onClick={() => setFavorite(prev => !prev)}>
                        {favorite ? <FaStar size={20} color='#12A4FF'></FaStar> : <FiStar size={20} color='#8f9199'></FiStar>}
                    </button> */}
                </div>
                <div className='flex gap-10 justify-end'>
                    {/* <span className='badge'>1</span> */}
                    {/* <RiMailOpenLine size={20} color='#8f9199'></RiMailOpenLine> */}
                </div>
            </div>
        </div>
    )
}

export default SidebarChat