type ViewportMeta = {
  [key: string]: string;
};

export class CustomViewportService {
  private meta: ViewportMeta;

  constructor(meta: ViewportMeta) {
    this.meta = meta;
  }

  /**
   * Повертає width зі стилізацією
   */
  public getViewport(): string | null {
    const customWidth = this.meta["customViewport"];

    if (!customWidth) return null;

    return customWidth;
  }

  /**
   * Застосовує стилі до canvas елементу
   */
  public applyToCanvas(canvasSelector: string = "#canvas"): boolean {
    const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;
    if (!canvas) return false;

    const viewport = this.getViewport();
    if (!viewport) return false;

    canvas.style.width = viewport;
    canvas.style.height = viewport;

    // Центруємо батьківський елемент
    if (canvas.parentElement) {
      canvas.parentElement.style.alignItems = "center";
    }

    return true;
  }

  /**
   * Статичний метод для швидкого застосування
   */
  static applyToCanvas(
    meta: ViewportMeta,
    selector: string = "#canvas"
  ): boolean {
    return new CustomViewportService(meta).applyToCanvas(selector);
  }
}
