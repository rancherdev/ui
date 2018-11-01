import Component from '@ember/component';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  intl:        service(),
  scope:       service(),
  globalStore: service(),

  layout,

  duration: null,
  lines:    [],

  cpuFields:           ['cpuUsage'],
  memoryFields:        ['memoryUsage'],
  memoryPageFields:    ['memoryPageIn', 'memoryPageOut'],
  diskFields:          ['diskUsage'],
  networkPacketFields: ['networkTranPacket', 'networkRevPacket', 'networkTranError', 'networkRevError', 'networkTranDrop',   'networkRevDrop'],
  storageFields:       ['storageWrite', 'storageRead'],
  networkFields:       ['networkRevTotal', 'networkTranTotal'],
  loadFields:          ['load5'],

  loading: false,
  stats:   null,

  actions: {},


});
