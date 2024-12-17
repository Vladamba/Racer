import { init as initUtils, timeToString } from './utils.js';
import { getRecords, addRecord } from './api.js';
import { drawString, drawImage, drawSprite, drawSegment } from './render.js';
import { generateRoad } from './road.js';

export class Game {
    constructor() {
        this.CANVAS_SELECTOR = '#gameCanvas';
        this.SPRITESHEET_NAME = 'spritesheet.png';
        this.TIMEOUT = 30;

        this.KEY = {
            SPACE: 32,
            ESCAPE: 27,
            TAB: 9,
            ARROW_UP: 38,
            ARROW_DOWN: 40,
            ARROW_LEFT: 37,
            ARROW_RIGHT: 39,
        };
        
        this.ROAD = {
            LENGTH: 2500,
            ZONE_SIZE: 250,
            MAX_HEIGHT: 900,
            MAX_CURVE: 400,
            CURVE_PROBABILITY: 0.8,
            MOUNTAIN_PROBABILITY: 0.8,
            SEGMENT_SIZE: 5,
            SEGMENT_PER_COLOR: 4,
        };

        this.RENDER = {
            WIDTH: 320,
            HEIGHT: 240,
            DEPTH: 150,
            CAMERA_DISTANCE: 30,
            CAMERA_HEIGHT: 100,
        };

        this.PLAYER = {
            START_POSITION: 10,
            POSITION_X_OFFSET_OFF_ROAD: 130,
            MAX_SPEED: 15,
            MAX_SPEED_OFF_ROAD: 3,
            MAX_SPEED_KILOMETERS: 200,
            MAX_TIME_MINUTES: 10,
            ACCELERATION: 0.05,
            DECELERATION: 0.1,
            DECELERATION_OFF_ROAD: 0.2,
            BREAKING: 0.5,
            TURNING: 5.0,
        };

        this.COLOR = {
            WHITE: "#fff",
            GREY: "#777",
            DARK_GREY: "#999",
            RED: "#e00",
            SANDY: "#eda",
            DARK_SANDY: "#dc9",
        }

        this.LOGO = {x: 357, y: 9, w: 115, h: 20};
        this.BACKGROUND = {x: 0, y: 9, w: 320, h: 120};
        this.CACTUS = {x: 321, y: 9, w: 23, h: 50};
        this.POLE = {x: 345, y: 9, w: 11, h: 14};
        this.CAR = {
            STRAIGHT: {x: 0, y: 130, w: 69, h: 38},
            LEFT: {x: 70, y: 130, w: 77, h: 38},
            RIGHT: {x: 148, y: 130, w: 77, h: 38}
        };

        this.menuInterval = null;
        this.gameInterval = null;
        this.tableInterval = null;

        this.spritesheet = null;
        this.context = null;
        this.keys = [];
        this.records = [];

        this.road = [];
        this.player = {
            position: 0,
            positionX: 0,
            lastPositionXOffset: 0,
            speed: 0,
            startTime: null,
            finished: false,
        };
    }

    start() {
        const self = this;

        initUtils(self);

        self.spritesheet = new Image();
        self.spritesheet.onload = function () {
            self.menuInterval = setInterval(() => self.renderMenuFrame(), self.TIMEOUT);
        };
        self.spritesheet.src = this.SPRITESHEET_NAME;
    }

    renderMenuFrame() {
        const self = this;

        self.context.fillStyle = "rgb(0,0,0)";
        self.context.fillRect(0, 0, self.RENDER.WIDTH, self.RENDER.HEIGHT);
        drawImage(self, self.LOGO, 100, 20);

        drawString(self, "Instructions", {x: 100, y: 90});
        drawString(self, "Press Space to start", {x: 30, y: 100});
        drawString(self, "Use arrows to drive", {x: 30, y: 110});
        drawString(self, "Press Tab to see records table", {x: 30, y: 120});
        drawString(self, "Press Escape to go back to menu", {x: 30, y: 130});
        drawString(self, "Press F11 to enter full screen mode", {x: 30, y: 140});

        if (self.keys[self.KEY.SPACE]) {
            self.keys[self.KEY.SPACE] = false;
            clearInterval(self.menuInterval);

            self.road = [];

            self.player.position = self.PLAYER.START_POSITION;
            self.player.positionX = 0;
            self.player.speed = 0;
            self.player.lastPositionXOffset = 0;
            self.player.finished = false;

            generateRoad(self);

            self.gameInterval = setInterval(() => self.renderGameFrame(), self.TIMEOUT);
            self.player.startTime = new Date();
        }

        if (self.keys[self.KEY.TAB]) {
            self.keys[self.KEY.TAB] = false;
            clearInterval(self.menuInterval);

            getRecords().then(records => {
                self.records = records;
            });

            self.tableInterval = setInterval(() => self.renderTableFrame(), self.TIMEOUT);
        }
    }

