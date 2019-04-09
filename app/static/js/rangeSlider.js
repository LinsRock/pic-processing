$.fn.RangeSlider = function (config, callback) {
    //默认配置
    this.defaultConfig = {
        min: 0,
        max: 10,
        step: 1,
        defaultVal: 0
    };

    //配置合并
    Object.assign(this.defaultConfig, config);

    const $input = $(this),
        min = this.defaultConfig.min,
        max = this.defaultConfig.max,
        step = this.defaultConfig.step,
        defaultVal = this.defaultConfig.defaultVal;

    $input.attr({
        'min': min,
        'max': max,
        'step': step,
        'value': defaultVal
    });

    //初始值初始化
    callback && callback(this[0]);
    $input.css('background', 'linear-gradient(to right, #059CFA, white ' + (defaultVal - this[0].min) / (this[0].max - this[0].min) * 100 + '%, white)');

    //事件绑定
    $input.bind("input", function () {
        $input.attr('value', this.value);
        $input.css('background', 'linear-gradient(to right, #059CFA, white ' + (this.value - this.min) / (this.max - this.min) * 100 + '%, white)');

        callback && callback(this);
    });
};