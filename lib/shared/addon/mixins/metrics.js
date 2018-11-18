import Mixin from '@ember/object/mixin';
import { get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { all, resolve } from 'rsvp';

const SINGLE_METRICS = ['etcd-leader-change', 'etcd-server-leader-sum', 'etcd-server-failed-proposal', 'ingresscontroller-upstream-response-seconds'];

export default Mixin.create({
  globalStore: service(),
  scope:       service(),
  growl:       service(),

  filters:       null,
  graphs:        null,
  state:         null,
  projectScope:  false,
  projectGraphs: null,
  clusterGraphs: null,
  metricParams:  null,

  init() {
    this._super(...arguments);

    set(this, 'state', {
      loading:  false,
      detail:   false,
      noGraphs: false,
      from:     null,
      to:       null,
      interval: null,
    })
  },

  updateData(out) {
    const single = [];
    const graphs = [];

    out.sortBy('graph.priority').forEach((item) => {
      if ( SINGLE_METRICS.indexOf(get(item, 'graph.title')) > -1 ) {
        single.push(item);
      } else {
        graphs.push(item);
      }
    })

    setProperties(this, {
      'state.noGraphs': get(graphs, 'length') === 0,
      graphs,
      single
    });
  },

  actions: {
    query(){
      const gs = get(this, 'globalStore');

      set(this, 'state.loading', true);

      let metricParams = {};

      if ( get(this, 'resourceId') ) {
        if ( get(this, 'metricParams') ) {
          metricParams = get(this, 'metricParams');
        } else {
          set(metricParams, 'instance', get(this, 'resourceId'));
        }
      }

      let url;

      if ( get(this, 'projectScope') ) {
        url = '/v3/projectmonitorgraphs?action=query';
      } else {
        url = '/v3/clustermonitorgraphs?action=query';
      }

      const filters = get(this, 'filters') || {};

      const cluster = get(this, 'scope.currentCluster.id');
      const project = get(this, 'scope.currentProject.id');

      let graphsPromise

      if ( project ) {
        set(filters, 'projectId', project);
      } else if (cluster) {
        set(filters, 'clusterId', cluster);
      }

      if ( get(this, 'projectScope') && get(this, 'projectGraphs') ) {
        graphsPromise = resolve(get(this, 'projectGraphs'));
      } else if ( !get(this, 'projectScope') && get(this, 'clusterGraphs') ) {
        graphsPromise = resolve(get(this, 'clusterGraphs'));
      } else {
        graphsPromise = gs.rawRequest({
          url,
          method: 'GET'
        });
      }

      const metricsPromise = gs.rawRequest({
        url,
        method: 'POST',
        data:   {
          filters,
          metricParams,
          interval:  get(this, 'state.interval'),
          isDetails: get(this, 'state.detail'),
          from:      get(this, 'state.from'),
          to:        get(this, 'state.to'),
        }
      });

      const promises = [metricsPromise, graphsPromise];

      all(promises).then((res) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        const [metrics, graphs] = res;

        if ( get(this, 'projectScope') ) {
          set(this, 'projectGraphs', graphs);
        } else {
          set(this, 'clusterGraphs', graphs);
        }

        const metricsBody = get(JSON.parse(get(metrics, 'body')) || {}, 'data') || [];
        const graphsBody = get(graphs, 'body.data') || [];

        const out = metricsBody.map((metric) => {
          const graph = graphsBody.findBy('id', get(metric, 'graphID'));

          if ( graph ) {
            set(graph, 'title', `${ get(graph, 'id').split(':')[1] }`)
          }

          return {
            graph,
            series: get(metric, 'series') || []
          }
        })

        this.updateData(out);
      }).catch((err) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        setProperties(this, {
          'state.noGraphs': true,
          graphs:           [],
          single:           []
        });
        get(this, 'growl').fromError(get(err, 'body.message') || get(err, 'message') || err);
      }).finally(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        set(this, 'state.loading', false);
      });
    }
  }
});
