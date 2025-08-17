import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { setDisplayAttributes } from '../store/store';

import s from "./PlayerThreeKit.module.scss";
import load3kit from "../utils/load3kit";

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

export const PlayerThreeKit = ({ assetId, onGetDataItem }) => {
  const playerEl = React.createRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [player, setPlayer] = useState(null);
  const dispatch = useDispatch();

  const init3kit = async () => {
    if (!playerEl.current) return false;

    if (window.threekitPlayer) {
      try {
        setIsLoading(true);
        setError("");

        const api = await window.threekitPlayer({
          authToken: THREEKIT_PARAMS["authToken"],
          el: playerEl.current,
          assetId: assetId,

          // showAR: true,
        });

        window.player = api;
        setPlayer(api);

        await api.when("preloaded");
        await api.when("loaded");

        setIsLoading(false);

        window.player.tools.removeTool("pan");
        window.player.tools.removeTool("orbit");

        const conf = await player.getConfigurator();
        const listDisplayAttributes = conf.getDisplayAttributes();
        if (Array.isArray(listDisplayAttributes)) {
          dispatch(setDisplayAttributes(listDisplayAttributes));
        }

        if (onGetDataItem) {
          onGetDataItem(api);
        }
      } catch (err) {
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

  if (!assetId) {
    return (
      <div className={s.player_wrapper}>
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🎨</div>
          <p>Enter assetId to load ThreeKit Player</p>
        </div>
      </div>
    );
  }

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
