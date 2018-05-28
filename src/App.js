// App.js

import React, {Component} from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import Canvas from './components/Canvas';

import { SketchPicker } from 'react-color';
class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selecionado: 'Livre',
            colorSelect: 'black',
        };
        this.setEstado = this.setEstado.bind(this);
    }

    setEstado = (isso) => {
        this.setState({selecionado: isso});
    };

    SelectColor(select) {
        console.log(select.hex);
        if(!!select)
            this.setState({colorSelect: select.hex});

        console.log(this.state.colorSelect)
    }

    render() {
        return (
            <div>
                <h3 style={{textAlign: 'center'}}>Paint</h3>
                <div className="main" style={{display: 'flex', flexFlow: 'column', alignItems: 'center'}}>
                    <h5>Funções</h5>
                    <div className="color-guide" style={{display: 'flex', justifyContent: 'space-around'}}>
                        <Button onClick={() => this.setEstado("Livre")} variant="raised" color='#0D47A'>Livre</Button>
                        <Button onClick={() => this.setEstado("DDA")} variant="raised">DDA</Button>
                        <Button onClick={() => this.setEstado("Bresenham")} variant="raised">Bresenham</Button>
                        <Button onClick={() => this.setEstado("Circle")} variant="raised">Bresenham Circle</Button>
                    </div>
                    <Canvas
                        tipo={this.state.selecionado}
                        color={this.state.colorSelect}

                    />
                    <SketchPicker
                        color={this.state.colorSelect}
                        onChangeComplete={ this.SelectColor.bind(this) }
                    />;
                </div>
            </div>
        );
    }
}

export default App;