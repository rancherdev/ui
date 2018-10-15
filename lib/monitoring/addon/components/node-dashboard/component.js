import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Grafana from 'shared/mixins/grafana';
import layout from './template';

export default Component.extend(Grafana, {
  router: service(),
  scope:  service(),
  layout,
  model:  null,

  monitoringEnabled: alias('scope.currentCluster.enableClusterMonitoring'),

  actions: {
    enalbeMonitoring() {
      get(this, 'router').transitionTo('authenticated.cluster.monitoring.cluster-setting');
    }
  }
});
