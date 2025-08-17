import { rotationScript } from "../../../cusmtomToolsThreekit/customRotation";

type ToolType = "none" | "rotation" | "zoom";

export class ThreekitToolsService {
  /**
   * Enables the zoom tool in the Threekit player
   * @returns The current tool type
   */
  public static enableZoom(): ToolType {
    if (window.player) {
      const advancedPlayer = window.player.enableApi("player");
      // Remove rotation tool first to avoid conflicts
      advancedPlayer.tools.removeTool("movepartSelect");
      // Add zoom tool
      // advancedPlayer.tools.addTool("zoom");
      return "zoom";
    }
    return "none";
  }

  /**
   * Enables the custom rotation tool in the Threekit player
   * @returns The current tool type
   */
  public static enableRotation(): ToolType {
    if (window.player) {
      const advancedPlayer = window.player.enableApi("player");
      // Remove zoom tool first to avoid conflicts
      // advancedPlayer.tools.removeTool("zoom");
      // Add rotation tool via the rotation script
      rotationScript(window.player);
      return "rotation";
    }
    return "none";
  }

  /**
   * Disables all tools in the Threekit player
   * @returns The current tool type
   */
  public static disableTools(): ToolType {
    if (window.player) {
      const advancedPlayer = window.player.enableApi("player");
      // Remove both tools
      advancedPlayer.tools.removeTool("zoom");
      advancedPlayer.tools.removeTool("movepartSelect");
      return "none";
    }
    return "none";
  }

  /**
   * Sets the active tool for the Threekit player
   * @param toolType The tool to activate
   * @returns The active tool type
   */
  public static setActiveTool(toolType: ToolType): ToolType {
    switch (toolType) {
      case "zoom":
        return this.enableZoom();
      case "rotation":
        return this.enableRotation();
      case "none":
      default:
        return this.disableTools();
    }
  }
}