    renderTableFrame() {
        const self = this;

        self.context.fillStyle = "rgb(0,0,0)";
        self.context.fillRect(0, 0, self.RENDER.WIDTH, self.RENDER.HEIGHT);
        drawImage(self, self.LOGO, 100, 20);

        drawString(self, "Records", {x: 100, y: 90});
        for (let i = 0; i < 10; i++) {
            drawString(self,
                (i + 1) + " - " + (self.records[i] ? timeToString(self.records[i]) : "no time"),
                {x: 100 - (i === 9 ? 8 : 0), y: 100 + i * 10}
            );
        }
        drawString(self, "Press Escape to go back to menu", {x: 30, y: 210});

        if (self.keys[self.KEY.ESCAPE]) {
            self.keys[self.KEY.ESCAPE] = false;
            clearInterval(self.tableInterval);

            self.menuInterval = setInterval(() => self.renderMenuFrame(), self.TIMEOUT);
        }
    }

    renderGameFrame() {
        const self = this;

        if (self.keys[self.KEY.ESCAPE]) {
            self.keys[self.KEY.ESCAPE] = false;
            clearInterval(self.gameInterval);

            self.menuInterval = setInterval(() => self.renderMenuFrame(), self.TIMEOUT);

            return;
        }

        if (self.player.finished) {
            return;
        }

        if (Math.abs(self.player.lastPositionXOffset) > self.PLAYER.POSITION_X_OFFSET_OFF_ROAD
            && self.player.speed > self.PLAYER.MAX_SPEED_OFF_ROAD
        ) {
            self.player.speed -= self.PLAYER.DECELERATION_OFF_ROAD;
        }

        if (self.keys[self.KEY.ARROW_UP]) {
            self.player.speed += self.PLAYER.ACCELERATION;
        } else if (self.keys[self.KEY.ARROW_DOWN]) {
            self.player.speed -= self.PLAYER.BREAKING;
        } else {
            self.player.speed -= self.PLAYER.DECELERATION;
        }

        self.player.speed = Math.max(self.player.speed, 0);
        self.player.speed = Math.min(self.player.speed, self.PLAYER.MAX_SPEED);
        self.player.position += self.player.speed;


        self.context.fillStyle = self.COLOR.DARK_SANDY;
        self.context.fillRect(0, 0, self.RENDER.WIDTH, self.RENDER.HEIGHT);

        let backgroundX = -self.player.positionX / 2 % (self.BACKGROUND.w);
        drawImage(self, self.BACKGROUND, backgroundX - self.BACKGROUND.w + 1, 0);
        drawImage(self, self.BACKGROUND, backgroundX + self.BACKGROUND.w - 1, 0);
        drawImage(self, self.BACKGROUND, backgroundX, 0);


        let absoluteIndex = Math.floor(self.player.position / self.ROAD.SEGMENT_SIZE);
        let time = (new Date()).getTime() - self.player.startTime.getTime();

        if (absoluteIndex >= self.ROAD.LENGTH - self.RENDER.DEPTH - 1) {
            self.player.finished = true;

            addRecord(time);

            drawString(self, "You did it!!!", {x: 100, y: 30});
            drawString(self, "Press Escape to go back to menu", {x: 30, y: 40});
        } else if (Math.floor(time / 60000) >= self.PLAYER.MAX_TIME_MINUTES) {
            self.player.finished = true;

            drawString(self, "Too slow, try again", {x: 100, y: 30});
            drawString(self, "Press Escape to go back to menu", {x: 30, y: 40});
        }


        let spriteBuffer = [];

        let currentSegmentIndex = (absoluteIndex - 2) % self.ROAD.LENGTH;
        let currentSegmentPosition = (absoluteIndex - 2) * self.ROAD.SEGMENT_SIZE - self.player.position;
        let currentSegment = self.road[currentSegmentIndex];

        let lastProjectedHeight = Number.POSITIVE_INFINITY;
        let probedDepth = 0;
        let counter = absoluteIndex % (2 * self.ROAD.SEGMENT_PER_COLOR);

        let playerPosSegmentHeight = self.road[absoluteIndex % self.ROAD.LENGTH].height;
        let playerPosNextSegmentHeight = self.road[(absoluteIndex + 1) % self.ROAD.LENGTH].height;
        let playerPosRelative = (self.player.position % self.ROAD.SEGMENT_SIZE) / self.ROAD.SEGMENT_SIZE;
        let playerHeight = self.RENDER.CAMERA_HEIGHT + playerPosSegmentHeight + (playerPosNextSegmentHeight - playerPosSegmentHeight) * playerPosRelative;

        let baseOffset = currentSegment.curve + (self.road[(currentSegmentIndex + 1) % self.ROAD.LENGTH].curve - currentSegment.curve) * playerPosRelative;

        self.player.lastPositionXOffset = self.player.positionX - baseOffset * 2;

        let iter = self.RENDER.DEPTH;
        while (iter--) {
            let nextSegmentIndex = (currentSegmentIndex + 1) % self.ROAD.LENGTH;
            let nextSegment = self.road[nextSegmentIndex];

            let startProjectedHeight = Math.floor((playerHeight - currentSegment.height) * self.RENDER.CAMERA_DISTANCE / (self.RENDER.CAMERA_DISTANCE + currentSegmentPosition));
            let startScaling = 30 / (self.RENDER.CAMERA_DISTANCE + currentSegmentPosition);

            let endProjectedHeight = Math.floor((playerHeight - nextSegment.height) * self.RENDER.CAMERA_DISTANCE / (self.RENDER.CAMERA_DISTANCE + currentSegmentPosition + self.ROAD.SEGMENT_SIZE));
            let endScaling = 30 / (self.RENDER.CAMERA_DISTANCE + currentSegmentPosition + self.ROAD.SEGMENT_SIZE);

            let currentHeight = Math.min(lastProjectedHeight, startProjectedHeight);
            let currentScaling = startScaling;

            if (currentHeight > endProjectedHeight) {
                drawSegment(
                    self,
                    self.RENDER.HEIGHT / 2 + currentHeight,
                    currentScaling, currentSegment.curve - baseOffset - (self.player.positionX - baseOffset * 2) * currentScaling,
                    self.RENDER.HEIGHT / 2 + endProjectedHeight,
                    endScaling,
                    nextSegment.curve - baseOffset - (self.player.positionX - baseOffset * 2) * endScaling,
                    counter < self.ROAD.SEGMENT_PER_COLOR, currentSegmentIndex === 2 || currentSegmentIndex === (self.ROAD.LENGTH - self.RENDER.DEPTH));
            }
            if (currentSegment.sprite) {
                spriteBuffer.push({
                    y: self.RENDER.HEIGHT / 2 + startProjectedHeight,
                    x: self.RENDER.WIDTH / 2 - currentSegment.sprite.pos * self.RENDER.WIDTH * currentScaling + currentSegment.curve - baseOffset - (self.player.positionX - baseOffset * 2) * currentScaling,
                    ymax: self.RENDER.HEIGHT / 2 + lastProjectedHeight,
                    s: 2.5 * currentScaling,
                    i: currentSegment.sprite.type
                });
            }

            lastProjectedHeight = currentHeight;

            probedDepth = currentSegmentPosition;

            currentSegmentIndex = nextSegmentIndex;
            currentSegment = nextSegment;
            currentSegmentPosition += self.ROAD.SEGMENT_SIZE;

            counter = (counter + 1) % (2 * self.ROAD.SEGMENT_PER_COLOR);
        }

        let sprite;
        while (sprite = spriteBuffer.pop()) {
            drawSprite(self, sprite);
        }

        let carSprite;
        if (self.keys[self.KEY.ARROW_LEFT]) {
            if (self.player.speed > 0) {
                self.player.positionX -= self.PLAYER.TURNING;
            }
            carSprite = {
                a: self.CAR.LEFT,
                x: 117,
                y: 190
            };
        } else if (self.keys[self.KEY.ARROW_RIGHT]) {
            if (self.player.speed > 0) {
                self.player.positionX += self.PLAYER.TURNING;
            }
            carSprite = {
                a: self.CAR.RIGHT,
                x: 125,
                y: 190
            };
        } else {
            carSprite = {
                a: self.CAR.STRAIGHT,
                x: 125,
                y: 190
            };
        }
        drawImage(self, carSprite.a, carSprite.x, carSprite.y);

        drawString(self,
            timeToString(time),
            {x: 2, y: 2}
        );

        drawString(self,
            Math.round(self.player.speed / self.PLAYER.MAX_SPEED * self.PLAYER.MAX_SPEED_KILOMETERS) + "kph",
            {x: 2, y: 12}
        );

        drawString(self,
            Math.round(absoluteIndex / (self.ROAD.LENGTH - self.RENDER.DEPTH) * 100) + "%",
            {x: 286, y: 2}
        );
    };
}