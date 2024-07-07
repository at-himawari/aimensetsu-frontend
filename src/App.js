import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRef } from "react";
import "./App.css";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/a11y-dark.css"; // シンタックスハイライトのレイアウト

function App() {
  const [searchWord, setSearchWord] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [threadId, setThreadId] = useState("default_thread"); // スレッドIDの管理
  // 送信ボタンの有効無効
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);
  const bottomRef = useRef(null);

  // 下までスクロール
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // チャット履歴の取得
    fetch(`http://localhost:8000/api/chat-history/?thread_id=${threadId}`)
      .then((response) => response.json())
      .then((data) => setChatHistory(data))
      .catch((error) => console.error("Error:", error));

    console.log("threadId:", threadId);
  }, [threadId]);

  // 文字が追加されたら下までスクロール
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // メッセージが0件の場合、送信ボタンを無効にする
  useEffect(() => {
    setIsSendButtonDisabled(searchWord === "");
  }, [searchWord]);

  // 最初に\nが入力されたら削除する
  useEffect(() => {
    if (searchWord === "\n") {
      setSearchWord("");
    }
  }, [searchWord]);

  // ハイライトの適用
  useEffect(() => {
    chatHistory.forEach((chat) => {
      if (chat.ai_response) {
        document.querySelectorAll("pre code").forEach((block) => {
          hljs.highlightBlock(block);
        });
      }
    });
  }, [chatHistory]);

  // 送信ボタンを押したら、メッセージボックスを空にする
  const clearInput = () => {
    setSearchWord("");
  };

  const handleCreateNewThread = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/new-thread/"
      );
      const newThreadId = response.data.thread_id;
      setThreadId(newThreadId); // 新しいスレッドIDを設定
      setChatHistory([]); // チャット履歴をクリア
    } catch (error) {
      console.error("Error creating new thread:", error);
    }
  };

  const markedOptions = {
    highlight: (code, lang) => {
      return (
        '<code class="hljs">' +
        hljs.highlightAuto(code, [lang]).value +
        "</code>"
      );
    },
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSubmit();
    }
  };

  const handleSubmit = async (e) => {
    clearInput();
    const response = await fetch("http://localhost:8000/api/openai/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search_word: searchWord, thread_id: threadId }),
    });
    const data = await response.json();

    setChatHistory([
      ...chatHistory,
      { user_input: searchWord, ai_response: data.response },
    ]);
  };

  return (
    <div className="App">
      <div className="chat-container flex">
        <h1 className="flex-col">Co-Programmer</h1>
        <div className="flex">
          <aside className="bg-red-500 h-100 ">
            <div className="sticky top-0">
              <button onClick={handleCreateNewThread}>
                新しいチャットを開始
              </button>
              <p>aaaa</p>
              <p>bbbb</p>
              <p>cccc</p>
            </div>
          </aside>

          <div className="messages-container">
            {chatHistory.map((chat, index) => (
              <div key={index}>
                <div className="flex justify-end my-5">
                  <div className="justify-end flex rounded-3xl bg-[#f4f4f4] px-5 py-5 max-w-[70%]">
                    {chat.user_input}
                  </div>
                </div>
                <div className="flex items-start">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="50"
                      y="70"
                      width="100"
                      height="80"
                      rx="15"
                      fill="#4CAF50"
                      stroke="#2E7D32"
                      strokeWidth="3"
                    />
                    <rect
                      x="70"
                      y="30"
                      width="60"
                      height="40"
                      rx="10"
                      fill="#4CAF50"
                      stroke="#2E7D32"
                      strokeWidth="3"
                    />
                    <circle cx="85" cy="50" r="5" fill="#FFFFFF" />
                    <circle cx="115" cy="50" r="5" fill="#FFFFFF" />
                    <rect
                      x="90"
                      y="60"
                      width="20"
                      height="5"
                      rx="2"
                      fill="#FFFFFF"
                    />
                    <rect
                      x="30"
                      y="80"
                      width="20"
                      height="40"
                      rx="10"
                      fill="#4CAF50"
                      stroke="#2E7D32"
                      strokeWidth="3"
                    />
                    <rect
                      x="150"
                      y="80"
                      width="20"
                      height="40"
                      rx="10"
                      fill="#4CAF50"
                      stroke="#2E7D32"
                      strokeWidth="3"
                    />
                    <rect
                      x="70"
                      y="150"
                      width="20"
                      height="40"
                      rx="10"
                      fill="#4CAF50"
                      stroke="#2E7D32"
                      strokeWidth="3"
                    />
                    <rect
                      x="110"
                      y="150"
                      width="20"
                      height="40"
                      rx="10"
                      fill="#4CAF50"
                      stroke="#2E7D32"
                      strokeWidth="3"
                    />
                  </svg>
                  <p
                    className="flex-1"
                    dangerouslySetInnerHTML={{
                      __html: marked(chat.ai_response, markedOptions),
                    }}
                  ></p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <span ref={bottomRef} />
        <form className="search-bar">
          <textarea
            id="search-bar-input"
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            placeholder="AIに質問する"
            rows={1}
          />
          <button disabled={isSendButtonDisabled} type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              className="bi bi-arrow-up-circle-fill"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
