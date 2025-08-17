import { useState, useEffect } from "react";

export const useWindowPropertyWatcher = (propertyName, initialValue) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    let lastValue = window[propertyName];

    const checkForChanges = () => {
      const currentValue = window[propertyName];
      if (currentValue !== lastValue) {
        setValue(currentValue);
        lastValue = currentValue;
      }

      requestAnimationFrame(checkForChanges);
    };

    checkForChanges();

    return () => {
      // Здесь может быть логика для остановки цикла, если это необходимо
    };
  }, [propertyName]);

  return value;
};
