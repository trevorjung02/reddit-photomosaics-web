function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            setImage(this);
        }
    };
    xhttp.open("GET", "photomosaic", true);
    xhttp.send();
}

function setImage(response) {
    var jsonObj = JSON.parse(response.responseText);
    var image = document.getElementById("primary");
    image.src = jsonObj.src;
}

loadDoc();





