import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { setToken } from "./redux/userSlice";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });

    // Check for existing token
    const token = sessionStorage.getItem("token");
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastStyle={{
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          }}
        />
        <Outlet />
      </div>
    </ThemeProvider>
  );
};

export default App;