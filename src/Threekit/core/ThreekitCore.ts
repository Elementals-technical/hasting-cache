// import { getDefaultConfiguration } from "@/redux/features/configurator/configurator.selector";
// import { ThreekitItemCamera } from "../cameraSettings/ThreekitItemCamera";
// import { ThreekitMetadataService } from "../MetadataService/ThreekitMetadataService";
// import { store } from "@/redux";

type Attribute = {
  name: string;
  value: any;
  metadata?: Record<string, any>;
};

type WaitOpts = {
  /** Function that returns true/false (or Promise<boolean>) */
  predicate: () => boolean | Promise<boolean>;
  timeoutMs?: number; // default 150_000
  intervalMs?: number; // default 300
};
type WaitOptsAditional = {
  /** Function that returns true/false (or Promise<boolean>) */
  predicate?: () => boolean | Promise<boolean>;
  timeoutMs?: number; // default 150_000
  intervalMs?: number; // default 300
};

export class ThreekitCore {
  // private static defaultIdStage: string =
  //   "592a5a16-b3f4-481f-a65f-ac4138f38fa0";
  // private static readonly excludedConfigKeys: string[] = [
  //   "UIGrouping",
  //   "start_script",
  //   "UI_Arm",
  //   "UI_Basin",
  //   "UI_Bench",
  //   "UI_Faucet",
  //   "UI_Model",
  //   "UI_Size",
  //   "UI_Towel Knob",
  // ];
  // static waitThreekit(opts: WaitOpts): Promise<void> {
  //   const { predicate, timeoutMs = 15000, intervalMs = 300 } = opts;

  //   const start = Date.now();

  //   return new Promise((resolve, reject) => {
  //     const tick = async () => {
  //       try {
  //         const ok = await predicate(); // execute your predicate
  //         if (ok) return resolve(); // if true → done
  //       } catch {
  //         // ignore errors and try again
  //       }

  //       if (Date.now() - start >= timeoutMs) {
  //         return reject(new Error("Threekit not ready within timeout"));
  //       }

  //       setTimeout(tick, intervalMs); // try again after intervalMs
  //     };

  //     tick(); // start the cycle
  //   });
  // }

  // static waitThreekitConfiguratorReady(
  //   opts?: WaitOptsAditional
  // ): Promise<void> {
  //   const {
  //     predicate: extraPredicate,
  //     timeoutMs = 15000,
  //     intervalMs = 300,
  //   } = opts;

  //   // Base readiness predicate
  //   const basePredicate = async () => {
  //     if (!window.configurator) return false;
  //     if (typeof window.configurator.getConfiguration !== "function")
  //       return false;
  //     const config = await window.configurator.getConfiguration();
  //     return !!config;
  //   };

  //   // Combined predicate (AND)
  //   const combinedPredicate = async () => {
  //     const baseReady = await Promise.resolve(basePredicate());
  //     if (!extraPredicate) return baseReady;
  //     const extraReady = await Promise.resolve(extraPredicate());
  //     return baseReady && extraReady;
  //   };

  //   return ThreekitCore.waitThreekit({
  //     predicate: combinedPredicate,
  //     timeoutMs,
  //     intervalMs,
  //   });
  // }

  // static async getStageIdOrDefault() {
  //   await this.waitThreekitConfiguratorReady();

  //   const metadata = new ThreekitMetadataService(
  //     window.configurator.getMetadata()
  //   );
  //   return metadata.getStageId() || this.defaultIdStage;
  // }
  // static async getThreekitSliderCamera(): Promise<number[]> {
  //   await this.waitThreekitConfiguratorReady({
  //     predicate: async () => {
  //       return window.configurator.getMetadata() !== undefined;
  //     },
  //   });

  //   const threekitItemCamera = await new ThreekitItemCamera(
  //     window.configurator.getMetadata()
  //   );

  //   // Generate Threekit camera views
  //   const cameraNumbers = await threekitItemCamera.get360CamerasList();

  //   return cameraNumbers;
  // }
  // static async getThreekitSliderCameras(): Promise<number[]> {
  //   await this.waitThreekitConfiguratorReady({
  //     predicate: async () => {
  //       return window.configurator.getMetadata() !== undefined;
  //     },
  //   });

  //   const threekitItemCamera = await new ThreekitItemCamera(
  //     window.configurator.getMetadata()
  //   );

  //   // Generate Threekit camera views
  //   const cameraNumbers = await threekitItemCamera.getSliderCameras();

  //   return cameraNumbers;
  // }

  // static getFilteredDefaultConfiguration(): Record<string, any> {
  //   const config = getDefaultConfiguration(store.getState());

  //   return Object.keys(config)
  //     .filter((key) => !ThreekitCore.excludedConfigKeys.includes(key))
  //     .reduce<Record<string, any>>((acc, key) => {
  //       acc[key] = config[key];
  //       return acc;
  //     }, {});
  // }
  static filterConfigByPreview(
    config: Record<string, any>,
    listAttributes: Attribute[] = []
  ): Record<string, any> {
    debugger;
    const allowedKeys = Object.keys(config).filter((key) => {
      debugger;
      const attribute = listAttributes.find((attr) => attr?.name === key);
      return (
        attribute?.metadata &&
        Object.prototype.hasOwnProperty.call(
          attribute.metadata,
          "hasRenderImagePreview"
        )
      );
    });

    return listAttributes.filter((attr) => allowedKeys.includes(attr?.name));
  }
}
