import { get } from '@ember/object';
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

  pushToRepo: alias('modalService.modalOpts.pushToRepo'),
  cancel:     alias('modalService.modalOpts.cancel'),
  branches:   alias('modalService.modalOpts.updatedBranch'),

  actions: {
    save() {

      this.pushToRepo();
      get(this, 'modal').toggleModal();

    },

    cancel() {

      this.cancel();
      get(this, 'modal').toggleModal();

    },
  },
});
