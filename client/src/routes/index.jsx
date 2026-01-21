import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import VerifyOTPPage from "../pages/VerifyOTPPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import Home from "../pages/Home";
import SettingsPage from "../pages/SettingsPage";
import ProfilePage from "../pages/ProfilePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import ThemeSettingsPage from "../pages/ThemeSettingsPage";
import MessagePage from "../components/MessagePage";
import GroupsPage from "../pages/GroupsPage";
import GroupChatPage from "../pages/GroupChatPage";
import GroupInfoPage from "../pages/GroupInfoPage";
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
      
      // Profile route
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      
      // Settings routes
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/password",
        element: (
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/theme",
        element: (
          <ProtectedRoute>
            <ThemeSettingsPage />
          </ProtectedRoute>
        ),
      },
      
      // Group routes
      {
        path: "groups",
        element: (
          <ProtectedRoute>
            <GroupsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups/:groupId",
        element: (
          <ProtectedRoute>
            <GroupChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups/:groupId/info",
        element: (
          <ProtectedRoute>
            <GroupInfoPage />
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