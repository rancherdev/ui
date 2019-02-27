import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  scope:             service(),

  queryParams:       ['sortBy'],
  sortBy:            'name',

  headers: [
    {
      name:           'state',
      sort:           ['sortState', 'displayName'],
      searchField:    'displayState',
      translationKey: 'generic.state',
      width:          120,
    },
    {
      name:           'name',
      sort:           ['sortName', 'id'],
      searchField:    'displayName',
      translationKey: 'generic.name',
      width:          200,
    },
  ],
});
