import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['id'],

  actions: {
    done() {
      return this.transitionToRoute('destination-rules.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
