import Component from '@ember/component';
import { get, set } from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';

const TABS = ['cluster', 'etcd', 'k8s', 'rancher'];

export default Component.extend({
  scope:    service(),
  settings: service(),

  layout,
  classNames: 'row',

  mode: 'cluster',
  tabs: null,

  init() {
    this._super(...arguments);

    set(this, 'tabs', TABS.filter((tab) => get(this, 'scope.currentCluster.isRKE') || tab !== 'etcd'));
  },

  actions: {
    switchTab(mode)  {
      set(this, 'mode', mode);
    }
  }
});
