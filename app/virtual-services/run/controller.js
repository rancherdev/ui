import Controller from '@ember/controller';

export default Controller.extend({
  queryParams:      ['virtualServiceId', 'upgrade'],
  virtualServiceId: null,
  upgrade:          null,

  actions: {
    done() {
      this.send('goToPrevious', 'virtual-services.index');
    },
  },
});
