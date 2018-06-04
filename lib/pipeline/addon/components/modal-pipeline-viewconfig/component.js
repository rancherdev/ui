import Component from '@ember/component';
import { next } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import {
  set, get, observer
} from '@ember/object';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal', 'alert'],

  branch:          null,
  branchesChoices: null,
  loading:         false,

  config: null,

  model: alias('modalService.modalOpts.originalModel'),

  branchDidChange: observer('branch', function() {

    const branch = get(this, 'branch');

    set(this, 'loading', true);
    set(this, 'unsynced', !!(get(this, 'model.unsyncBranches') || []).findBy('name', branch));
    get(this, 'model').followLink('yaml', { filter: { branch,  } })
      .then((config) => {

        set(this, 'config', config);

      })
      .finally(() => {

        set(this, 'loading', false);

      });

  }),
  init() {

    this._super(...arguments);

    set(this, 'loading', true);
    get(this, 'model').followLink('branches')
      .then((branches) => {

        if ( this.isDestroyed || this.isDestroying ) {

          return;

        }
        set(this, 'branchesChoices', JSON.parse(branches).map((b) => {

          return {
            label: b,
            value: b
          };

        })
          .sortBy('label'));
        if ( get(this, 'branchesChoices.length') ) {

          next(() => {

            set(this, 'branch', get(this, 'branchesChoices.firstObject.value'));

          });

        } else {

          set(this, 'loading', false);

        }

      });

  },

});
