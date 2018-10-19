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

  etcdGrpcFields:                 ['etcdNetworkRevTotal', 'etcdNetworkTranTotal'],
  etcdDbSizeFields:               ['etcdDbSize'],
  apiServerRequestsCountFields:   ['apiServerRequestsCount'],
  apiServerRequestsLatencyFields: ['apiServerRequestsLatency'],

  loading: false,
  lines:   [],
  stats:   {},

  actions: {
    query(options){
      const clusterId = get(this, 'scope.currentCluster.id');

      set(this, 'loading', true);

      get(this, 'globalStore').rawRequest({
        url:    `clusters/${ clusterId }/componentstats?${ options.query }`,
        method: 'GET',
      })
        .then((xhr) => {
          if (this.isDestroyed || this.isDestroying) {
            return;
          }

          const data = JSON.parse(xhr.body);

          get(this, 'lines').clear();
          data.forEach((component) => {
            const series = get(component, 'series');
            const componentId = get(component, 'id');

            this.updateData(series, componentId);
          });
        }).finally(() => {
          if (this.isDestroyed || this.isDestroying) {
            return;
          }

          set(this, 'stats.needRefresh', true);
          set(this, 'loading', false);
          options.cb();
        });
    }
  },

  updateData(series, componentId) {
    const index = componentId.indexOf(':');
    const nodeId = componentId.slice(index + 1);
    const found = get(this, 'nodes').findBy('id', nodeId);


    const line = {
      id:   `${ componentId.substr(0, index) } ${ get(found, 'displayName') }`,
      data: {},
    };

    get(this, 'lines').push(line);
    series.forEach((serie) => {
      const name = get(serie, 'name');
      const points = get(serie, 'points');

      switch (name){
      case 'etcd_grpc_client_receive_bytes_sum_rate':
        set(line, 'data.etcdNetworkRevTotal', points.map((p) => [p[0] / 1024, p[1]]));
        break;
      case 'etcd_grpc_client_transmit_bytes_sum_rate':
        set(line, 'data.etcdNetworkTranTotal', points.map((p) => [p[0] / 1024, p[1]]));
        break;
      case 'etcd_db_bytes_sum':
        set(line, 'data.etcdDbSize', points.map((p) => [p[0] / (1024 * 1024), p[1]]));
        break;
      case 'apiserver_request_count_sum_rate':
        set(line, 'data.apiServerRequestsCount', points);
        break;
      case 'apiserver_request_latency_milliseconds_avg':
        set(line, 'data.apiServerRequestsLatency', points.map((p) => [p[0] / 1000000, p[1]]));
        break;
      }
    })
  }
});
