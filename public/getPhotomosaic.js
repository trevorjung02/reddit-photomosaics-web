socket.emit("getPhotomosaic");
socket.once("sendPhotomosaic", function (imgURL) {
    let img = document.getElementById("primary");
    img.src = imgURL;
});