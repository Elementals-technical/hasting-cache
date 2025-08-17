export class ThreekitMetadataService {
  meta: { [key: string]: string };

  constructor(meta: { [key: string]: string }) {
    this.meta = meta;
  }

  /**
   *  Retrieves the stage ID from the metadata.
   */
  public getStageId(): string | null {
    const stageId = this.meta["stageId"];

    if (!stageId) return undefined;

    return stageId;
  }
}