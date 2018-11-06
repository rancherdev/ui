import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  color:  '',
  min:    0,
  value:  0,
  max:    100,
  zIndex: null,

  didInsertElement() {
    this.updateValue();
    setInterval(() => this.updateValue(), 5000);
  },

  updateValue() {
    set(this, 'cpu', this.formatValue(0.02 + Math.random()));
    set(this, 'memory', this.formatValue(200 + Math.random() * 21));
  },

  formatValue(value) {
    if ( value < 1 ) {
      return Math.round(value * 100) / 100;
    } else if ( value < 10 ) {
      return Math.round(value * 10) / 10;
    } else {
      return Math.round(value);
    }
  },

});
