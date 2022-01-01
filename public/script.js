let loadFile = function (event) {
    if (event.target.id == "userImage") {
        let image = document.getElementById('output');
        let re = /image/;
        if (!event.target.files[0]) {
            image.src = "";
            return;
        }
        if (!re.test(event.target.files[0].type)) {
            return;
        }
        image.src = URL.createObjectURL(event.target.files[0]);
    }
}

var socket = io();
let form = document.querySelector('form');
form.addEventListener('submit', function (e) {
    e.preventDefault();
    let re = /image/;
    if (!e.target[0].files[0] || !re.test(e.target[0].files[0].type)) {
        return;
    }
    let popup = window.open('userImage.html');
    socket.emit('create:user', e.target[0].files[0]);
    let image = document.getElementById('output');
    image.src = '';
    form.reset();
    socket.once('send:user', function (outputImage) {
        let img = popup.document.getElementById("primary");
        img.src = outputImage;
        let progressBar = popup.document.getElementById("progressSection");
        progressBar.remove();
        let title = popup.document.querySelector("a");
        title.innerHTML = "Reddit Photomosaics";
    });
});