export function generateRoad(gameInstance) {
    let currentStateH = 0; //0=flat 1=up 2= down
    let transitionH = [[0, 1, 2], [0, 2, 2], [0, 1, 1]];

    let currentStateC = 0; //0=straight 1=left 2= right
    let transitionC = [[0, 1, 2], [0, 2, 2], [0, 1, 1]];

    let currentHeight = 0;
    let currentCurve = 0;

    let zones = gameInstance.ROAD.LENGTH / gameInstance.ROAD.ZONE_SIZE;
    while (zones--) {
        let finalHeight;
        switch (currentStateH) {
            case 0:
                finalHeight = 0;
                break;
            case 1:
                finalHeight = gameInstance.ROAD.MAX_HEIGHT * Math.random();
                break;
            case 2:
                finalHeight = -gameInstance.ROAD.MAX_HEIGHT * Math.random();
                break;
        }
        let finalCurve;
        switch (currentStateC) {
            case 0:
                finalCurve = 0;
                break;
            case 1:
                finalCurve = -gameInstance.ROAD.MAX_CURVE * Math.random();
                break;
            case 2:
                finalCurve = gameInstance.ROAD.MAX_CURVE * Math.random();
                break;
        }

        let sprite;
        for (let i = 0; i < gameInstance.ROAD.ZONE_SIZE; i++) {
            if (i % gameInstance.ROAD.ZONE_SIZE / 4 === 0) {
                sprite = {type: gameInstance.POLE, pos: -0.55};
            } else {
                if (Math.random() < 0.05) {
                    let spriteType = gameInstance.CACTUS;
                    sprite = {type: spriteType, pos: 0.6 + 4 * Math.random()};
                    if (Math.random() < 0.5) {
                        sprite.pos = -sprite.pos;
                    }
                } else {
                    sprite = false;
                }
            }
            gameInstance.road.push({
                height: currentHeight + finalHeight / 2 * (1 + Math.sin(i / gameInstance.ROAD.ZONE_SIZE * Math.PI - Math.PI / 2)),
                curve: currentCurve + finalCurve / 2 * (1 + Math.sin(i / gameInstance.ROAD.ZONE_SIZE * Math.PI - Math.PI / 2)),
                sprite: sprite
            })
        }
        currentHeight += finalHeight;
        currentCurve += finalCurve;

        if (Math.random() < gameInstance.ROAD.MOUNTAIN_PROBABILITY) {
            currentStateH = transitionH[currentStateH][1 + Math.round(Math.random())];
        } else {
            currentStateH = transitionH[currentStateH][0];
        }
        if (Math.random() < gameInstance.ROAD.CURVE_PROBABILITY) {
            currentStateC = transitionC[currentStateC][1 + Math.round(Math.random())];
        } else {
            currentStateC = transitionC[currentStateC][0];
        }
    }
}
