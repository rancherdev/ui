import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { set, get } from '@ember/object';
import { next } from '@ember/runloop';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['medium-modal', 'alert'],

  mode:            'branch',
  branch:          null,
  errors:          [],
  editing: false,

  model:           alias('modalService.modalOpts.originalModel'),
  branchesChoices: alias('model.unsyncBranches'),

  init() {

    this._super(...arguments);

    next(() => {

      set(this, 'branch', get(this, 'branchesChoices.firstObject.name'));

    });

  },

  actions: {
    save(cb) {

      const param = {}
      const branch = get(this, 'branch');

      if ( get(this, 'mode') === 'branch' ) {

        param.branch = branch;

      }
      get(this, 'model').doAction('reload', param)
        .then(() => {

          this.send('cancel');

        })
        .finally(() => {

          cb();

        });

    },
  }
});
