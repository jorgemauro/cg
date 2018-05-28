import React, { Component } from 'react';
import ReactPaint from 'react-paint';

class TelaPaint extends Component {
  render() {
    const props = {
      style: {
        background: 'tomato',
        /* Arbitrary css styles */
      },
      brushCol: '#ffffff',
      lineWidth: 10,
      className: 'react-paint',
      height: 200,
      width: 200,
      onDraw: () => { console.log('i have drawn!'); },
    };
    return (
        <div>
            <ReactPaint {...props} />
        </div>
    );
  }
}

export default TelaPaint;
