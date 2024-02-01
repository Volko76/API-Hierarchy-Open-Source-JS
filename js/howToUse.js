function openHowToUse() {
    var howToUseDiv = document.getElementById("howToUse");
    if (howToUseDiv.style.display == "none" || howToUseDiv.style.display == "") {
        howToUseDiv.style.display = "block";
    } else {
        howToUseDiv.style.display = "none";
    }
}

function closeHowToUse() {
    var howToUseDiv = document.getElementById("howToUse");
    howToUseDiv.style.display = "none";
}