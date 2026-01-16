/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  logout,
  setOnlineUser,
  setSocketConnection,
  setUser,
} from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import logo from "../assets/logo.png";
import io from "socket.io-client";
import api from "../helpers/api";

const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserDetails = async () => {
    try {
      const response = await api.get('/api/user-details');
      
      if (response.data.data.logout) {
        dispatch(logout());
        navigate("/email");
        return;
      }
      
      dispatch(setUser(response.data.data));
    } catch (error) {
      console.error("Error fetching user details:", error);
      if (error.response?.status === 401) {
        dispatch(logout());
        navigate("/email");
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Socket Connection
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token: token,
      },
    });

    socketConnection.on("onlineUser", (data) => {
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
    };
  }, [dispatch]);

  const basePath = location.pathname === "/";
  
  return (
    <div className="grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
      <section className={`bg-white dark:bg-slate-800 ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div
        className={`justify-center items-center flex-col gap-2 ${
          !basePath ? "hidden" : "lg:flex"
        }`}
      >
        <div>
          <img src={logo} alt="logo" width={250} />
        </div>
        <p className="text-lg mt-2 text-slate-500 dark:text-slate-400">
          Select user to message
        </p>
      </div>
    </div>
  );
};

export default Home;