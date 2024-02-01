function duplicateDotFilesToWorkWith() {
    var request = document.getElementById("cartoSelector").value;
    fetch(request, {
        method: 'GET',
        headers: {
            'content-type': 'application/octet-stream',
            'Cache-Control': 'private, max-age=0, no-cache',
        },
    })
        .then(resp => resp.text())
        .then(data => { dotOriginSrc = data; render(dotOriginSrc); initNodeList(dotOriginSrc); })
        .catch(err => { console.log(err) });
    dotSrc = dotOriginSrc;
}

// Main Program
