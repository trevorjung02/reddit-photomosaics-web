// Script that sends message to server requesting the default photomosaic to be displayed. Sets the default photomosaic once received.

socket.emit("getPhotomosaic");
socket.once("sendPhotomosaic", function (imgURL) {
    let img = document.getElementById("primary");
    img.src = imgURL;
});