import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { set, get } from '@ember/object';
import { later } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import layout from './template';

export default Component.extend({
  scope: service(),
  growl: service(),

  layout,

  confirmDisable: false,
  disabling:      false,

  cluster: alias('scope.currentCluster'),
  enabled: alias('cluster.enableClusterMonitoring'),
  isReady: alias('cluster.isMonitoringReady'),

  actions: {
    enable(cb) {
      const cluster = get(this, 'cluster');

      set(cluster, 'enableClusterMonitoring', true);

      cluster.save().catch((err) => {
        get(this, 'growl').fromError(err);
      }).finally(() => {
        cb();
      });
    },

    disable() {
      const cluster = get(this, 'cluster');

      set(cluster, 'enableClusterMonitoring', false);
      set(this, 'disabling', true);
      cluster.save().catch((err) => {
        get(this, 'growl').fromError(err);
      }).finally(() => {
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
