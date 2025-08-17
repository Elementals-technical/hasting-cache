import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAllAttributes, setDisplayAttributes, setMetadata, setStageDisplayAttributes } from "../store/store";

import s from "./PlayerThreeKit.module.scss";
import load3kit from "../utils/load3kit";
import { ThreekitCore } from "../Threekit/core/ThreekitCore";

export const THREEKIT_PARAMS = {
  threekitApiBaseUrl:
    import.meta.env.VITE_THREEKIT_URL || "https://preview.threekit.com/api",
  authToken:
    import.meta.env.VITE_AUTH_TOKEN || "eaef7621-6bf7-43d3-b8a3-cfe5afd9bc26",
  assetId:
    window?.productData?.assetId ||
    import.meta.env.VITE_ASSET_ID ||
    "1d633383-c418-46a7-8521-b8030611619d",
  orgId: import.meta.env.VITE_ORG_ID || "12a6bfdf-aa5f-48e7-97ff-172e9c5775d8",
};

export const PlayerThreeKit = ({ onGetDataItem }) => {
  const playerEl = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const assetId = useSelector((s) => s.asset.assetId);
  const didInitRef = useRef(false);

  const init3kit = async () => {
    if (didInitRef.current) return; // guard against double init in StrictMode
    if (!playerEl.current) {
      // Ref ще не готовий — спробуємо знову після мікротаску
      setTimeout(init3kit, 0);
      return;
    }

    if (window.threekitPlayer) {
      try {
        setIsLoading(true);
        setError("");

        window
          .threekitPlayer({
            authToken: THREEKIT_PARAMS["authToken"],
            el: playerEl.current,
            assetId: assetId,
            // stageId: 'f9af640a-2f8e-4617-9484-84e723e97549',
            initialConfiguration: {
              ["BG_on/off"]: false,
              ["hasLoadeAppConfig"]: true,
            },
            showConfigurator: false,
            showShare: false,
          })
          .then(async (api) => {
            window.player = api;
            didInitRef.current = true;
            const conf = await api.getConfigurator();
            const listDisplayAttributes = await conf.getDisplayAttributes();
            const fullConfiguration = conf.getFullConfiguration();
            const metadata = conf.getMetadata();
            const confStage = await player.getStageConfigurator();
            const listStageDisplayAttributes = await confStage.getDisplayAttributes();

            if (Array.isArray(listDisplayAttributes)) {
              const result = ThreekitCore.filterConfigByPreview(
                fullConfiguration,
                listDisplayAttributes
              );

              debugger;
              await dispatch(setDisplayAttributes(result));
              await dispatch(setAllAttributes(result));
              await dispatch(setMetadata(metadata));
              if (Array.isArray(listStageDisplayAttributes)) {
                await dispatch(setStageDisplayAttributes(listStageDisplayAttributes));
              }
            }

            if (onGetDataItem) {
              onGetDataItem(api);
            }
            setIsLoading(false);
          })
          .catch((err) => {
            debugger;
            console.error("Error initializing ThreeKit Player:", err);
            setError(`Failed to load player: ${err.message}`);
            setIsLoading(false);
          });
      } catch (err) {
        debugger;
        console.error("Error initializing ThreeKit Player:", err);
        setError(`Failed to load player: ${err.message}`);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    load3kit(null, () => {
      init3kit();
    });
  }, [assetId]); // Перезапускаємо коли змінюється assetId

  return (
    <div className={s.player_wrapper}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-center">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Loading ThreeKit Player...</p>
          </div>
        </div>
      )}

      <div id="player" className={s.player} ref={playerEl} />
    </div>
  );
};
