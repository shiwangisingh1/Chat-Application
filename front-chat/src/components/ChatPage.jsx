
import React, { useEffect, useRef, useState } from 'react'
import {MdAttachFile, MdSend } from 'react-icons/md'
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { baseURL } from '../config/AxiosHelper';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { getMessages } from '../services/RoomService';
import { timeAgo } from '../config/helper';



const ChatPage = () => {
    const {roomId,currentUser,connected,setConnected ,setRoomId,setCurrentUser}=useChatContext();
   // console.log(roomId);
    //console.log(currentUser);
    //console.log(connected);
const navigate=useNavigate();

    useEffect((

    )=>{
        if(!connected){
        navigate("/");
        }
    },[connected,roomId,currentUser]);
    
const [messages,setMessages]=useState([]);
const [input,setInput]=useState("");
//const inputRef=useRef(null);
const chatBoxRef=useRef(null);
const [stompClient,setStompClient]=useState(null);
//const [roomId,setRoomId]=useState("");
//const [currentUser]=useState("Shiwangi");
//page init:
//messages ko load krne honge
useEffect(()=>{
    async function loadMessages(){
       try{
         const messages=await getMessages(roomId);
         console.log(messages);
         setMessages(messages);
       }catch(error){
        console.error("Error loading messages:", error);
       }
    }
    if (connected) {
    loadMessages()
    }
},[roomId])  // Add roomId as a dependency


useEffect(() => {
    const savedMessages = sessionStorage.getItem(`messages-${roomId}`);
    if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
    }
}, [roomId]);

useEffect(() => {
    sessionStorage.setItem(`messages-${roomId}`, JSON.stringify(messages));
}, [messages, roomId]);


//scroll down
useEffect(()=>{
    if(chatBoxRef.current){
        chatBoxRef.current.scroll({
            top:chatBoxRef.current.scrollHeight,
            behaviour:'smooth',
        });
    }
},[messages]);

//stomClient ko init karne hone

//subscribe
useEffect(()=>{
    const connectWebSocket=()=>{
      ///SockJS
      const sock=new SockJS(`${baseURL}/chat`);
      const client=Stomp.over(sock);
      client.connect({},()=>{

        setStompClient(client);

        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`,(message)=> {
            console.log(message);

            const newMessage=JSON.parse(message.body);

            setMessages((prev)=>[...prev,newMessage]);
            //rest of the work after success receiving the message
        });





      });
      return client; // Return the client for cleanup
    };
   const client= connectWebSocket();
    //stomp client
    return ()=>{
        if (client) {
            client.disconnect();
            console.log("Disconnected WebSocket");
          }
         
    };


},[roomId]);



//send message handle
const sendMessage=async ()=>{
    if(stompClient && connected && input.trim() ){
        console.log(input);
        const message={
            sender:currentUser,
            content:input,
            roomId:roomId
        }
        stompClient.send(`/app/sendMessage/${roomId}`,
            {},
            JSON.stringify(message));
            setInput("")

    }
};
//handle log out
function handleLogout(){
    stompClient.disconnect();
    setConnected(false);
    setRoomId("")
    setCurrentUser("");
    navigate("/")
}


  return (
    <div className=''>
        {/*this is header portion*/}
        <header className='dark:border-gray-700 fixed w-full h-20 dark:bg-gray-700 shadow py-5  border flex justify-around items-center'>

            {/*room name container */}
            <div>
                <h1 className="text-xl font-semibold">Room:<span>{roomId}</span></h1>

            </div>
             {/*username container */}
            <div>
            <h1 className="text-xl font-semibold">User:<span>{currentUser}</span></h1>

            </div>
             {/* button:leave room */}
            <div>
                <button onClick={handleLogout} className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full">Leave Room</button>

            </div>
        </header>
        {/* middle section*/}
        <main  ref={chatBoxRef}className='py-20 px-10 w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto'>
            { messages.map((message,index) =>(
          <div key={index} className={`flex ${message.sender === currentUser ? "justify-end":"justify-start"}`}>
                  <div  className={`my-2 ${message.sender === currentUser ? "bg-green-600":"bg-sky-600"} max-w-xs p-2 rounded`}>
                   <div className='flex flex-row gap-2'>
                   <img className="h-10 w-10"src={"https://avatar.iran.liara.run/public"} />
                        <div className=' flex flex-col gap-1'>
                            <p className='text-sm font-bold'>{message.sender}</p>
                            <p>{message.content}</p>
                            <p className='text-xs text-white-1'>{timeAgo(message.timeStamp)}</p>

                        </div>

                    </div>
                   </div>
          </div>
                )
            )
            }
            </main>
        {/*this ismessage input* portion */}
        <div className='fixed bottom-4 w-full h-16'>
            <div className='h-full pr-10 gap-4 flex justify-between items-center w-2/3 mx-auto  dark:bg-gray-900 rounded-full'>
                  <input type='text' placeholder='Type your message here'
                  value={input}
                
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage(); // Send message on Enter
                        e.preventDefault(); // Prevent default Enter behavior
                    }
                }}   

                  
                 // Update input state
                   className=' dark:border-gray-600 w-full dark:bg-gray-800 rounded-full px-5 py-2  h-full focus:outline-none'></input>
                 <div className='flex gap-1
                 '>
                 <button className=' dark:bg-blue-600 h-10 w-10 flex  justify-center items-center rounded-full'>
                    <MdAttachFile size={20}/>
                  </button>
                 <button onClick={sendMessage} className=' dark:bg-green-600 h-10 w-10 flex  justify-center items-center rounded-full'>
                    <MdSend size={20}/>
                  </button>
                 </div>
            </div>

        </div>
      
    </div>
  )
}

export default ChatPage