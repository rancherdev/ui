import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'ui/mixins/modal-base';
import layout from './template';


export default Component.extend(ModalBase, {
  modal:      service(),
  settings: service(),

  layout,
  classNames: ['medium-modal'],

  pushConfig: true,

  ok:         alias('modalService.modalOpts.ok'),
  canPush:    alias('modalService.modalOpts.canPush'),
  pushToRepo: alias('modalService.modalOpts.pushToRepo'),
  cancel:     alias('modalService.modalOpts.cancel'),
  branches:   alias('modalService.modalOpts.updatedBranch'),

  init() {

    this._super(...arguments);

    set(this, 'pushConfig', get(this, 'canPush'));

  },

  actions: {
    save() {

      if ( get(this, 'pushConfig') ) {

        this.pushToRepo();

      } else {

        this.ok();

      }
      get(this, 'modal').toggleModal();

    },

    cancel() {

      this.cancel();
      get(this, 'modal').toggleModal();

    },
  },
});
