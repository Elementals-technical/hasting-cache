//@ts-ignore
import { useStoreSelector } from "@/main";
import { store } from "@/redux";
import {
  getDefaultConfiguration,
  getIsLoadDefaultConfiguration,
  getListAttributes,
} from "@/redux/features/configurator/configurator.selector";
import { ThreekitCore } from "../Threekit/core/ThreekitCore";
import { useEffect, useState } from "react";

export const useFilteredConfig = (): Record<string, any> | null => {
  const isLoadDefaultConfiguration = useStoreSelector(
    getIsLoadDefaultConfiguration
  );
  const listAttributes = useStoreSelector(getListAttributes);
  const [filteredConfig, setFilteredConfig] = useState<Record<
    string,
    any
  > | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ThreekitCore.waitThreekitConfiguratorReady({
          predicate: async () => isLoadDefaultConfiguration,
        });

        const config = getDefaultConfiguration(store.getState());
        const result = ThreekitCore.filterConfigByPreview(
          config,
          listAttributes
        );
        console.log("FastComposer:-filteredConfig", result);

        setFilteredConfig(result);
      } catch (e) {
        console.error("useFilteredConfig error:", e);
        // setFilteredConfig({});
      }
    })();
  }, [isLoadDefaultConfiguration, listAttributes]);

  return filteredConfig;
};
