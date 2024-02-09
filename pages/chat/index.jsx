"use client";
import React, { useEffect, useState, useRef } from "react";
// import supabase from "../../utils/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // import utc plugin
import relativeTime from "dayjs/plugin/relativeTime";
import Message from "../../components/Message";
import LiveCounter from "../../components/LiveCounter";
import Script from "next/script";

import { supabaseBrowser } from '../../utils/supbaseClients/browser';

import ChatHeader from '../../components/ChatHeader';
import ChatConatiner from '../../components/ChatContainer'

function Chat() {
  const supabase = supabaseBrowser();
  const [messages, setMessages] = useState([{ id: 1, text: "Welcome Here!" }]);
  const [user, setUser] = useState();
  const [text, setText] = useState("");
  const [userName, setUserName] = useState();
  const chatbox = useRef(null);

  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    // console.log("user:", data)
    if (data?.session?.user) {
      setUser(data.session.user);
    }
    else {
      setUser(null);
    }
  }
  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (chatbox.current) {
      chatbox.current.scrollTop = chatbox.current.scrollHeight;
    }
  }, [messages]);

  // extend dayjs with the plugins
  dayjs.extend(utc);
  dayjs.extend(relativeTime);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataMsg = text;
      if (!dataMsg || dataMsg === "") return alert("Please enter a message!");
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
      // console.log("Successfully sent!");
      // chatbox.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } catch (error) {
      alert('Error!Message not sent!')
      // console.log("error sending message:", error);
    } finally {
      setText("");
    }
  };

  const fetchMsg = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select()
      // .range(0, 49)
      .order("id", { ascending: true });

    setMessages([...data]);

    // console.log(data, error);

    supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Listen only to INSERTs
          schema: "public",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          // console.log("data", payload);
        }
      )
      .subscribe();
  };

  useEffect(() => {
    if (user) {
      setUserName(user.email.split('@')[0])
      fetchMsg();
      // console.log(messages);
    }
  }, [user]);

  return (
    <div className="p-2 w-screen flex justify-start items-center h-screen flex-col space-y-4">
      <ChatHeader user={user} />
      <div className="text-2xl font-semibold mt-12 flex items-center">
        All Messages :
        <LiveCounter count={messages.length} />
      </div>

      <ChatConatiner user={user}>
        <div className="lg:px-24 w-full space-y-4">
          <div
            className="w-full h-96 p-2 pt-4 rounded-xl ring-1 overflow-y-scroll flex flex-col justify-center items-start"
            ref={chatbox}
          >
            {messages.length != 0 ? (
              messages.map((message, index) => (
                <>
                  <div className="my-2" key={index}>
                    <Message
                      text={message.text}
                      time={dayjs.utc(message.timestamp).fromNow()}
                      username={message.username}
                    />
                  </div>
                </>
              ))
            ) : (
              <>
                <div className="w-full h-full flex justify-center items-center">
                  <h1>Welcome To Chat App!</h1>
                </div>
              </>
            )}
          </div>
          <div className="flex space-x-3 w-full lg:px-32 justify-center">
            <input
              type="text"
              className="ring-1 rounded-2xl  w-full px-3"
              placeholder="Type your message here..."
              value={text}
              onKeyDown={(e) => (e.key === "Enter" ? handleSubmit(e) : null)}
              onChange={(e) => setText(e.target.value)}
            />

            <button type="submit" onClick={handleSubmit}>
              <div class="w-fit rounded-full bg-green-600 p-3 shadow-2xl drop-shadow-xl backdrop-blur-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-send text-white"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </ChatConatiner>

      <div className="text-lg pt-4">
        A random project by{" "}
        <a
          href="https://github.com/rohitranjan-2702"
          target="_blank"
          className="font-medium text-blue-500 hover:underline"
        >
          RoHiT
        </a>{" "}
        n{" "}
        <a
          href="https://github.com/AKSourav"
          target="_blank"
          className="font-medium text-blue-500 hover:underline"
        >
          AKSourav
        </a>
      </div>
    </div>
  );
}

export default Chat;
