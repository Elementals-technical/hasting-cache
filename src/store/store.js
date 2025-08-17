import { configureStore, createSlice } from "@reduxjs/toolkit";

// All attributes from the master JSON
const allAttributesSlice = createSlice({
  name: "allAttributes",
  initialState: [],
  reducers: {
    setAllAttributes: (_state, action) => action.payload || [],
    clearAllAttributes: () => [],
  },
});

// Display attributes coming from ThreeKit configurator (what UI should focus on)
const displayAttributesSlice = createSlice({
  name: "displayAttributes",
  initialState: [],
  reducers: {
    setDisplayAttributes: (_state, action) => action.payload || [],
    clearDisplayAttributes: () => [],
  },
});

// User-selected attributes (same JSON schema as allAttributes but filtered)
const selectedForCacheSlice = createSlice({
  name: "selectedForCache",
  initialState: [],
  reducers: {
    setSelectedForCache: (_state, action) => action.payload || [],
    clearSelectedForCache: () => [],
  },
});

export const { setAllAttributes, clearAllAttributes } =
  allAttributesSlice.actions;
export const { setDisplayAttributes, clearDisplayAttributes } =
  displayAttributesSlice.actions;
export const { setSelectedForCache, clearSelectedForCache } =
  selectedForCacheSlice.actions;




// Asset ID slice
const assetSlice = createSlice({
  name: "asset",
  initialState: { assetId: "" },
  reducers: {
    setAssetId: (state, action) => {
      state.assetId = action.payload || "";
    },
    clearAssetId: (state) => {
      state.assetId = "";
    },
  },
});

export const { setAssetId, clearAssetId } = assetSlice.actions;

// Metadata slice (from ThreeKit configurator)
const metadataSlice = createSlice({
  name: "metadata",
  initialState: null,
  reducers: {
    setMetadata: (_state, action) => action.payload ?? null,
    clearMetadata: () => null,
  },
});

export const { setMetadata, clearMetadata } = metadataSlice.actions;

// Stage display attributes slice
const stageDisplayAttributesSlice = createSlice({
  name: "stageDisplayAttributes",
  initialState: [],
  reducers: {
    setStageDisplayAttributes: (_state, action) => action.payload || [],
    clearStageDisplayAttributes: () => [],
  },
});

export const { setStageDisplayAttributes, clearStageDisplayAttributes } =
  stageDisplayAttributesSlice.actions;

export const store = configureStore({
  reducer: {
    allAttributes: allAttributesSlice.reducer,
    displayAttributes: displayAttributesSlice.reducer,
    selectedForCache: selectedForCacheSlice.reducer,
  asset: assetSlice.reducer,
  metadata: metadataSlice.reducer,
  stageDisplayAttributes: stageDisplayAttributesSlice.reducer,
  },
});
