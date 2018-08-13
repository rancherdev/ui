import Component from '@ember/component';
import { set } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  model:            null,

  monitoringEnalbed: false,

  actions: {
    enalbeMonitoring() {
      set(this, 'monitoringEnalbed', true);
    }
  }
});
