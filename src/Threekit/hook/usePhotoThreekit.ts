import { useState, useEffect } from "react";
//@ts-ignore
import { useStoreSelector } from "../../main";
import { UrlService } from "../../services/UrlService";
import ThreekitURLGenerator from "../../services/ThreeekitURLGroup";

//@ts-ignore
import { ThreekitMetadataService } from "../../services/Threekit/MetadataService/ThreekitMetadataService";
import { getIsLoadDefaultConfiguration } from "../../redux/features/configurator/configurator.selector";
//@ts-ignore
import { THREEKIT_PARAMS } from "../../App";
import { ThreekitCore } from "../Threekit/core/ThreekitCore";

export interface PhotoImage {
  url: string;
  camera: string;
  source: "threekit";
  id?: string;
}

export interface UsePhotoGalleryReturn {
  threekitImages: PhotoImage[];
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

export type UsePhotoGalleryOptions = {
  configuration?: Record<string, any>;
  cameras?: Array<string | number>;
};

function buildThreekitImages(params: {
  productId: string;
  orgId: string;
  stageId: string;
  authToken: string;
  cameras: Array<string | number>;
  configuration: Record<string, any>;
}): PhotoImage[] {
  const { productId, orgId, stageId, authToken, cameras, configuration } =
    params;

  return cameras.map((camera): PhotoImage => {
    const generator = new ThreekitURLGenerator({
      assetId: productId,
      orgId,
      stageId,
      bearer_token: authToken,
      display: "image",
      height: 2500,
      width: 2500,
      format: "jpg",
      configuration,
      stageConfiguration: { Camera: camera },
    });
    return {
      url: generator.generateURL(),
      camera: camera.toString(),
      source: "threekit",
    };
  });
}

/**
 * Generates Threekit images. External configuration and stageConfiguration can be passed.
 */
export const usePhotoGallery = (
  options: UsePhotoGalleryOptions = {}
): UsePhotoGalleryReturn => {
  const [threekitImages, setThreekitImages] = useState<PhotoImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoadDefaultConfiguration = useStoreSelector(
    getIsLoadDefaultConfiguration
  );

  const { configuration, cameras } = options;

  const productId = UrlService.getAsset() || THREEKIT_PARAMS?.assetId || "";

  // stable keys for dependencies
  const camerasKey = JSON.stringify(cameras ?? []);
  const configKey = JSON.stringify(configuration ?? {});

  const load = async () => {
    setIsLoading(true);
    setError(null);
    setIsReady(false);

    try {
      if (!configuration || Object.keys(configuration).length === 0) {
        throw new Error("Configuration is missing.");
      }
      if (!productId) {
        throw new Error("ProductId (assetId) is missing.");
      }

      await ThreekitCore.waitThreekitConfiguratorReady({
        predicate: async () => {
          return isLoadDefaultConfiguration;
        },
      });

      // StageId: from metadata or fallback
      const metadata = new ThreekitMetadataService(
        window.configurator!.getMetadata()
      );
      const stageId = metadata.getStageId();

      // URL generation
      const images = buildThreekitImages({
        productId: productId,
        orgId: "12a6bfdf-aa5f-48e7-97ff-172e9c5775d8",
        stageId,
        authToken: THREEKIT_PARAMS.authToken,
        cameras,
        configuration,
      });

      setThreekitImages(images);
      setIsReady(true);
    } catch (e: any) {
      console.warn("usePhotoThreekit:", e);
      setError(e?.message ?? "Unknown error");
      setIsReady(true); // show UI even with errors
    } finally {
      setIsLoading(false);
    }
  };

  // Initialization/reload
  useEffect(() => {
    load();

    // rerunKeyRef.current allows forced reload
  }, [isLoadDefaultConfiguration, camerasKey, configKey]);

  return {
    threekitImages,
    isLoading,
    isReady,
    error,
  };
};
