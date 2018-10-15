import Component from '@ember/component';
import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';
import { next } from '@ember/runloop';

export default Component.extend({
  intl:        service(),
  globalStore: service(),
  scope:       service(),

  layout,

  resourceType:  'cluster',
  duration:      null,
  dashboardName: null,

  refreshing:    false,
  grafanaUrl: null,

  init() {
    this._super(...arguments);
    this.setGrafanaUrl();
    next(() => {
      this.query();
    });
  },

  actions: {
    refresh() {
      this.query();
    }
  },

  durationDidChange: observer('duration', function() {
    this.query();
  }),

  setGrafanaUrl: observer('dashboards', function() {
    let dashboardName = get(this, 'resourceType') === 'workload' ? (get(this, 'workloadType') || '').capitalize() : get(this, 'dashboardName');

    const dashboard = (get(this, 'dashboards') || []).findBy('title', dashboardName);

    if (!dashboard) {
      return;
    }

    let grafanaUrl = dashboard.url;

    switch (get(this, 'resourceType')) {
    case 'node':
      grafanaUrl += `?var-node=${ get(this, 'id') }&var-port=9100`;
      break;
    case 'workload':
      grafanaUrl += this.getWorkloadGrafanaUrl();
      break;
    case 'pod':
      grafanaUrl += `?var-namespace=${ get(this, 'namespaceId') }&var-pod=${ get(this, 'id') }&var-container=All`;
      break;
    }

    set(this, 'grafanaUrl', grafanaUrl);
  }),

  getWorkloadGrafanaUrl() {
    const workloadType = get(this, 'workloadType');

    switch (workloadType) {
    case 'deployment':
      return `?var-deployment_namespace=${ get(this, 'namespace') }&var-deployment_name=${ get(this, 'id') }`;
    case 'daemonSet':
      return `?var-daemonset_namespace=${ get(this, 'namespace') }&var-daemonset_name=${ get(this, 'id') }`;
    case 'statefulSet':
      return `?var-statefulset_namespace=${ get(this, 'namespace') }&var-statefulset_name=${ get(this, 'id') }`;
    }
  },

  query() {
    set(this, 'refreshing', true);
    let query;

    switch ( get(this, 'duration') ) {
    case 'min':
      query = 'from=now-5m&end=now&interval=5s';
      break;
    case 'hour':
      query = 'from=now-1h&end=now&interval=60s';
      break;
    case 'day':
      query = 'from=now-24h&end=now&interval=1440s';
      break;
    case 'week':
      query = 'from=now-168h&end=now&interval=10080s';
      break;
    }

    this.sendAction('queryAction', {
      cb: () => {
        set(this, 'refreshing', false);
      },
      query,
    });
  },

});
