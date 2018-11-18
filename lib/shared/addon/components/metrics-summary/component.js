import { on } from '@ember/object/evented';
import Component from '@ember/component';
import layout from './template'
import { inject as service } from '@ember/service'
import { get, set, observer } from '@ember/object'
import { run } from '@ember/runloop';

export default Component.extend({
  scope:       service(),
  globalStore: service(),

  layout,
  classNames:   ['metrics-summary'],

  title:        null,

  intent:       null,
  expanded:     false,
  everExpanded: false,

  init() {
    this._super(...arguments);
    this.setGrafanaUrl();
  },

  actions: {
    doExpand() {
      set(this, 'expanded', !get(this, 'expanded'));
    },
  },

  setGrafanaUrl: observer('dashboards', function() {
    let dashboardName = get(this, 'resourceType') === 'workload' ? (get(this, 'workloadType') || '').capitalize() : get(this, 'dashboardName');

    const dashboard = (get(this, 'dashboards') || []).findBy('title', dashboardName);

    if (!dashboard) {
      return;
    }

    const found = get(this, 'globalStore').all('project').findBy('isSystemProject', true);

    let grafanaUrl;

    if ( found ) {
      grafanaUrl = `${ get(this, 'scope.currentCluster.monitoringStatus.grafanaEndpoint') }${ dashboard.url }`;
    } else {
      grafanaUrl = `${ get(this, 'scope.currentProject.monitoringStatus.grafanaEndpoint') }${ dashboard.url }`;
    }

    switch (get(this, 'resourceType')) {
    case 'node':
      grafanaUrl += `?var-node=${ get(this, 'resourceId') }&var-port=9100`;
      break;
    case 'workload':
      grafanaUrl += this.getWorkloadGrafanaUrl();
      break;
    case 'pod':
      grafanaUrl += `?var-namespace=${ get(this, 'namespaceId') }&var-pod=${ get(this, 'resourceId') }&var-container=All`;
      break;
    case 'container':
      grafanaUrl += `?var-namespace=${ get(this, 'namespaceId') }&var-pod=${ get(this, 'podName') }&var-container=${ get(this, 'resourceId') }`;
      break;
    }

    set(this, 'grafanaUrl', grafanaUrl);
  }),

  expdObserver: on('init', observer('expanded', function() {
    if (get(this, 'expanded') && !get(this, 'intent')) {
      if (!get(this, 'everExpanded')) {
        set(this, 'everExpanded', true);
      }

      run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        set(this, 'intent', get(this, 'componentName'));
      });
    }
  })),

  getWorkloadGrafanaUrl() {
    const workloadType = get(this, 'workloadType');

    switch (workloadType) {
    case 'deployment':
      return `?var-deployment_namespace=${ get(this, 'namespace') }&var-deployment_name=${ get(this, 'resourceId') }`;
    case 'daemonSet':
      return `?var-daemonset_namespace=${ get(this, 'namespace') }&var-daemonset_name=${ get(this, 'resourceId') }`;
    case 'statefulSet':
      return `?var-statefulset_namespace=${ get(this, 'namespace') }&var-statefulset_name=${ get(this, 'resourceId') }`;
    }
  },
});
