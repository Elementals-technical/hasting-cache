const load3kit = (tkcsid, callback) => {
  const existingScript = document.getElementById("threekit");

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "https://preview.threekit.com/app/js/threekit-player.js";
    script.id = "threekit";
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  }

  let interval = null;
  const callbackIfExist = () => {
    if (!window.threekitPlayer) return false;

    clearInterval(interval);
    callback();
  };

  if (existingScript && callback) {
    callbackIfExist();
    interval = setInterval(() => {
      callbackIfExist();
    }, 50);
  }
};

export default load3kit;