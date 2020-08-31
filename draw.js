var img = new Image();
img.onload = function draw() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    img.style.display = 'none';

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
};
img.src = 'public/images/photo-1494548162494-384bba4ab999.jfif';