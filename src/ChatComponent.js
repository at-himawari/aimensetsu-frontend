import React, { useState, useEffect } from "react";
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
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
// ゴミ箱アイコン
import Trash from "./img/trash.svg";
import api from "./api"; // 新しいaxiosインスタンスをインポート
import logout from "./img/logout.svg";
import "./LoadingButton.css"; // スピナー用のCSS

function ChatComponent({ authTokens, setIsError }) {
  const [searchWord, setSearchWord] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [threadId, setThreadId] = useState(null); // スレッドIDの管理
  // 送信ボタンの有効無効
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const initialMessageRef = useRef(null);
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
  const [, setIsChatLoading] = useState(false);
  // Cookieの読み込み
  const [, setCookie] = useCookies();
  // 初メッセージ
  const [initialMessage, setInitialMessage] = useState("");
  // 新しいスレッドボタンの有効無効
  const [isNewThreadButtonDisabled, setIsNewThreadButtonDisabled] =
    useState(false);
  const navigate = useNavigate();

  // 初期メッセージの取得

  // 下までスクロール
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 初期メッセージまでスクロール
  const scrollToInitialMessage = () => {
    if (initialMessageRef.current) {
      initialMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!threadId) return;
      try {
        const response = await api.get(
          `${process.env.REACT_APP_BASE_URL}/api/chat-history/?thread_id=${threadId}`
        );
        setChatHistory(response.data || []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setIsError({
          open: true,
          message: "チャット履歴の取得に失敗しました。",
        });
        navigate("/error_modal");
      }
    };
    fetchChatHistory();
  }, [threadId, authTokens]);

  useEffect(() => {
    setCookie("authTokens", authTokens, { path: "/" });
  }, [authTokens]);

  useEffect(() => {
    // チャット履歴の取得
    if (!threadId) {
      setIsTextareaDisabled(true);
      setIsNewThreadCreated(false);
      return;
    }
    setIsTextareaDisabled(false);
    setIsNewThreadCreated(true);
    try {
      const fetch = async () => {
        const response = await api.get(
          `${process.env.REACT_APP_BASE_URL}/api/chat-history/?thread_id=${threadId}`
        );
        const data = response.data;
        setChatHistory(data);
      };
      fetch();
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setIsError({
        open: true,
        message: "チャット履歴の取得に失敗しました。",
      });
      navigate("/error_modal");
    }

    try {
      const fetch = async () => {
        const response = await api.post(
          `${process.env.REACT_APP_BASE_URL}/api/first-message/${threadId}/`
        );
        const data = response.data;
        setInitialMessage(data.response);
      };
      fetch();
    } catch (error) {
      console.error("Error fetching first message:", error);
      setIsError({
        open: true,
        message: "初期メッセージの取得に失敗しました。",
      });
      navigate("/error_modal");
    }
  }, [threadId]);

  // 文字が追加されたら下までスクロール
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    scrollToInitialMessage();
  }, [initialMessage]);

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
    const textarea = textareaRef.current;
    if (textarea !== null) {
      const handleTextareaInput = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      textarea.addEventListener("input", handleTextareaInput);

      return () => {
        if (textarea) {
          textarea.removeEventListener("input", handleTextareaInput);
        }
      };
    }
  }, []);

  const getAllThreads = async () => {
    try {
      const response = await api.get(
        `${process.env.REACT_APP_BASE_URL}/api/all-threads/`
      );
      const data = await response.data;
      return data.threads;
    } catch (error) {
      console.error("Error fetching all threads:", error);
      setIsError({ open: true, message: "スレッドの取得に失敗しました。" });
      navigate("/error_modal");
    }
  };

  useEffect(() => {
    const fetchAllThreads = async () => {
      const threads = await getAllThreads();
      setThreads(threads);
    };

    fetchAllThreads();
  }, []);

  const handleCreateNewThread = async () => {
    try {
      if (isNewThreadButtonDisabled) {
        return;
      }
      setIsNewThreadButtonDisabled(true);
      const response = await api.post(
        `${process.env.REACT_APP_BASE_URL}/api/new-thread/`
      );
      const newThreadId = response.data.thread_id;
      setInitialMessage(response.data.response);
      setThreadId(newThreadId); // 新しいスレッドIDを設定
      setChatHistory([]); // チャット履歴をクリア

      // スレッド履歴を取得して、スレッドを更新
      const threads = await getAllThreads();
      setThreads(threads);
      setIsNewThreadCreated(true);
      setIsTextareaFocused(true);
      closeSidebar();
      setIsNewThreadButtonDisabled(false);
    } catch (error) {
      console.error("Error creating new thread:", error);
      setIsError({
        open: true,
        message: "新しいスレッドの作成に失敗しました。",
      });
      navigate("/error_modal");
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

    // 一時的なメッセージを表示
    setChatHistory([...chatHistory, { sender: "USER", message: searchWord }]);

    // チャット履歴がない場合、要約タイトルを取得
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/openai/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokens}`,
          },
          body: JSON.stringify({
            search_word: searchWord,
            thread_id: threadId,
          }),
        }
      );
      const data = await response.json();
      if (chatHistory.length === 0) {
        // スレッド履歴を取得して、スレッドを更新
        const allThreads = await getAllThreads();
        setThreads(allThreads);
      }

      setIsChatLoading(false);

      // 全体のメッセージを表示
      // USERを消すと、AIメッセージで上書きされてしまう。
      setChatHistory([
        ...chatHistory,
        { sender: "USER", message: searchWord },
        { sender: "AI", message: data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsError({ open: true, message: "メッセージの送信に失敗しました。" });
      navigate("/error_modal");
    }
  };

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

  const handleDelete = async (threadId) => {
    try {
      // 対象ボタンを無効化
      document.getElementById("delete-button-" + threadId).disabled = true;
      document.getElementById("thread-" + threadId).disabled = true;
      // 対象ボタンをグレーアウト
      const grayFilter =
        "invert(50%) sepia(0%) saturate(11%) hue-rotate(143deg) brightness(101%) contrast(93%)";
      // document.getElementById("delete-img-" + threadId).style.filter =
      //   grayFilter;
      document.getElementById("delete-img-" + threadId).innerHTML = `
  <div class="mr-2 sk-chase-20">
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
  </div>
`;
      document.getElementById("thread-" + threadId).style.filter = grayFilter;

      await api.delete(
        `${process.env.REACT_APP_BASE_URL}/api/delete-thread/${threadId}/`
      );
      const allThreads = await getAllThreads();

      setChatHistory([]);
      setThreads(allThreads);
    } catch (error) {
      console.error("Error deleting thread:", error);
      setIsError({ open: true, message: "スレッドの削除に失敗しました。" });
      navigate("/error_modal");
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

  const handleLogout = async () => {
    try {
      // ログアウトする
      const idToken = (await fetchAuthSession()).tokens.idToken;
      if (idToken) {
        await signOut();
      }
    } catch (e) {
      console.error(e);
      console.error("ログアウトに失敗しました");
    }

    setCookie("authTokens", null, "/");
    navigate("/");
  };

  return (
    <div className="App">
      <header className="w-full">
        <img src={HeaderWide} alt="header w-full md:h-auto sm:h-[80px]" />
      </header>
      <div className="flex">
        <div className="flex text-xl font-bold ml-auto">
          <img width={20} src={logout} alt="logoutbutton" />
          <button onClick={handleLogout}>ログアウト</button>
        </div>
      </div>

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
              className={`z-10 fixed top-0 left-0 w-64 h-full bg-gray-400 transition-transform transform ${
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
                      disabled={isNewThreadButtonDisabled}
                      className="block hover:bg-gray-400 hover:scale-105 mb-4 p-2 w-full text-gray-700 bg-gray-200 rounded"
                    >
                      {isNewThreadButtonDisabled ? (
                        <div className="mx-auto sk-chase">
                          <div className="sk-chase-dot"></div>
                          <div className="sk-chase-dot"></div>
                          <div className="sk-chase-dot"></div>
                          <div className="sk-chase-dot"></div>
                          <div className="sk-chase-dot"></div>
                          <div className="sk-chase-dot"></div>
                        </div>
                      ) : (
                        "+ 新しい面接官と話す"
                      )}
                    </button>
                  </li>
                  <p className="border-b-2"></p>
                  <p className="text-gray-700 font-bold text-xl">面接履歴</p>
                  {Array.isArray(threads) &&
                    threads.slice().map((thread) => (
                      <li key={"list-" + thread.thread_id}>
                        <div className="flex">
                          {formatDate(thread.created_at)}
                          <button
                            id={"delete-button-" + thread.thread_id}
                            onClick={() => handleDelete(thread.thread_id)}
                          >
                            <span id={"delete-img-" + thread.thread_id}>
                              <img src={Trash} alt="trash" />
                            </span>
                          </button>
                        </div>

                        <button
                          id={"thread-" + thread.thread_id}
                          onClick={() => handleThreadClick(thread.thread_id)}
                          className="block truncate text-sm hover:bg-gray-400 hover:scale-105 overflow-hidden whitespace-nowrap max-w-xs py-100 w-full h-[64px] text-gray-700 bg-gray-200 rounded"
                        >
                          {getThreadSummary(thread)}
                        </button>
                        <button className="hidden hover:display">aaa</button>
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
            {!isNewThreadCreated &&
              isTextareaDisabled &&
              threads?.length === 0 && (
                <div className=" flex justify-center items-center h-screen">
                  <div className="flex flex-col items-center">
                    <div
                      onClick={handleCreateNewThread}
                      className="w-50 h-50 bg-white rounded-lg shadow-lg p-4"
                    >
                      <h2 className="text-xl font-bold">新しい面接官と話す</h2>
                      <p>本番前の準備をしましょう！</p>
                    </div>
                  </div>
                </div>
              )}
            {!isTextareaDisabled && threads.length !== 0 && (
              <div ref={initialMessageRef}>
                <div className="flex items-start">
                  {/** AIのイラスト */}
                  <AiIcon />

                  <p className="flex-1">{initialMessage}</p>
                </div>
              </div>
            )}

            {Array.isArray(chatHistory) &&
              chatHistory.map((chat, index) => (
                <div key={"USER" + index}>
                  {/** ユーザーのメッセージ表示 */}
                  {chat.sender === "USER" && (
                    <div className="flex justify-end my-5">
                      <div className="justify-end flex rounded-3xl bg-[#f4f4f4] px-5 py-5 max-w-[70%]">
                        {chat.message}
                      </div>
                    </div>
                  )}
                  {/** AIの回答表示 */}
                  {chat.sender === "AI" && (
                    <div key={"AI" + index} className="flex items-start">
                      {/** AIのイラスト */}
                      <AiIcon />

                      <div
                        id={chat?.id}
                        className="flex-1 "
                        dangerouslySetInnerHTML={{
                          __html: marked(
                            chat?.message || "エラーが発生しました",
                            markedOptions
                          ),
                        }}
                      ></div>
                    </div>
                  )}
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
            autoFocus={isTextareaFocused}
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
