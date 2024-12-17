export function drawString(gameInstance, string, pos) {
    string = string.toUpperCase();
    let curX = pos.x;
    for (let i = 0; i < string.length; i++) {
        gameInstance.context.drawImage(
            gameInstance.spritesheet,
            (string.charCodeAt(i) - 32) * 8, 0, 8, 8,
            curX, pos.y, 8, 8
        );
        curX += 8;
    }
}

export function drawImage(gameInstance, image, x, y) {
    gameInstance.context.drawImage(
        gameInstance.spritesheet,
        image.x, image.y, image.w, image.h,
        x, y, image.w, image.h
    );
}

export function drawSprite(gameInstance, sprite) {
    let h, destY = sprite.y - sprite.i.h * sprite.s;
    if (sprite.ymax < sprite.y) {
        h = Math.min(sprite.i.h * (sprite.ymax - destY) / (sprite.i.h * sprite.s), sprite.i.h);
    } else {
        h = sprite.i.h;
    }

    if (h > 0) {
        gameInstance.context.drawImage(gameInstance.spritesheet, sprite.i.x, sprite.i.y, sprite.i.w, h, sprite.x, destY, sprite.s * sprite.i.w, sprite.s * h);
    }
}

export function drawSegment(gameInstance, position1, scale1, offset1, position2, scale2, offset2, alternative, finishStart) {
    let sand = alternative ? gameInstance.COLOR.SANDY : gameInstance.COLOR.DARK_SANDY,
        road = alternative ? gameInstance.COLOR.DARK_GREY : gameInstance.COLOR.GREY,
        lane = alternative ? gameInstance.COLOR.WHITE : gameInstance.COLOR.GREY,
        border = alternative ? gameInstance.COLOR.RED : gameInstance.COLOR.WHITE;

    if (finishStart) {
        road = gameInstance.COLOR.WHITE;
        lane = gameInstance.COLOR.WHITE;
        border = gameInstance.COLOR.WHITE;
    }

    gameInstance.context.fillStyle = sand;
    gameInstance.context.fillRect(0, position2, gameInstance.RENDER.WIDTH, (position1 - position2));

    drawTrapez(gameInstance, position1, scale1, offset1, position2, scale2, offset2, -0.5, 0.5, road);

    drawTrapez(gameInstance, position1, scale1, offset1, position2, scale2, offset2, -0.5, -0.47, border);
    drawTrapez(gameInstance, position1, scale1, offset1, position2, scale2, offset2, 0.47, 0.5, border);

    drawTrapez(gameInstance, position1, scale1, offset1, position2, scale2, offset2, -0.18, -0.15, lane);
    drawTrapez(gameInstance, position1, scale1, offset1, position2, scale2, offset2, 0.15, 0.18, lane);
}

function drawTrapez(gameInstance, pos1, scale1, offset1, pos2, scale2, offset2, delta1, delta2, color) {
    let demiWidth = gameInstance.RENDER.WIDTH / 2;

    gameInstance.context.fillStyle = color;
    gameInstance.context.beginPath();
    gameInstance.context.moveTo(demiWidth + delta1 * gameInstance.RENDER.WIDTH * scale1 + offset1, pos1);
    gameInstance.context.lineTo(demiWidth + delta1 * gameInstance.RENDER.WIDTH * scale2 + offset2, pos2);
    gameInstance.context.lineTo(demiWidth + delta2 * gameInstance.RENDER.WIDTH * scale2 + offset2, pos2);
    gameInstance.context.lineTo(demiWidth + delta2 * gameInstance.RENDER.WIDTH * scale1 + offset1, pos1);
    gameInstance.context.fill();
}