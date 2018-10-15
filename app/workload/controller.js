import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  scope:       service(),

  queryParams: ['duration'],
  duration:    'hour',

  launchConfig: null,

  service: alias('model.workload'),

  monitoringEnabled: computed('scope.currentCluster.isMonitoringReady', function() {
    return get(this, 'scope.currentCluster.isMonitoringReady');
  }),

  displayEnvironmentVars: computed('service.launchConfig.environment', function() {
    var envs = [];
    var environment = get(this, 'service.launchConfig.environment') || {};

    Object.keys(environment).forEach((key) => {
      envs.pushObject({
        key,
        value: environment[key]
      })
    });

    return envs;
  }),

});
