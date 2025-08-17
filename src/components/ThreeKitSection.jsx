import React from "react";
import { PlayerThreeKit } from "../PlayerThreeKit/PlayerThreekit";

const ThreeKitSection = ({ assetId, onGetDataItem }) => {
  if (!assetId) return null;

  return (
    <div className="bg-white rounded-lg shadow-md mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          🎨 ThreeKit Player
        </h2>
      </div>
  <PlayerThreeKit onGetDataItem={onGetDataItem} />
    </div>
  );
};

export default ThreeKitSection;
