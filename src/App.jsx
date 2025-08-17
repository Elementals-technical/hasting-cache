import React, { useState } from "react";
import { InputForm, ThreeKitSection } from "./components";
import AttributesCacheSection from "./components/AttributesCache/AttributesCacheSection";
import CombinationCounter from "./components/AttributesCache/CombinationCounter";

function App() {
  const [assetID, setAssetId] = useState(
    "c5f1aeee-d13b-41f6-98d6-75fd35c49236"
  );
  const handleSnapshot = (dataPlayer) => {
    // Логіка для обробки знімка

    console.log("App", dataPlayer);
  };
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <InputForm assetId={assetID} setAssetId={setAssetId} />

        <ThreeKitSection assetId={assetID} onGetDataItem={handleSnapshot} />

        <div className="mt-8">
          <AttributesCacheSection onChange={(attrs) => setSelectedAttributes(attrs)} />
          <CombinationCounter attributes={selectedAttributes} />
        </div>

      </div>
    </div>
  );
}

export default App;
