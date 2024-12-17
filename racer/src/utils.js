export function init(gameInstance) {
    let canvas = $(gameInstance.CANVAS_SELECTOR)[0];
    gameInstance.context = canvas.getContext('2d');
    canvas.height = gameInstance.RENDER.HEIGHT;
    canvas.width = gameInstance.RENDER.WIDTH;
    
    resize(gameInstance);
    $(window).resize(() => resize(gameInstance));

    $(document).keydown(function (e) {
        gameInstance.keys[e.keyCode] = true;
    });
    $(document).keyup(function (e) {
        gameInstance.keys[e.keyCode] = false;
    });
}

function resize(gameInstance) {
    let scale;
    if ($(window).width() / $(window).height() > gameInstance.RENDER.WIDTH / gameInstance.RENDER.HEIGHT) {
        scale = $(window).height() / gameInstance.RENDER.HEIGHT;
    } else {
        scale = $(window).width() / gameInstance.RENDER.WIDTH;
    }

    let transform = "scale(" + scale + ")";
    $(gameInstance.CANVAS_SELECTOR).css("MozTransform", transform).css("transform", transform).css("WebkitTransform", transform).css({
        top: (scale - 1) * gameInstance.RENDER.HEIGHT / 2,
        left: (scale - 1) * gameInstance.RENDER.WIDTH / 2 + ($(window).width() - gameInstance.RENDER.WIDTH * scale) / 2
    });
}

export function timeToString(time) {
    let minutes = Math.floor(time / 60000);

    let seconds = Math.floor((time - minutes * 60000) / 1000);
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    let milliseconds = Math.floor(time - minutes * 60000 - seconds * 1000);
    if (milliseconds < 100) {
        milliseconds = "0" + milliseconds;
    }
    if (milliseconds < 10) {
        milliseconds = "0" + milliseconds;
    }

    return minutes + ":" + seconds + ":" + milliseconds;
}