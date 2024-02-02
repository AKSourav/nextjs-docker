"use client";
import React, { useEffect, useState } from "react";
import supabase from "../../utils/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // import utc plugin
import relativeTime from "dayjs/plugin/relativeTime";
import Message from "../../components/Message";
import LiveCounter from "../../components/LiveCounter";

function Chat() {
  const [messages, setMessages] = useState([{ id: 1, text: "Welcome Here!" }]);
  const [text, setText] = useState("");
  const [userName, setUserName] = useState(
    `user${Math.floor(Math.random() * 100000)}`
  );
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
      setText("");
    }
  };

  const fetchMsg = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .range(0, 49)
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
      <div className="text-4xl font-bold mt-8">CHAT APP</div>
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
      <div className="px-24 w-full space-y-4">
        <div className="w-full h-96 p-2 pt-4 rounded-xl ring-1 overflow-y-scroll flex flex-col justify-center items-start">
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
        <div className="flex space-x-3 w-full px-32">
          <input
            type="text"
            className="ring-1 rounded-2xl w-full px-3"
            placeholder="Type your message here..."
            value={text}
            // onKeyDown={handleSubmit}
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
