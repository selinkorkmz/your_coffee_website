import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserInfo } from "@/lib/requests";
import { toast } from "react-toastify";


export default function UserProfile() {
  const notify = (msg: string) => toast(msg);
  const { user } = useAuth()
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const toggleProfileModal = () => {
    console.log("openening ")
    setProfileModalOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[90vh] bg-amber-50">
      <p className="text-2xl font-bold text-gray-700 mt-6">Hi {user.name}!</p>
      <p className="text-xl font-medium text-gray-600 mt-2">
        This is your profile page.
      </p>

      {/* Enlarged User Information Section */}
      <div className="mt-10 p-10 shadow-2xl rounded-2xl w-full max-w-3xl">
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-500">ID:</p>
          <p className="text-xl text-gray-800">{user.user_id}</p>
        </div>

        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-500">Name:</p>
          <p className="text-xl text-gray-800">{user.name}</p>
        </div>

        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-500">Email:</p>
          <p className="text-xl text-gray-800">{user.email}</p>
        </div>

        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-500">Tax ID:</p>
          <p className="text-xl text-gray-800">{user.tax_id}</p>
        </div>

        <div className="mb-8">
          <p className="text-lg font-semibold text-gray-500">Home Address:</p>
          <p className="text-xl text-gray-800">{user.home_address}</p>
        </div>

        {/* Enlarged Edit Button */}
        <button
          onClick={toggleProfileModal}
          type="button"
          className="w-full bg-yellow-950 hover:bg-yellow-700 text-white text-lg font-semibold py-3 px-6 rounded-lg transition duration-300"
        >
          Edit Profile
        </button>
      </div>
      {isProfileModalOpen && (
        <CreateProfileModal onClose={() => setProfileModalOpen(false)} notify={notify} userId={user.user_id} />
      )}
    </div>
  )
}

function CreateProfileModal({ onClose, notify, userId }: { onClose: () => void, notify: any, userId: any }) {
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tax_id: '',
    home_address: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const { mutate: updateUserMutation } = useMutation({
    mutationFn: (params:any) => {
      // use function from requests
      return updateUserInfo({...params, userId});
    },
    onSuccess: (response) => {
      if (response.error) {
        // Show error message to the user
        console.error("Error updating user info:", response.error);
        notify(`Failed to update user: ${response.error}`);
        return;
      }
      setUser((prev)=>{
        const a = {
          ...prev,...formData
        }
        console.log(formData)
        console.log(a)
        return a
      })
      notify("Info updated successfully!");
      onClose();
    },
    onError: (error) => {
      // Handle error (e.g., show error notification)
      console.error('Error updating info:', error);
    }
  });

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUserMutation(formData)
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
          <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Profile
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-toggle="createProductModal"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 mb-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.name}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  E-Mail <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="email"
                  id="email"
                  rows={3}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.email}
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="tax_id"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Tax ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tax_id"
                  id="tax_id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.tax_id}
                />
              </div>
              <div>
                <label
                  htmlFor="home_address"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Home Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="home_address"
                  id="home_address"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                  onChange={handleChange}
                  value={formData.home_address}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="flex items-center text-green-600 hover:text-white border border-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-2 text-center"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

