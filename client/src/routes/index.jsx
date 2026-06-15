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
import ArchivedPage from "../pages/ArchivedPage";
import AuthLayouts from "../layout";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Protected routes wrapped in Home layout
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ":userId",
            element: <MessagePage />,
          },
          // Profile route
          {
            path: "profile",
            element: <ProfilePage />,
          },
          // Settings routes
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "settings/password",
            element: <ChangePasswordPage />,
          },
          {
            path: "settings/theme",
            element: <ThemeSettingsPage />,
          },
          // Group routes
          {
            path: "groups",
            element: <GroupsPage />,
          },
          {
            path: "groups/:groupId",
            element: <GroupChatPage />,
          },
          {
            path: "groups/:groupId/info",
            element: <GroupInfoPage />,
          },
          // Archived route
          {
            path: "archived",
            element: <ArchivedPage />,
          },
        ],
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