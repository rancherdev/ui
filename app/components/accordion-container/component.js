import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';

export default Component.extend({
  layout,
  model:         null,
  initExpandAll: true,
  sortBy:        'displayState',
  descending:    true,
  initExpand:    true,
  headers:       [
    {
      name:           'displayState',
      sort:           ['displayState'],
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'name',
      sort:           ['name'],
      translationKey: 'generic.name',
    },
    {
      name:           'displayImage',
      sort:           ['displayImage'],
      translationKey: 'generic.image',
    },
  ],

  expandAllObserve: function() {
    let expandAll = this.get('expandAll');

    this.set('initExpandAll', expandAll);
  }.observes('expandAll')
});
