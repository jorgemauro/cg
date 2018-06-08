// canvas.js

import React, {Component} from 'react';

import Button from '@material-ui/core/Button';
class Canvas extends Component {
    constructor(props) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.endPaintEvent = this.endPaintEvent.bind(this);
    }

    isPainting = false;
    line = [];
    prevPos = {offsetX: 0, offsetY: 0};

    pixel(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        this.ctx.fillStyle = this.userStrokeStyle;
        this.ctx.fillRect(x, y, 1, 1);
    }

    onMouseDown({nativeEvent}) {
        const {offsetX, offsetY} = nativeEvent;
        this.isPainting = true;
        this.prevPos = {offsetX, offsetY};
    }

    onMouseMove({nativeEvent}) {
        if (this.isPainting) {
            const {offsetX, offsetY} = nativeEvent;
            const offSetData = {offsetX, offsetY};
            // Set the start and stop position of the paint event.
            const positionData = {
                start: {...this.prevPos},
                stop: {...offSetData},
            };
            // Add the position to the line array
            this.line = this.line.concat(positionData);
            this.paint(this.prevPos, offSetData);
        }
    }

    endPaintEvent() {
        if (this.isPainting) {
            this.isPainting = false;
            this.ctx.save();
        }
    }

    refresh() {
        this.ctx.clearRect(0, 0, 500, 500);
    }

    paint(prevPos, currPos) {
        const {offsetX, offsetY} = currPos;
        let {offsetX: x, offsetY: y} = prevPos;
        if (this.props.tipo === 'Livre') {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.props.color;
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(offsetX, offsetY);
            this.ctx.stroke();
            this.prevPos = {offsetX, offsetY};
            this.ctx.closePath();
        } else if (this.props.tipo === 'DDA') {
            this.refresh();
            this.dda(x, y, offsetX, offsetY);
            this.ctx.fillText(
                "( " + x.toFixed(2) + ", " + y.toFixed(2) + " ) → ( "
                + offsetX.toFixed(2) + ", " + offsetY.toFixed(2) + " )",
                x - 50, y + 50);

            this.ctx.font = '12pt Calibri bold';
            this.ctx.fillText("DDA", 10, 30);
        } else if (this.props.tipo === 'Bresenham') {
            this.refresh();
            this.bresenham(x, y, offsetX, offsetY);

            this.ctx.fillText(
                "( " + x.toFixed(2) + ", " + y.toFixed(2) + " ) → ( "
                + offsetX.toFixed(2) + ", " + offsetY.toFixed(2) + " )",
                x - 50, y + 50);

            this.ctx.font = '12pt Calibri bold';
            this.ctx.fillText("Bresenham", 10, 30);
        } else if (this.props.tipo === 'Circle') {
            this.refresh();
            const dist = Math.round(Math.sqrt((x - offsetX) * (x - offsetX) + (y - offsetY) * (y - offsetY)));
            this.Circle(x, y, dist);

            this.ctx.fillText("( " + x.toFixed(2) + ", " + y.toFixed(2) + " ) - radius: "
                + dist.toFixed(2),
                x - 50, y + dist + 50);
            this.pixel(this.x, this.y);
            this.pixel(this.x + 1, this.y);
            this.pixel(this.x - 1, this.y);
            this.pixel(this.x, this.y + 1);
            this.pixel(this.x, this.y - 1);

            this.ctx.font = '12pt Calibri bold';
            this.ctx.fillText("Bresenham Circle", 10, 30);
        }
    }

    bresenham(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let xincr, yincr;

        if (dx < 0) {
            xincr = -1;
            dx = -dx;
        }
        else {
            xincr = 1;
        }

        if (dy < 0) {
            yincr = -1;
            dy = -dy;
        }
        else {
            yincr = 1;
        }

        let x = x1, y = y1;

        this.pixel(x, y);

        if (dx > dy) {
            let p = 2 * dy - dx;
            let const1 = 2 * dy;
            let const2 = 2 * (dy - dx);

            for (let i = 0; i < dx; i++) {
                x += xincr;

                if (p < 0) {
                    p += const1;
                }
                else {
                    p += const2;
                    y += yincr;
                }

                this.pixel(x, y);
            }
        }
        else {
            let p = 2 * dx - dy;
            let const1 = 2 * dx;
            let const2 = 2 * (dx - dy);

            for (let i = 0; i < dy; i++) {
                y += yincr;

                if (p < 0) {
                    p += const1;
                }
                else {
                    p += const2;
                    x += xincr;
                }

                this.pixel(x, y);
            }
        }
    }

    dda(x1, y1, x2, y2) {
        let x = x1;
        let y = y1;

        let dx = x2 - x1;
        let dy = y2 - y1;

        let passos;

        if (Math.abs(dx) > Math.abs(dy)) passos = Math.abs(dx);
        else passos = Math.abs(dy);

        let xincr = dx / passos;
        let yincr = dy / passos;

        this.pixel(Math.round(x), Math.round(y));

        for (let i = 0; i <= passos; i++) {
            x += xincr;
            y += yincr;

            this.pixel(Math.round(x), Math.round(y));
        }
    }

    Circle(xc, yc, r) {
        let x = 0;
        let y = r;
        let p = 3 - 2 * r;

        this.pixel(xc + x, yc + y);
        this.pixel(xc - x, yc + y);
        this.pixel(xc + x, yc - y);
        this.pixel(xc - x, yc - y);
        this.pixel(xc + y, yc + x);
        this.pixel(xc - y, yc + x);
        this.pixel(xc + y, yc - x);
        this.pixel(xc - y, yc - x);

        while (x < y) {
            if (p < 0) p += 4 * x + 6;
            else {
                p += 4 * (x - y) + 10;
                y--;
            }
            x++;

            this.pixel(xc + x, yc + y);
            this.pixel(xc - x, yc + y);
            this.pixel(xc + x, yc - y);
            this.pixel(xc - x, yc - y);
            this.pixel(xc + y, yc + x);
            this.pixel(xc - y, yc + x);
            this.pixel(xc + y, yc - x);
            this.pixel(xc - y, yc - x);
        }
    }

    componentDidMount() {
        // Here we set up the properties of the canvas element.
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = 5;
        this.ctx.save();
    }

    Translate(object, x, y) {
        for (let i = 0; i < object.vertexData.length; i++) {
            object.vertexData[i].x += x;
            object.vertexData[i].y += y;
        }
    }

    Rotate(object, x, y, angle) {
        for (let i = 0; i < object.vertexData.length; i++) {
            let _angle = (Math.PI / 180) * angle;
            let _x, _y;
            _x = (object.vertexData[i].x - x) * Math.cos(_angle) - (object.vertexData[i].y - y) * Math.sin(_angle) + x;
            _y = (object.vertexData[i].y - y) * Math.cos(_angle) + (object.vertexData[i].x - x) * Math.sin(_angle) + y;

            object.vertexData[i].x = _x;
            object.vertexData[i].y = _y;
        }
    }

    Scale(object, cx, cy, sx, sy) {
        for (let i = 0; i < object.vertexData.length; i++) {
            object.vertexData[i].x = (object.vertexData[i].x - cx) * sx + cx;
            object.vertexData[i].y = (object.vertexData[i].y - cy) * sy + cy;
        }
    }

    Reflect(object, cx, cy, rx, ry) {
        for (let i = 0; i < object.vertexData.length; i++) {
            if (rx === true) {
                object.vertexData[i].x -= cx;
                object.vertexData[i].x *= -1;
                object.vertexData[i].x += cx;
            }
            if (ry === true) {
                object.vertexData[i].y -= cy;
                object.vertexData[i].y *= -1;
                object.vertexData[i].y += cy;
            }
        }
    }

    render() {
        return (
            <div>

                <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
                    <div className="color-guide" style={{display: 'flex', flexFlow: 'column'}}>
                        <Button onClick={() => this.setEstado("Livre")} variant="raised" color='#0D47A'>Livre</Button>
                        <Button onClick={() => this.setEstado("DDA")} variant="raised">DDA</Button>
                        <Button onClick={() => this.setEstado("Bresenham")} variant="raised">Bresenham</Button>
                        <Button onClick={() => this.setEstado("Circle")} variant="raised">Bresenham Circle</Button>
                    </div>
                </div>
                <canvas
                    // We use the ref attribute to get direct access to the canvas element.
                    ref={(ref) => (this.canvas = ref)}
                    style={{background: 'white', border: '5px solid black'}}
                    onMouseDown={this.onMouseDown}
                    onMouseLeave={this.endPaintEvent}
                    onMouseUp={this.endPaintEvent}
                    onMouseMove={this.onMouseMove}
                />
            </div>
        );
    }
}

export default Canvas;