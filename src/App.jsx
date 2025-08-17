import React, { useEffect, useState } from "react";
import { InputForm, ThreeKitSection } from "./components";
import AttributesCacheSection from "./components/AttributesCache/AttributesCacheSection";
import CombinationCounter from "./components/AttributesCache/CombinationCounter";
import { useDispatch } from 'react-redux';
import { setAssetId as setAssetIdInStore, setAllAttributes } from './store/store';

// Helper to load attributes once and seed the store
async function loadAttributesData() {
  try {
    const mod = await import("../JsonAttributeThreekit.js?raw");
    return JSON.parse(mod.default);
  } catch (e) {
    try {
      const resp = await fetch("/JsonAttributeThreekit.js");
      const txt = await resp.text();
      return JSON.parse(txt);
    } catch (err) {
      return [];
    }
  }
}

function App() {
  const [assetID, setAssetId] = useState(
    "c5f1aeee-d13b-41f6-98d6-75fd35c49236"
  );
  const handleSnapshot = (dataPlayer) => {
    // Логіка для обробки знімка

    console.log("App", dataPlayer);
  };
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAssetIdInStore(assetID));
  }, [assetID, dispatch]);
 
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
