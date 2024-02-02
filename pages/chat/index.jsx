"use client"
import React, { useEffect, useState } from 'react'
import supabase from "../utils/client"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // import utc plugin
import relativeTime from 'dayjs/plugin/relativeTime';


function Chat() {
  const [messages, setMessages] = useState([{ "id": 1, "text": "Welcome Here!" }]);
  const [text, setText] = useState("")
  const [userName, setUserName] = useState(`user${Math.floor(Math.random() * 100000)}`)
  // extend dayjs with the plugins
  dayjs.extend(utc);
  dayjs.extend(relativeTime);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataMsg = text;
      const { error } = await supabase.from("messages").insert([
        {
          text: dataMsg,
          username: userName,
        },
      ]);
      if (error) {
        console.error(error.message);
        return;
      }
      console.log("Successfully sent!");
    } catch (error) {
      console.log("error sending message:", error);
    } finally {
      setText('')
    }

  };

  const fetchMsg = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .range(0, 49)
      .order("id", { ascending: true });


    setMessages([...data])

    console.log(data, error)

    supabase.channel('schema-db-changes').on(
      'postgres_changes',
      {
        event: 'INSERT', // Listen only to INSERTs
        schema: 'public',
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new])
        console.log("data", payload)
      }
    ).subscribe()
  }



  useEffect(() => {
    if (localStorage.getItem('userName'))
      setUserName(localStorage.getItem('userName'));
    fetchMsg()
    console.log(messages)
  }, [])

  const handleUserNameChange = async (e) => {
    setUserName(e.target.value);
    localStorage.setItem('userName', e.target.value);
  }

  return (
    <div className='p-2 w-screen flex justify-start items-center h-screen flex-col space-y-4'>
      <div className='text-4xl font-bold mt-12'>CHAT APP</div>
      <div className='w-full'>
        <label htmlFor="username">Username</label>
        <input type='text' id='username' name='userName' value={userName} className='ring-1' onChange={handleUserNameChange} />
      </div>
      <div className='text-2xl font-semibold mt-12'>All Messages</div>
      <div className='w-full h-96 p-2 rounded border-2 border-slate-900 overflow-y-scroll'>
        {messages.length != 0 ? messages.map((message, index) => (<>
          <ul key={index} className='w-60 m-2 p-1 flex bg-green-600 rounded border-2 border-slate-900 flex-col'>
            <li>User:{message.username || "anonymous"}</li>
            <li>{message.text}</li>
            <li>{dayjs.utc(message.timestamp).fromNow()}</li>
          </ul>
        </>
        )) : (
          <>
            <div className='w-full h-full flex justify-center items-center'>
              <h1>Welcome To Chat App!</h1>
            </div>
          </>
        )}
      </div>
      <input type='text' className='ring-1' value={text} onChange={(e) => setText(e.target.value)} />
      <div className='flex space-x-3'>
        {/* <button type='button' className='bg-red-600 px-2 py-1 rounded-md text-white' onClick={Subscribe}>Subscribe</button> */}
        <button type='button' className='bg-green-600 px-2 py-1 rounded-md text-white' onClick={handleSubmit}>Send</button>
      </div>

    </div>
  )
}

export default Chat