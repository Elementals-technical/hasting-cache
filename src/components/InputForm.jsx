import { useState } from "react";

const InputForm = ({
  setAssetId,

  onSubmit,
}) => {
  const [localShortId, setLocalShortId] = useState("");
  const handleInputChange = (e) => {
    setLocalShortId(e.target.value);
  };

  const handleSaveShortId = (e) => {
    e.preventDefault();
    setAssetId(localShortId);
    // Тут можна додати логіку для збереження shortId, якщо потрібно
    console.log("Asset ID :", localShortId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <form onSubmit={onSubmit} className="flex gap-4 items-end">
        <div className="flex-1">
          <label
            htmlFor="shortId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Asset ID
          </label>
          <input
            type="text"
            id="shortId"
            onChange={handleInputChange}
            placeholder="Example: tWHzjftvr"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={localShortId}
          />
        </div>
        <button
          type="submit"
          onClick={handleSaveShortId}
          className={`px-6 py-2 font-medium rounded-md focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${"bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"}`}
        >
          Show Player
        </button>
      </form>
    </div>
  );
};

export default InputForm;
