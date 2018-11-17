import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, computed } from '@ember/object';

export default Controller.extend({
  scope:  service(),

  monitoringEnabled: computed('scope.currentCluster.isMonitoringReady', function() {
    return get(this, 'scope.currentCluster.isMonitoringReady');
  }),

  displayEnvironmentVars: computed('model.environment', function() {
    var envs = [];
    var environment = this.get('model.environment') || {};

    Object.keys(environment).forEach((key) => {
      envs.pushObject({
        key,
        value: environment[key]
      })
    });

    return envs;
  }),

});
