var playPromise;
function showLoadingAnim(){
    var loadingAnim = document.getElementById("loading");
    playPromise = loadingAnim.play();
    loadingAnim.style.display = "block";
}
function hideLoadingAnim(){
    var loadingAnim = document.getElementById("loading");
    loadingAnim.style.display = "none";
    if (playPromise !== undefined) {
        playPromise.then(_ => {
          // Automatic playback started!
          // Show playing UI.
          // We can now safely pause video...
          loadingAnim.pause();
        })
        .catch(error => {
          // Auto-play was prevented
          // Show paused UI.
        });
      }
}