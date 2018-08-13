import Component from '@ember/component';
import { set, get } from '@ember/object';
import { later } from '@ember/runloop';
import layout from './template';

export default Component.extend({
  layout,

  confirmDisable: false,
  disabling:      false,

  actions: {
    enable() {

    },

    disable() {
      const provider = get(this, 'provider');

      set(this, 'disabling', true);
      provider.doAction('disable').finally(() => {
        set(this, 'disabling', false);
      });
    },

    promptDisable() {
      set(this, 'confirmDisable', true);
      later(this, function() {
        set(this, 'confirmDisable', false);
      }, 10000);
    },
  }
});
