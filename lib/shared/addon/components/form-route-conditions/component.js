import { get, set, observer, computed } from '@ember/object'
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend({
  intl: service(),

  layout,

  editing:   true,

  destinationArray: [],

  conditions: [
    {
      label: 'Exact Match',
      value:  'exact'
    },
    {
      label: 'Prefix Match',
      value:  'prefix'
    },
    {
      label: 'Regex Match',
      value:  'regex'
    }
  ],

  types: [
    {
      label: 'URI',
      value:  'uri'
    },
    {
      label: 'Scheme',
      value:  'scheme'
    },
    {
      label: 'Method',
      value:  'method'
    },
    {
      label: 'Authority',
      value:  'authority'
    },
    {
      label: 'Header',
      value:  'headers'
    },
    {
      label: 'Port',
      value:  'port'
    },
    {
      label: 'Source Label',
      value:  'sourceLabels'
    },
    {
      label: 'Gateway',
      value:  'gateways'
    },
  ],

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
