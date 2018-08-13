import Component from '@ember/component';
import { set } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  model:            null,

  monitoringEnalbed: false,

  labelHeaders:     [
    {
      name:           'key',
      sort:           ['key'],
      translationKey: 'labelsSection.key',
      width:          '350',
    },
    {
      name:           'value',
      sort:           ['value', 'key'],
      translationKey: 'labelsSection.value',
    },
  ],

  actions: {
    enalbeMonitoring() {
      set(this, 'monitoringEnalbed', true);
    }
  }
});
