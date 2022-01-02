// Validates and then displays the users image input to the form.
let loadFile = function (event) {
    if (event.target.id == "userImage") {
        let image = document.getElementById('output');
        let re = /image/;
        // User submitted nothing
        if (!event.target.files[0]) {
            image.src = "";
            return;
        }
        // Input is not an image
        if (!re.test(event.target.files[0].type)) {
            return;
        }
        // Validated, set image
        image.src = URL.createObjectURL(event.target.files[0]);
    }
}

var socket = io();
let form = document.querySelector('form');
// Handles user submitting image. Validates submission and then requests server to create photomosaic. 
// Upon receiving photomosaic, displays it, remove progress bar, and changes page title.
form.addEventListener('submit', function (e) {
    e.preventDefault();
    let re = /image/;
    // User submited nothing or input is not an image
    if (!e.target[0].files[0] || !re.test(e.target[0].files[0].type)) {
        return;
    }
    // Open new window to show users photomosaic
    let popup = window.open('userImage.html');
    // Request server to create photomosaic
    socket.emit('create:user', e.target[0].files[0]);
    // Reset form and image preview
    let image = document.getElementById('output');
    image.src = '';
    form.reset();
    // Receive photomosaic from server
    socket.once('send:user', function (outputImage) {
        // Display photomosaic
        let img = popup.document.getElementById("primary");
        img.src = outputImage;
        // Remove progress bar
        let progressBar = popup.document.getElementById("progressSection");
        progressBar.remove();
        // Set title to Reddit Photomosaics
        let title = popup.document.querySelector("a");
        title.innerHTML = "Reddit Photomosaics";
    });
});