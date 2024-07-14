import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRef } from "react";
import "./App.css";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/a11y-dark.css"; // シンタックスハイライトのレイアウト
// align-left-svgrepo-com.svgの読み込み
import { ReactComponent as AlignLeftIcon } from "./img/align-left-svgrepo-com.svg";
// AIのイラスト
import { ReactComponent as AiIcon } from "./img/ai-icon.svg";
// 送信ボタンイラスト
import { ReactComponent as SendIcon } from "./img/send-icon.svg";

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
  // textareaの有効･無効
  const [isTextareaDisabled, setIsTextareaDisabled] = useState(false);

  // 下までスクロール
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // チャット履歴の取得
    if (!threadId) {
      setIsTextareaDisabled(true);
      return;
    }
    setIsTextareaDisabled(false);
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

      // スレッド履歴を取得して、スレッドを更新
      const threads = await getAllThreads();
      setThreads(threads);
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
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearInput();
    if (searchWord.trim() === "") return; // 空のメッセージを送信しない
    // チャット履歴がない場合、要約タイトルを取得

    const response = await fetch("http://localhost:8000/api/openai/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search_word: searchWord, thread_id: threadId }),
    });
    const data = await response.json();
    if (chatHistory.length === 0) {
      // スレッド履歴を取得して、スレッドを更新
      const allThreads = await getAllThreads();
      setThreads(allThreads);
      console.log(threads);
    }

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

  //日付をYYYY/MM/DD HH:MM:SS形式に変換
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    const hour = ("0" + d.getHours()).slice(-2);
    const minute = ("0" + d.getMinutes()).slice(-2);
    const second = ("0" + d.getSeconds()).slice(-2);
    // もし、年･月･日･時･分･秒のうちいずれかがNanの場合、空文字を返す
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hour) ||
      isNaN(minute) ||
      isNaN(second)
    ) {
      return "";
    }

    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
  };

  return (
    <div className="App">
      <div className="chat-container flex -z-1">
        <div className="flex">
          <div className="App">
            {/* サイドバートグルボタン */}
            <div className="p-4 md:hidden">
              <button
                onClick={toggleSidebar}
                className="p-2 text-white bg-blue-600 rounded"
              >
                <AlignLeftIcon width={"20px"} height={"20px"} />
              </button>
            </div>

            {/* サイドバー */}
            <div
              className={`z-10 fixed top-0 left-0 w-64 h-full bg-white transition-transform transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0 md:relative md:w-64 md:h-auto md:bg-transparent z-50`}
            >
              <div className="p-4 bg-white md:bg-transparent overflow-y-auto h-screen">
                <button
                  onClick={closeSidebar}
                  className="p-2 text-white bg-red-600 rounded md:hidden"
                >
                  閉じる
                </button>
                <h2 className="text-2xl font-bold text-gray-700">Menu</h2>
                <ul className="mt-4 space-y-2">
                  <li>
                    <button
                      onClick={handleCreateNewThread}
                      className="block hover:bg-gray-400 hover:scale-105 mb-4 p-2 w-full text-gray-700 bg-gray-200 rounded"
                    >
                      + 新しいチャットを作成
                    </button>
                  </li>
                  <p className="border-b-2"></p>
                  {threads
                    .slice()
                    .reverse()
                    .map((thread) => (
                      <li key={thread.thread_id}>
                        {formatDate(thread.created_at)}

                        <button
                          onClick={() => handleThreadClick(thread.thread_id)}
                          className="block truncate text-sm hover:bg-gray-400 hover:scale-105 overflow-hidden whitespace-nowrap max-w-xs py-100 w-full h-[64px] text-gray-700 bg-gray-200 rounded"
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
                  {/** AIのイラスト */}
                  <AiIcon />

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
        <form className="search-bar fixed left-0 w-full bg-white z-50">
          <textarea
            id="search-bar-input"
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            placeholder={
              isTextareaDisabled
                ? "新しいチャットを作成または既存のチャットを選択してください"
                : "AIに質問してみよう！"
            }
            rows={1}
            ref={textareaRef}
            style={{ overflow: "hidden" }}
            disabled={isTextareaDisabled}
          />
          <button disabled={isSendButtonDisabled} type="submit">
            {/**送信ボタン画像 */}
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
