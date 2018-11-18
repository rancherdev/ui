import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';

export default Component.extend({
  settings: service(),

  layout,

  graphs:      null,
  loading:     null,
  noGraphs:    null,
  noDataLabel: 'generic.noData',

  rows: computed('graphs', function() {
    let out = [];

    (get(this, 'graphs') || []).forEach((graph, index) => {
      if (index % 3 === 0) {
        out.pushObject([graph]);
      } else {
        get(out, 'lastObject').pushObject(graph);
      }
    });

    return out;
  }),
});
