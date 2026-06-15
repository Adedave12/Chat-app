import React from "react";
import { IoClose } from "react-redux";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaApple, FaAndroid, FaDesktop } from "react-icons/fa";

const InstallModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700/50 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <IoCloseCircleOutline size={28} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Install Chatlyx</h2>
          <p className="text-zinc-400 text-center mb-6">
            Install our app to your home screen for the best experience!
          </p>

          <div className="space-y-4">
            {/* iOS */}
            <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl flex gap-4 items-start">
              <FaApple size={24} className="text-white mt-1 shrink-0" />
              <div>
                <h3 className="text-white font-semibold">iOS (Safari)</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  1. Tap the <strong>Share</strong> button at the bottom.<br />
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            {/* Android */}
            <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl flex gap-4 items-start">
              <FaAndroid size={24} className="text-[#3DDC84] mt-1 shrink-0" />
              <div>
                <h3 className="text-white font-semibold">Android (Chrome)</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  1. Tap the <strong>3-dot menu</strong> in the top right.<br />
                  2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                </p>
              </div>
            </div>

            {/* Desktop */}
            <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl flex gap-4 items-start">
              <FaDesktop size={24} className="text-indigo-400 mt-1 shrink-0" />
              <div>
                <h3 className="text-white font-semibold">Desktop</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Click the <strong>Install</strong> icon on the right side of the URL address bar at the top of your browser.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-white hover:bg-zinc-200 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;
