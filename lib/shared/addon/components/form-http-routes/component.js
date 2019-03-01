import EmberObject from '@ember/object';
import { get, set, observer } from '@ember/object'
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,

  rules:   [],
  editing: null,

  actions: {
    addRule() {
      const rule = EmberObject.create({});

      get(this, 'rules').pushObject(rule);
    },

    removeRule(rule) {
      get(this, 'rules').removeObject(rule);
    },
  },

  didInsertElement() {
    if (get(this, 'rules.length') === 0) {
      this.send('addRule');
    }
  },

});
