import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import VerifyOTPPage from "../pages/VerifyOTPPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import Home from "../pages/Home";
import MessagePage from "../components/MessagePage";
import AuthLayouts from "../layout";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Protected routes
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: ":userId",
        element: (
          <ProtectedRoute>
            <MessagePage />
          </ProtectedRoute>
        ),
      },
      
      // Public Auth routes
      {
        path: "register",
        element: (
          <AuthLayouts>
            <RegisterPage />
          </AuthLayouts>
        ),
      },
      {
        path: "login",
        element: (
          <AuthLayouts>
            <LoginPage />
          </AuthLayouts>
        ),
      },
      {
        path: "verify-otp",
        element: (
          <AuthLayouts>
            <VerifyOTPPage />
          </AuthLayouts>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <AuthLayouts>
            <ForgotPasswordPage />
          </AuthLayouts>
        ),
      },
      {
        path: "reset-password/:token",
        element: (
          <AuthLayouts>
            <ResetPasswordPage />
          </AuthLayouts>
        ),
      },
    ],
  },
]);

export default router;