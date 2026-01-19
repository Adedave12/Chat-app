/* eslint-disable react/prop-types */
import "react";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Loading from "./Loading";
import UserSearchCard from "./UserSearchCard";
import toast from "react-hot-toast";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux"; // Add this import

const SearchUser = ({ onClose }) => {
  const [searchUser, setSearchUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const currentUser = useSelector((state) => state.user); // Get current user from Redux

  const handleSearchUser = async () => {
    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/search-user`;
    try {
      setLoading(true);
      const response = await axios.post(URL, {
        search: search,
      });
      setLoading(false);

      // Filter out the current user from search results
      const filteredUsers = response.data.data.filter(
        (user) => user._id !== currentUser._id
      );
      
      setSearchUser(filteredUsers);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    handleSearchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10  ">
      <div className="w-full max-w-lg mx-auto mt-10 dark:text-slate-900 ">
        {/* Input search user */}
        <div className="bg-white rounded overflow-hidden h-14 flex ">
          <input
            type="text"
            placeholder="Search User by name, email..."
            className="w-full outline-none py-1 h-full px-4"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          <div className="h-14 w-14 flex justify-center items-center cursor-pointer ">
            <IoSearchOutline size={25} />
          </div>
        </div>

        {/* Display Search User */}
        <div className="bg-white mt-2 w-full p-4 rounded">
          {/* No user found */}
          {searchUser.length === 0 && !loading && (
            <p className="text-center text-slate-500">No User Found!</p>
          )}

          {loading && (
            <p>
              <Loading />
            </p>
          )}
          {searchUser.length !== 0 &&
            !loading &&
            searchUser.map((user) => {
              return (
                <UserSearchCard key={user._id} user={user} onClose={onClose} />
              );
            })}
        </div>
      </div>
      <div className="absolute top-0 right-0 text-2xl p-2 lg:text-4xl hover:text-white" onClick={onClose}>
        <button>
          <IoClose/>
        </button>
      </div>
    </div>
  );
};

export default SearchUser;