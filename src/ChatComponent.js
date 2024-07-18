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
import HeaderWide from "./img/header-wide.png"; // 画像のパスを指定

function ChatComponent({ authTokens, user, setIsError }) {
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
  // 新規スレッド作成済み
  const [isNewThreadCreated, setIsNewThreadCreated] = useState(false);
  // textareaのフォーカス状態
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  // AIチャットローディング状態
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 下までスクロール
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!threadId) return;
      try {
        const response = await axios.get(
          `http://localhost:8000/api/chat-history/?thread_id=${threadId}`,
          {
            headers: {
              Authorization: `Bearer ${authTokens.access}`,
            },
          }
        );
        setChatHistory(response.data || []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setIsError({
          open: true,
          message: "チャット履歴の取得に失敗しました。",
        });
      }
    };
    fetchChatHistory();
  }, [threadId, authTokens]);

  useEffect(() => {
    // チャット履歴の取得
    if (!threadId) {
      setIsTextareaDisabled(true);
      setIsNewThreadCreated(false);
      return;
    }
    setIsTextareaDisabled(false);
    setIsNewThreadCreated(true);
    fetch(`http://localhost:8000/api/chat-history/?thread_id=${threadId}`, {
      headers: {
        Authorization: `Bearer ${authTokens.access}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setChatHistory(data))
      .catch((error) => {
        console.error("Error:", error);
        setIsError({
          open: true,
          message: "チャット履歴の取得に失敗しました。",
        });
      });

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
      const response = await fetch("http://localhost:8000/api/all-threads/", {
        headers: {
          Authorization: `Bearer ${authTokens.access}`,
        },
      });
      const data = await response.json();
      return data.threads;
    } catch (error) {
      console.error("Error fetching all threads:", error);
      setIsError({ open: true, message: "スレッドの取得に失敗しました。" });
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
        "http://localhost:8000/api/new-thread/",
        {},
        {
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
          },
        }
      );
      const newThreadId = response.data.thread_id;
      setThreadId(newThreadId); // 新しいスレッドIDを設定
      setChatHistory([]); // チャット履歴をクリア

      // スレッド履歴を取得して、スレッドを更新
      const threads = await getAllThreads();
      setThreads(threads);
      setIsNewThreadCreated(true);
      setIsTextareaFocused(true);
      closeSidebar();
    } catch (error) {
      console.error("Error creating new thread:", error);
      setIsError({
        open: true,
        message: "新しいスレッドの作成に失敗しました。",
      });
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
    setIsChatLoading(true);
    clearInput();
    if (searchWord.trim() === "") return; // 空のメッセージを送信しない
    // チャット履歴がない場合、要約タイトルを取得

    try {
      const response = await fetch("http://localhost:8000/api/openai/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authTokens.access}`,
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

      console.log(threadId);
      setIsChatLoading(false);

      setChatHistory([
        ...chatHistory,
        { user_input: searchWord, ai_response: data?.response || "･･･" },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsError({ open: true, message: "メッセージの送信に失敗しました。" });
    }
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
    // サイドバーを閉じる
    closeSidebar();
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  // 無題のチャットの場合、無題のチャットと表示
  const getThreadSummary = (thread) => {
    if (thread.summary === "") {
      return "無題の面接";
    } else {
      return thread.summary;
    }
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
      <header className="w-full">
        <img src={HeaderWide} alt="header w-full md:h-auto sm:h-[80px]" />
      </header>

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
                      + 新しい面接官と話す
                    </button>
                  </li>
                  <p className="border-b-2"></p>
                  <p className="text-gray-700 font-bold text-xl">面接履歴</p>
                  {Array.isArray(threads) &&
                    threads
                      .slice()
                      .reverse()
                      .map((thread) => (
                        <li key={thread.thread_id}>
                          {formatDate(thread.created_at)}

                          <button
                            onClick={() => handleThreadClick(thread.thread_id)}
                            className="block truncate text-sm hover:bg-gray-400 hover:scale-105 overflow-hidden whitespace-nowrap max-w-xs py-100 w-full h-[64px] text-gray-700 bg-gray-200 rounded"
                          >
                            {getThreadSummary(thread)}
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

          <div className="messages-container ">
            {/**カード表示 */}
            {!isNewThreadCreated && isTextareaDisabled && (
              <div className=" flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                  <div
                    onClick={handleCreateNewThread}
                    autoFocus={isTextareaFocused}
                    className="w-50 h-50 bg-white rounded-lg shadow-lg p-4"
                  >
                    <h2 className="text-xl font-bold">新しい面接官と話す</h2>
                    <p>本番前の準備をしましょう！</p>
                  </div>
                </div>
              </div>
            )}
            {!isTextareaDisabled && (
              <div>
                <div className="flex items-start">
                  {/** AIのイラスト */}
                  <AiIcon />

                  <p className="flex-1">
                    こんにちは。本日は面接におこしいただきありがとうございます。まずは、自己紹介から始めましょう!
                  </p>
                </div>
              </div>
            )}

            {Array.isArray(chatHistory) &&
              chatHistory.map((chat, index) => (
                <div key={index}>
                  <div className="flex justify-end my-5">
                    <div className="justify-end flex rounded-3xl bg-[#f4f4f4] px-5 py-5 max-w-[70%]">
                      {chat.user_input}
                    </div>
                  </div>
                  <div className="flex items-start">
                    {/** AIのイラスト */}
                    <AiIcon />

                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{
                        __html: marked(
                          chat?.ai_response || "...",
                          markedOptions
                        ),
                      }}
                    ></div>
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
                ? "｢新しい面接官と話す｣をクリックしてください"
                : "メッセージを入力してください"
            }
            rows={1}
            ref={textareaRef}
            style={{ overflow: "hidden" }}
            disabled={isTextareaDisabled}
          />
          <button
            disabled={isSendButtonDisabled}
            onClick={handleSubmit}
            type="submit"
          >
            {/**送信ボタン画像 */}
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatComponent;
