"use client";
import React, { useEffect, useState, useRef } from "react";
import supabase from "../../utils/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // import utc plugin
import relativeTime from "dayjs/plugin/relativeTime";
import Message from "../../components/Message";
import LiveCounter from "../../components/LiveCounter";
import Script from "next/script";

function Chat() {
  const [messages, setMessages] = useState([{ id: 1, text: "Welcome Here!" }]);
  const [text, setText] = useState("");
  const [userName, setUserName] = useState(
    `user${Math.floor(Math.random() * 100000)}`
  );
  const chatbox = useRef(null);

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
      // chatbox.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } catch (error) {
      console.log("error sending message:", error);
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

    console.log(data, error);

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
          console.log("data", payload);
        }
      )
      .subscribe();
  };

  useEffect(() => {
    if (localStorage.getItem("userName"))
      setUserName(localStorage.getItem("userName"));
    fetchMsg();
    console.log(messages);
  }, []);

  const handleUserNameChange = async (e) => {
    setUserName(e.target.value);
    localStorage.setItem("userName", e.target.value);
  };

  return (
    <div className="p-2 w-screen flex justify-start items-center h-screen flex-col space-y-4">
      <div className="text-4xl font-bold mt-8 flex items-center space-x-4">
        CHAT APP
        <button
          type="button"
          onClick={() =>
            window.open("https://github.com/AKSourav/nextjs-docker")
          }
          class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-2 me-2 mx-2 :bg-gray-800 :text-white :border-gray-600 :hover:bg-gray-700 :hover:border-gray-600 :focus:ring-gray-700 flex items-center space-x-2"
        >
          Github
        </button>
      </div>
      <div className="w-full text-center space-x-2">
        <label htmlFor="username" className="font-semibold">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="userName"
          value={userName}
          className="ring-1"
          onChange={handleUserNameChange}
        />
      </div>
      <div className="text-2xl font-semibold mt-12 flex items-center">
        All Messages :
        <LiveCounter count={messages.length} />
      </div>
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
    </div>
  );
}

export default Chat;
