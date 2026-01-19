/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import uploadFile from "../helpers/uploadFile";
import Divider from "./Divider";
import { setUser } from "../redux/userSlice";
import ConfirmationDialog from "./ConfirmationDialog";

const EditUserDetails = ({ onClose, user }) => {
  const [data, setData] = useState({
    name: user?.user,
    profile_pic: user?.profile_pic,
  });
  const [isChanged, setIsChanged] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      ...user,
    }));
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setIsChanged(true);
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenUploadPhoto = (e) => {
    e.preventDefault(); // Prevent form submission
    uploadPhotoRef.current.click();
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file);
    setIsChanged(true);
    setData((prev) => ({
      ...prev,
      profile_pic: uploadPhoto?.url,
    }));
  };

  const handleSave = async () => {
    console.log("handleSave called");
    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/update-user`;
      console.log("Making request to:", URL);

      // Only send the required fields to avoid circular references
      const dataToSend = {
        name: data.name,
        profile_pic: data.profile_pic,
        // Add any other fields you need to update, but exclude socket connections
      };

      const response = await axios({
        method: "post",
        url: URL,
        data: dataToSend, // Use the filtered data
        withCredentials: true,
      });

      console.log("Response:", response);
      if (response.data.success) {
        dispatch(setUser(response.data.data));
        toast.success(response.data.message);
        onClose();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isChanged) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10">
      <div className="bg-white p-4 py-6 m-1 rounded w-full max-w-sm  dark:bg-slate-900 text-slate-800 dark:text-slate-200  ">
        <h2 className="font-semibold">Profile Details</h2>
        <p className="text-sm">Edit User Details</p>

        <form className="grid gap-3 mt-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Name: </label>
            <input
              type="text"
              name="name"
              id="name"
              value={data.name}
              onChange={handleOnChange}
              className="w-full py-1 px-2 focus:outline-primary border-0.5  dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <div>Photo:</div>
            <div className="my-1 flex items-center gap-4">
              <Avatar
                width={40}
                height={40}
                imageUrl={data?.profile_pic}
                name={data?.name}
              />
              <label htmlFor="profile_pic">
                <button
                  type="button"
                  className="font-bold"
                  onClick={handleOpenUploadPhoto}
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  id="profile_pic"
                  className="hidden"
                  onChange={handleUploadPhoto}
                  ref={uploadPhotoRef}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <Divider />
          <div className="flex gap-2 w-fit ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="border-primary border px-4 py-1 rounded hover:bg-primary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border-primary bg-primary text-white border px-4 py-1 rounded hover:bg-secondary"
            >
              Save
            </button>
          </div>
        </form>

        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleSave}
          title="Save Changes"
          message="Are you sure you want to save these changes?"
        />
      </div>
    </div>
  );
};

export default React.memo(EditUserDetails);
