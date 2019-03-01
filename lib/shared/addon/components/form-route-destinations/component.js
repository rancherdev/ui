import { get, set, observer, computed } from '@ember/object'
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend({
  intl: service(),

  layout,

  editing:   true,

  destinationArray: [],

  actions: {
    addDestination() {
      get(this, 'destinationArray').pushObject({});
    },

    removeDestination(destination) {
      get(this, 'destinationArray').removeObject(destination);
    },
  },

  didInsertElement() {
    if (get(this, 'editing') && get(this, 'destinationArray.length') === 0) {
      this.send('addDestination');
    }
  },
});
