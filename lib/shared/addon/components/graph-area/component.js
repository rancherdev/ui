import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import moment from 'moment';
import ThrottledResize from 'shared/mixins/throttled-resize';
import Component from '@ember/component';
import {
  formatPercent,
  formatMib,
  formatKbps
} from 'shared/utils/util';
import layout from './template';

const FORMATTERS = {
  value:   (value) => {
    if ( value < 1 ) {
      return Math.round(value * 100) / 100;
    } else if ( value < 10 ) {
      return Math.round(value * 10) / 10;
    } else {
      return Math.round(value);
    }
  },
  percent: formatPercent,
  mib:     formatMib,
  kbps:    formatKbps
};

const LOADING_PARAMS =  {
  text:      '',
  color:     '#3d3d3d',
  textColor: '#3d3d3d',
  maskColor: 'rgba(255, 255, 255, 0.8)',
  zlevel:    0
}

export default Component.extend(ThrottledResize, {
  intl:       service(),
  layout,

  tagName:    'div',
  classNames: ['graph-area'],

  model:  null,
  fields: null,
  chart:  null,

  minMax: null,

  formatter:   'value',
  needRefresh: false,

  didRender() {
    this._super();

    if ( get(this, 'fields.length') > 0 && !get(this, 'chart') ) {
      this.create();
      setTimeout(() => {
        const chart = get(this, 'chart');

        chart.resize();
      }, 200);
    }
  },

  refresh: observer('model.needRefresh', function() {
    this.draw();
    set(this, 'model.needRefresh', false);
  }),

  loadingDidChange: observer('loading', function() {
    const chart = get(this, 'chart');

    if ( chart && get(this, 'loading') ) {
      chart.showLoading(LOADING_PARAMS);
    } else if (chart) {
      chart.hideLoading();
    }
  }),

  onResize() {
    if (get(this, 'chart')) {
      get(this, 'chart').resize();
    }
  },

  create() {
    const chart = echarts.init(this.$('.content')[0], 'walden');

    set(this, 'chart', chart);

    if ( get(this, 'loading') ) {
      chart.showLoading(LOADING_PARAMS);
    }
  },

  getFields() {
    const lines = get(this, 'lines');

    if ( lines) {
      const result = [];

      lines.forEach((line) => {
        get(this, 'fields').forEach((field) => {
          result.push({
            id:    `${ line.id }_${ field }`,
            data: get(line, `data.${ field }`) || []
          });
        });
      });

      return result;
    } else {
      return get(this, 'fields').map((field) => {
        return {
          id:    field,
          data:  get(this, `model.${ field }`) || []
        }
      });
    }
  },

  draw() {
    const chart = get(this, 'chart');

    if ( !chart ) {
      return;
    }

    const minMax = get(this, 'minMax');
    let setMax = true;
    const xAxis = [];
    const series = [];
    const fields = this.getFields();

    fields.forEach((field, index) => {
      const serie = field.data || [];
      const data = [];
      let dateIndex = 0;

      serie.forEach((d) => {
        if ( index === dateIndex || xAxis.length === 0 ) {
          dateIndex = index;
          const date = new Date(d[1]);

          xAxis.push(moment(date).format('MM/DD h:mm'));
        }
        if ( minMax && setMax && d[0] > minMax ) {
          setMax = false;
        }
        data.push(d[0]);
      });

      series.push({
        name:       field.id,
        type:       'line',
        showSymbol: false,
        data
      });
    });

    const formatter = FORMATTERS[get(this, 'formatter')];
    const intl = get(this, 'intl');
    const self = this;
    let option = {
      tooltip: {
        trigger:   'axis',
        formatter(params) {
          let html = '';

          params.forEach((p, i) => {
            if ( i === 0 ) {
              html = `<div class="text-left">${ p.axisValueLabel }`
            }
            const value = formatter(p.data);
            let label = p.seriesName;
            let name;

            if ( get(self, 'lines') ) {
              const i = label.lastIndexOf('_');

              name = label.substr(0, i);
              label = label.slice(i + 1);
            }
            html += `<br><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ p.color };"></span> ${ intl.t(`infoMultiStats.${ label }`) }: ${ value } ${ name ? `(${  name  })` : '' }`;
          });

          html += '</div>';

          return html;
        }
      },
      grid:    {
        top:          '10px',
        left:         '30px',
        right:        '30px',
        bottom:       '3%',
        containLabel: true
      },
      xAxis:   {
        type:        'category',
        boundaryGap: false,
        data:        xAxis,
      },
      yAxis:  {
        type:      'value',
        axisLabel: { formatter: FORMATTERS[get(this, 'formatter')] },
        splitArea: { show: true },
      },
      series,
    };

    if ( setMax && minMax ) {
      option.yAxis.max = minMax;
    }

    chart.setOption(option, true);

    chart.hideLoading();
  },
});
