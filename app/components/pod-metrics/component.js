import Component from '@ember/component';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';
import Grafana from 'shared/mixins/grafana';

const fields = ['cpuFields', 'memoryFields', 'diskFields', 'networkPacketFields', 'networkFields', 'storageFields'];

export default Component.extend(Grafana, {
  intl:        service(),
  scope:       service(),
  globalStore: service(),

  layout,

  duration: null,

  cpuFields:           ['cpuUsage'],
  memoryFields:        ['memoryUsage'],
  diskFields:          ['diskUsage'],
  networkPacketFields: ['networkTranPacket', 'networkRevPacket', 'networkTranError', 'networkRevError', 'networkTranDrop',   'networkRevDrop'],

  networkFields:       ['networkRevTotal', 'networkTranTotal'],
  storageFields:       ['storageWrite', 'storageRead'],

  loading: false,
  stats:   null,

  actions: {
    query(options){
      const projectId = get(this, 'scope.currentProject.id');

      set(this, 'loading', true);

      get(this, 'globalStore').rawRequest({
        url:    `projects/${ projectId }/podstats/${ get(this, 'pod.id') }?${ options.query }`,
        method: 'GET',
      })
        .then((xhr) => {
          if (this.isDestroyed || this.isDestroying) {
            return;
          }

          set(this, 'stats', {});
          const data = JSON.parse(xhr.body);
          const series = data.series;

          series.forEach((serie) => {
            const name = get(serie, 'name');
            const points = get(serie, 'points');

            switch (name){
            case 'pod_cpu_usage_seconds_sum_rate':
              set(this, 'stats.cpuUsage', points);
              break;
            case 'pod_memory_usage_bytes_sum':
              set(this, 'stats.memoryUsage', points.map((p) => [p[0] / 1048576, p[1]]));
              break;
            case 'pod_fs_bytes_sum':
              set(this, 'stats.diskUsage', points.map((p) => [p[0] / 1048576, p[1]]));
              break;
            case 'pod_network_receive_bytes_sum_rate':
              set(this, 'stats.networkRevTotal', points.map((p) => [p[0] / 1024, p[1]]));
              break;
            case 'pod_network_receive_errors_sum_rate':
              set(this, 'stats.networkRevError', points);
              break;
            case 'pod_network_receive_packets_sum_rate':
              set(this, 'stats.networkRevPacket', points);
              break;
            case 'pod_network_receive_packets_dropped_sum_rate':
              set(this, 'stats.networkRevDrop', points);
              break;
            case 'pod_network_transmit_bytes_sum_rate':
              set(this, 'stats.networkTranTotal', points.map((p) => [p[0] / 1024, p[1]]));
              break;
            case 'pod_network_transmit_errors_sum_rate':
              set(this, 'stats.networkTranError', points);
              break;
            case 'pod_network_transmit_packets_sum_rate':
              set(this, 'stats.networkTranPacket', points);
              break;
            case 'pod_network_transmit_packets_dropped_sum_rate':
              set(this, 'stats.networkTranDrop', points);
              break;
            case 'pod_disk_io_reads_bytes_sum_rate':
              set(this, 'stats.storageRead', points.map((p) => [p[0] / 1024, p[1]]));
              break;
            case 'pod_disk_io_writes_bytes_sum_rate':
              set(this, 'stats.storageWrite', points.map((p) => [p[0] / 1024, p[1]]));
              break;
            }
          })
        }).finally(() => {
          if (this.isDestroyed || this.isDestroying) {
            return;
          }

          fields.forEach((field) => {
            const list = get(this, field);

            list.forEach((d) => {
              const data = get(this, `stats.${ d }`) || [];

              if ( get(data, 'length') === 0 ) {
                set(this, `stats.${ d }`, []);
              }
            });
          });

          set(this, 'stats.needRefresh', true);
          set(this, 'loading', false);
          options.cb();
        });
    }
  }
});
