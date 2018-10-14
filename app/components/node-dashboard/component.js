import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import layout from './template';

export default Component.extend({
  router: service(),
  scope:  service(),
  layout,
  model:  null,

  monitoringEnalbed: alias('scope.currentCluster.enableClusterMonitoring'),

  actions: {
    enalbeMonitoring() {
      get(this, 'router').transitionTo('authenticated.cluster.monitoring');
    }
  }
});
