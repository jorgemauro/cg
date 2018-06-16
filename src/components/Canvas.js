// canvas.js

import React, {Component} from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

class Canvas extends Component {
    state = {
        xtra: '',
        ytra: '',
        rtra: '',
        stra: '',
        pixelFull: 1,
    };

    constructor(props) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.endPaintEvent = this.endPaintEvent.bind(this);
    }

    isPainting = false;
    line = [];
    sequence = [];
    history = [];
    atual = [];
    stateVar = [];
    initialstate = [];
    prevPos = {offsetX: 0, offsetY: 0};

    pixel(x, y, color) {
        x = Math.round(x);
        y = Math.round(y);
        this.ctx.fillStyle = color;
        this.stateVar.push({x: x, y: y, color: this.props.color});
        this.ctx.fillRect(x, y, this.state.pixelFull, this.state.pixelFull);
    }

    pixelClear(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        this.ctx.clearRect(x, y, this.state.pixelFull, this.state.pixelFull);
    }

    onMouseDown({nativeEvent}) {
        const {offsetX, offsetY} = nativeEvent;
        this.isPainting = true;
        this.ctx.save();
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

    pegaSequencia() {
        const h = this.history.slice();
        return new Promise((resolve, reject) => {
            let t = this.sequence.length;
            console.log('h', h);
            this.sequence.push(h);
            this.sequence.forEach((item) => {
                item = item.slice();
                item.forEach((objeto) => {
                    objeto = Object.assign({}, objeto);
                });
            });
            if (t < this.sequence.length)
                resolve(true);
            else
                resolve(false);
        });
    }

    endPaintEvent() {
        if (this.isPainting) {
            this.isPainting = false;
            this.stateVar = [];
            this.pegaSequencia().then((resp) => {
                this.history.push(this.atual);
            });

            const {x2, y2} = this.atual.curr;
            let {x1, y1} = this.atual.prev;
            const dist = Math.round(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - x2) * (y1 - x2)));
            if (this.props.tipo === 'DDA') {
                this.ctx.fillText(
                    "( " + x1.toFixed(2) + ", " + y1.toFixed(2) + " ) → ( "
                    + x2.toFixed(2) + ", " + y2.toFixed(2) + " )",
                    x1 - 50, y1 + 50);
                this.ctx.font = '12pt Calibri bold';
                this.ctx.fillText("DDA", 10, 30);
            } else if (this.props.tipo === 'Bresenham') {
                this.ctx.fillText(
                    "( " + x1.toFixed(2) + ", " + y1.toFixed(2) + " ) → ( "
                    + x2.toFixed(2) + ", " + y2.toFixed(2) + " )",
                    x1 - 50, y1 + 50);

                this.ctx.font = '12pt Calibri bold';
                this.ctx.fillText("Bresenham", 10, 30);
            } else if (this.props.tipo === 'Circle') {
                this.ctx.fillText("( " + x1.toFixed(2) + ", " + y1.toFixed(2) + " ) - radius: "
                    + dist.toFixed(2),
                    x1 - 50, y1 + dist + 50);
                this.ctx.font = '12pt Calibri bold';
                this.ctx.fillText("Bresenham Circle", 10, 30);
            }
        }
    }

    clear() {
        this.sequence.push(this.history.slice());
        this.sequence = [];
        this.history = [];
        this.ctx.clearRect(0, 0, 500, 500);
    }

    undo() {
        this.ctx.clearRect(0, 0, 500, 500);
        if (this.sequence.length > 0) {
            this.history = this.sequence[this.sequence.length - 1];
            this.sequence.pop();
            this.repaint();
        }
    }

    refresh() {
        this.stateVar.forEach((item) => {
            if (this.initialstate.length === 0 || this.initialstate.find((item2) => {
                    return item2.x !== item.x && item2.y !== item.y && item2.color !== item.color;
                })) {
                this.pixelClear(item.x, item.y);
            }
        });
        this.ctx.fillStyle = this.props.color;
        // this.ctx.clearRect(0, 0, 500, 500);
    }

    paint(prevPos, currPos) {
        const {offsetX, offsetY} = currPos;
        let {offsetX: x, offsetY: y} = prevPos;
        this.atual = {
            prev: {x1: x, y1: y},
            curr: {x2: offsetX, y2: offsetY},
            tipo: this.props.tipo,
            color: this.props.color
        };
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
            this.dda(x, y, offsetX, offsetY, this.props.color);
        } else if (this.props.tipo === 'Bresenham') {
            this.refresh();
            this.bresenham(x, y, offsetX, offsetY, this.props.color);
        } else if (this.props.tipo === 'Circle') {
            this.refresh();
            const dist = Math.round(Math.sqrt((x - offsetX) * (x - offsetX) + (y - offsetY) * (y - offsetY)));
            this.Circle(x, y, dist, this.props.color);
        }
    }

    bresenham(x1, y1, x2, y2, color) {
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

        this.pixel(x, y, color);

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

    dda(x1, y1, x2, y2, color) {
        let x = x1;
        let y = y1;

        let dx = x2 - x1;
        let dy = y2 - y1;

        let passos;

        if (Math.abs(dx) > Math.abs(dy)) passos = Math.abs(dx);
        else passos = Math.abs(dy);

        let xincr = dx / passos;
        let yincr = dy / passos;

        this.pixel(Math.round(x), Math.round(y), color);

        for (let i = 0; i <= passos; i++) {
            x += xincr;
            y += yincr;

            this.pixel(Math.round(x), Math.round(y), color);
        }
    }

    Circle(xc, yc, r, color) {
        let x = 0;
        let y = r;
        let p = 3 - 2 * r;

        this.pixel(xc + x, yc + y, color);
        this.pixel(xc - x, yc + y, color);
        this.pixel(xc + x, yc - y, color);
        this.pixel(xc - x, yc - y, color);
        this.pixel(xc + y, yc + x, color);
        this.pixel(xc - y, yc + x, color);
        this.pixel(xc + y, yc - x, color);
        this.pixel(xc - y, yc - x, color);

        while (x < y) {
            if (p < 0) p += 4 * x + 6;
            else {
                p += 4 * (x - y) + 10;
                y--;
            }
            x++;

            this.pixel(xc + x, yc + y, color);
            this.pixel(xc - x, yc + y, color);
            this.pixel(xc + x, yc - y, color);
            this.pixel(xc - x, yc - y, color);
            this.pixel(xc + y, yc + x, color);
            this.pixel(xc - y, yc + x, color);
            this.pixel(xc + y, yc - x, color);
            this.pixel(xc - y, yc - x, color);
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

    repaint() {

        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].tipo === 'DDA') {
                this.dda(this.history[i].prev.x1, this.history[i].prev.y1, this.history[i].curr.x2, this.history[i].curr.y2, this.history[i].color);
            } else if (this.history[i].tipo === 'Bresenham') {
                this.bresenham(this.history[i].prev.x1, this.history[i].prev.y1, this.history[i].curr.x2, this.history[i].curr.y2, this.history[i].color);
            } else if (this.history[i].tipo === 'Circle') {
                const dist = Math.round(Math.sqrt((this.history[i].prev.x1 - this.history[i].curr.x2) * (this.history[i].prev.x1 - this.history[i].curr.x2) + (this.history[i].prev.y1 - this.history[i].curr.y2) * (this.history[i].prev.y1 - this.history[i].curr.y2)));
                this.Circle(this.history[i].prev.x1, this.history[i].prev.y1, dist, this.history[i].color);
            }
        }
    }

    translate(x, y) {
        if (x && y) {
            console.log(this.sequence);
            this.pegaSequencia().then((resp) => {
                if (resp) {
                    this.history.forEach((item, index) => {
                        item.prev.x1 = parseInt(item.prev.x1, 10) + parseInt(x, 10);
                        item.prev.y1 = parseInt(item.prev.y1, 10) + parseInt(y, 10);
                        item.curr.x2 = parseInt(item.curr.x2, 10) + parseInt(x, 10);
                        item.curr.y2 = parseInt(item.curr.y2, 10) + parseInt(y, 10);
                    });
                }
                console.log('history', this.history);
                this.ctx.clearRect(0, 0, 500, 500);
                this.repaint();
            });
        }
    }

    rotate(angle) {
        let mul = parseInt(angle, 10);
        let angleRad = (Math.PI / 180) * mul;
        console.log(angleRad);
        if (angleRad) {
            this.pegaSequencia().then((resp) => {
                this.history.forEach((item) => {
                    let cx1, cy1;
                    if (item.tipo !== 'Circle') {
                        cx1 = (item.prev.x1 + item.curr.x2) / 2;
                        cy1 = (item.prev.y1 + item.curr.y2) / 2;
                        item.curr.x2 = Math.cos(angleRad) * (item.curr.x2 - cx1) + Math.sin(angleRad) * (item.curr.y2 - cy1) + cx1;
                        item.curr.y2 = -Math.sin(angleRad) * (item.curr.x2 - cx1) + Math.cos(angleRad) * (item.curr.y2 - cy1) + cy1;
                        item.prev.x1 = Math.cos(angleRad) * (item.prev.x1 - cx1) + Math.sin(angleRad) * (item.prev.y1 - cy1) + cx1;
                        item.prev.y1 = -Math.sin(angleRad) * (item.prev.x1 - cx1) + Math.cos(angleRad) * (item.prev.y1 - cy1) + cy1;
                    }
                });
                this.ctx.clearRect(0, 0, 500, 500);
                this.repaint();
            });
        }
    }

    scale(scal) {
        if (scal) {
            this.pegaSequencia().then((resp) => {
                this.history.forEach((item) => {
                    let cx1, cy1;
                    cx1 = (item.prev.x1 + item.curr.x2) / 2;
                    cy1 = (item.prev.y1 + item.curr.y2) / 2;
                    item.prev.y1 -= cy1;
                    item.prev.y1 *= parseInt(scal, 10);
                    item.prev.y1 += cy1;
                    item.curr.y2 -= cy1;
                    item.curr.y2 *= parseInt(scal, 10);
                    item.curr.y2 += cy1;
                    item.prev.x1 -= cx1;
                    item.prev.x1 *= parseInt(scal, 10);
                    item.prev.x1 += cx1;
                    item.curr.x2 -= cx1;
                    item.curr.x2 *= parseInt(scal, 10);
                    item.curr.x2 += cx1;
                });
                this.ctx.clearRect(0, 0, 500, 500);
                this.repaint();
            });
        }
    }

    reflect(y, x) {
        this.pegaSequencia().then((resp) => {
            this.history.forEach((item) => {
                let cx1, cy1;
                cx1 = (500) / 2;
                cy1 = (500) / 2;
                if (x) {
                    item.prev.y1 -= cy1;
                    item.prev.y1 *= -1;
                    item.prev.y1 += cy1;
                    item.curr.y2 -= cy1;
                    item.curr.y2 *= -1;
                    item.curr.y2 += cy1;
                }
                if (y) {
                    item.prev.x1 -= cx1;
                    item.prev.x1 *= -1;
                    item.prev.x1 += cx1;
                    item.curr.x2 -= cx1;
                    item.curr.x2 *= -1;
                    item.curr.x2 += cx1;

                }
            });
            this.ctx.clearRect(0, 0, 500, 500);
            this.repaint();
        });

    }

    getX = () => event => {
        this.setState({
            xtra: event.target.value,
        });
    };
    getY = () => event => {
        this.setState({
            ytra: event.target.value,
        });
    };
    getR = () => event => {
        this.setState({
            rtra: event.target.value,
        });
    };
    getS = () => event => {
        this.setState({
            stra: event.target.value,
        });
    };
    getTamanho = () => event => {
        let px = parseInt(event.target.value, 10);

        this.setState({
            pixelFull: px,
        });
    };

    render() {
        return (
            <div style={{display: 'flex'}}>
                <div style={{display: 'flex', width: '30%', justifyContent: 'center', marginRight: '10px'}}>
                    <div className="color-guide" style={{width: '100%', display: 'flex', flexFlow: 'column'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <div style={{width: '70%', display: 'flex'}}>
                                <TextField
                                    id="x"
                                    label="X"
                                    type="number"
                                    margin="normal"
                                    value={this.state.xtra}
                                    onChange={this.getX()}
                                />
                                <TextField
                                    id="Y"
                                    label="Y"
                                    type="number"
                                    margin="normal"
                                    value={this.state.ytra}
                                    onChange={this.getY()}
                                />
                            </div>
                            <Button style={{width: '30%', backgroundColor: '#0D47A !important'}}
                                    onClick={() => this.translate(this.state.xtra, this.state.ytra)} variant="raised"
                            >Translação</Button>
                        </div>
                        <div style={{display: 'flex'}}>

                            <TextField
                                id="R"
                                label="R"
                                type="number"
                                margin="normal"
                                value={this.state.rtra}
                                onChange={this.getR()}
                            />
                            <Button onClick={() => this.rotate(this.state.rtra)} variant="raised">Rotaciona</Button>
                        </div>
                        <div style={{display: 'flex'}}>

                            <TextField
                                id="S"
                                label="S"
                                type="number"
                                margin="normal"
                                value={this.state.stra}
                                onChange={this.getS()}
                            />
                            <Button onClick={() => this.scale(this.state.stra)} variant="raised">Escala</Button>
                        </div>

                        <div style={{display: 'flex'}}>

                            <TextField
                                id="T"
                                label="Traço(em pixel)"
                                type="number"
                                margin="normal"
                                value={this.state.pixelFull}
                                onChange={this.getTamanho()}
                            />
                        </div>
                        <Button onClick={() => this.reflect(true, false)} variant="raised">Reflexão no eixo Y</Button>
                        <Button onClick={() => this.reflect(false, true)} variant="raised">reflexão no eixo x</Button>
                        <Button onClick={() => this.reflect(true, true)} variant="raised">reflexão em ambos</Button>
                        <Button onClick={() => this.clear()} variant="raised">Limpar</Button>
                        <Button onClick={() => this.undo()} variant="raised">Desfazer</Button>
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