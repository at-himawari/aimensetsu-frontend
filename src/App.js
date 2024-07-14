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
  const [threadId, setThreadId] = useState(null); // スレッドIDの管理
  // 送信ボタンの有効無効
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  // スレッド一覧
  const [threads, setThreads] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // サイドバーの表示状態

  // 下までスクロール
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 初期レンダリング時にスレッドIDを取得して、チャットを表示する
  useEffect(() => {
    fetch("http://localhost:8000/api/new-thread/", { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        setThreadId(data.thread_id);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  useEffect(() => {
    // チャット履歴の取得
    if (!threadId) return;
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

  // 送信ボタンを押したら、メッセージボックスを空にする
  const clearInput = () => {
    setSearchWord("");
  };

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (textareaRef.current) {
      const handleTextareaInput = () => {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      };

      textareaRef.current.addEventListener("input", handleTextareaInput);

      return () => {
        if (textareaRef.current) {
          textareaRef.current.removeEventListener("input", handleTextareaInput);
        }
      };
    }
  }, []);

  const getThreadSummary = async (threadId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/thread-summary/${threadId}/`
      );
      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error("Error fetching thread summary:", error);
    }
  };

  const getAllThreads = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/all-threads/");
      const data = await response.json();
      return data.threads;
    } catch (error) {
      console.error("Error fetching all threads:", error);
    }
  };

  // 使用例
  useEffect(() => {
    const fetchAllThreads = async () => {
      const threads = await getAllThreads();
      setThreads(threads);
      console.log(threads);
    };

    fetchAllThreads();
  }, []);

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
    // Shift + Enterで改行
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }
    // Enterで送信
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSubmit();
    }
  };

  const handleSubmit = async (e) => {
    clearInput();
    if (searchWord.trim() === "") return; // 空のメッセージを送信しない
    // チャット履歴がない場合、要約を取得
    if (chatHistory.length === 0) {
      const summary = await getThreadSummary(threadId);
      // threadsの一番上に追加
      setThreads([summary, ...threads]);
      console.log(summary);
    }
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

  // textareaの高さを自動調整
  useEffect(() => {
    const textarea = textareaRef.current;
    const handleTextareaInput = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener("input", handleTextareaInput);

    return () => {
      textarea.removeEventListener("input", handleTextareaInput);
    };
  }, []);

  const handleThreadClick = (threadId) => {
    setThreadId(threadId);
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="App">
      <div className="chat-container flex">
        <div className="flex">
        <div className="App">
      {/* サイドバートグルボタン */}
      <div className="p-4 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 text-white bg-blue-600 rounded"
        >
          Toggle Sidebar
        </button>
      </div>

      {/* サイドバー */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:w-64 md:h-auto md:bg-transparent z-50`}
      >
        <div className="p-4 bg-white md:bg-transparent">
          <button
            onClick={closeSidebar}
            className="p-2 text-white bg-red-600 rounded md:hidden"
          >
            Close Sidebar
          </button>
          <h2 className="text-2xl font-bold">Menu</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <a href="#" className="block p-2 text-gray-700 bg-gray-200 rounded">
                Dashboard
              </a>
            </li>
                  {threads.map((thread) => (
                    <li key={thread.thread_id}>
                      <button
                        onClick={() => handleThreadClick(thread.thread_id)}
                        className="block py-100 text-gray-700 bg-gray-200 rounded"
                      >
                        {thread.summary}
                      </button>
                    </li>
                  ))}
          </ul>
        </div>
      </div>

      {/* オーバーレイ */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden"
        ></div>
      )}
    </div>
          

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
            ref={textareaRef}
            style={{ overflow: "hidden" }}
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
