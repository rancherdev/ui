import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import ChildHook from 'shared/mixins/child-hook';


export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,

  mode:         null,
  initServices: null,
  namespace:    alias('model.namespace'),

  init() {
    this._super(...arguments);

    set(this, 'initServices', ['']);
  },

  actions: {
    setHosts() {

    }
  },
});
