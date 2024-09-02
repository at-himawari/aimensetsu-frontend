import React from "react";
if (window.location.pathname === "/error_modal") {
    setTimeout(() => {
      window.location.href = "/";
    }, 3 * 1000);
  }

const Modal = ({ open, onCancel, onOk,message }) => {
  return open ? (
    <>
      <div className="bg-white  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-48 p-5 flex flex-col items-start absolute z-20">
        <h1 className="text-xl font-bold mb-5">エラー</h1>
        <p className="text-lg mb-5">{message}</p>
        <div className="flex mt-auto w-full">
          <button
            className="bg-slate-900 hover:bg-slate-700 text-white px-8 py-2 mx-auto"
            onClick={onOk}
          >
            確認
          </button>
        </div>
      </div>
      <div
        className="fixed bg-black bg-opacity-50 w-full h-full z-10"
        onClick={onCancel}
      ></div>
    </>
  ) : (
    <>3秒後にログインページに戻ります</>
  );
};
export default Modal;
