const MASTER_IMG_CLASS = '.master-img';
const MASTER_WRAP_CLASS = '.master-wrapper';
const PROCESSING_IMG_CLASS = '.processing-img';
const upload_base_path = '../static/upload-img/';
const cacehe_base_path = '../static/cache-img/';
const MESSAGE_DATA = {
  img_not_upload: '你还没有导入图片，请先导入图片！',
  img_upload_succ: '图像导入成功',
  img_apply_succ: '图像应用成功',
  img_add_noise_succ: '图像加入噪声成功',
  img_add_noise_error: '图像加入噪声失败',
  img_gray_succ: '图像灰度化成功',
  img_gray_error: '图像灰度化失败',
  img_threshold_succ: '图像阈值分割成功',
  img_threshold_error: '图像阈值分割失败',
  img_filter_succ: '图像滤波成功',
  img_filter_error: '图像滤波失败',
  img_morphology_succ: '图像形态学处理成功',
  img_morphology_error: '图像形态学处理失败',
  img_edge_succ: '图像边缘检测成功',
  img_edge_erroe: '图像边缘检测失败',
  img_contour_succ: '图像轮廓提取成功',
  img_contour_error: '图像轮廓提取失败',
  cailbrate_succ: '图像标定成功',
  cailbrate_error: '图像标定失败',
  gear_detection_succ: '齿轮检测成功',
  gear_detection_error: '齿轮检测失败',
  shaft_detection_succ: '轴尺寸测量成功',
  shaft_detection_error: '轴尺寸测量失败'
}

let currentImg = null;  //存放当前上传的文件名
let processedImg = null; //处理过后的图片


/* --------------- header ------------------- */
//监听上传事件
$('#upload-btn').bind('change', function () {
  //是否选择图片文件
  if (this.value) {
    //如果已经选择了图片，则清除上一次选择的图片
    if (currentImg != null) {
      deleteImg(currentImg, 0);
    }
    //上传图片
    uploadImg(this, $(MASTER_WRAP_CLASS), function () {
      //解除按钮禁用状态
      $('.put-btn').removeClass('disable-button');
      $('.put-btn-green').removeClass('disable-button');
    });
  }
});


//删除上传图片事件
$('#del-btn').bind('click', function () {
  if (currentImg == null) {
    return;
  } else {
    if (processedImg == null) {  //处理后的图片不存在
      //删除加载的图片
      deleteImg(currentImg, 0);

      //给按钮添加禁用状态
      $('.put-btn:not(.not-disable)').addClass('disable-button');
      $('.put-btn-green:not(.not-disable)').addClass('disable-button');
    } else {
      //弹出提示框提示是否要删除
      let isDel = confirm('确定需要删除已经处理的图片吗？');

      if (isDel) {
        //删除原图和处理后的图片
        deleteImg(currentImg, 0);
        deleteImg(processedImg, 1);

        //给按钮添加禁用状态
        $('.put-btn:not(.not-disable)').addClass('disable-button');
        $('.put-btn-green:not(.not-disable)').addClass('disable-button');
      }
    }
    //重置上传控件
    $('#upload-btn').val("");
  }

});

//图片下载
$('#save-btn').bind('click', function () {
  if (processedImg != null) {
    let imgUrl = 'static/cache-img/' + processedImg;
    downloadImg(imgUrl, processedImg);
  }
});

/* ------------------ header end -------------------- */

/* --------------------- nav ------------------------ */
//侧边导航切换
$('.l-nav').bind('click', function (event) {
  let e = event || window.event,
    target = e.target;
  if ($('.l-nav').has(target).length != 0) {
    let num = 0;
    if (target.getAttribute('data-num') !== null) {
      num = target.dataset.num;
    } else {
      target = e.target.parentNode;
      num = target.dataset.num;
    }

    //清除上一个nav-item的当前样式
    $('.l-nav .nav-item.active').removeClass('active');
    //给当前点击的nav-item添加当前样式
    target.classList.add('active');
    //清除上一个块的active
    $('.proc-list li.active').removeClass('active');
    //给点击的nav-item对应的块添加active
    $('.proc-list li:nth-child(' + num + ')').addClass('active');

    //当点击齿轮检测时，r-box隐藏，shaft-info隐藏，gear-info显示
    if (num == 6) {
      $('.r-box').css('display', 'none');
      $('.shaft-info').css('display', 'none');
      $('.gear-info').css('display', 'block');
      $('.master-title').text('待测量图片');
    } else if (num == 7) {
      //当点击轴尺寸测量时，r-box隐藏，gear-info隐藏，shaft-info显示
      $('.r-box').css('display', 'none');
      $('.shaft-info').css('display', 'block');
      $('.gear-info').css('display', 'none');
      $('.master-title').text('待测量图片');
    } else {
      $('.r-box').css('display', 'block');
      $('.gear-info').css('display', 'none');
      $('.shaft-info').css('display', 'none');
      $('.master-title').text('原图');
    }
  }
});


//图像预处理手风琴实例化
let imgPre = new Accordion($('.img-pre-accordion'));

//noise下拉框实例化
let noiseSelect = new selectEvent('.noise-main');

//threshold 下拉框实例化
let thresholdSelect = new selectEvent('.threshold-main');

// rhresh 滑动条
$('.thr-slider').RangeSlider({
  min: 1,
  max: 255,
  step: 1,
  defaultVal: 127
}, function ($input) {
  $('.thresh-slider .value').html($input.value);
});

//put-btn 按钮警告
$('.put-btn').bind('click', function () {
  let isDisable = this.classList.contains('disable-button');
  if (!currentImg && isDisable) {
    addHint('warning', MESSAGE_DATA.img_not_upload);
    return;
  }
});
$('.put-btn-green').bind('click', function () {
  let isDisable = this.classList.contains('disable-button');
  if (!currentImg && isDisable) {
    addHint('warning', MESSAGE_DATA.img_not_upload);
    return;
  }
});


//noise 预览按钮
$('.preview-noise-btn').bind('click', function () {
  imgProcessFn(this, 0, 'addnoise');
});

//noise 应用按钮
$('.put-noise-btn').bind('click', function () {
  imgProcessFn(this, 1, 'addnoise');
});

//gray 应用按钮
$('.gray-btn').bind('click', function () {
  imgProcessFn(this, null, 'gray');
});

//threshold 预览按钮
$('.preview-threshold-btn').bind('click', function () {
  imgProcessFn(this, 0, 'threshold');
});

//threshold 应用按钮
$('.threshold-btn').bind('click', function () {
  imgProcessFn(this, 1, 'threshold');
});

//smoothing 下拉框实例化
let smoothingSelect = new selectEvent('.smoothing-main', function (target) {
  let item = target.dataset.item;
  if (item == 'gaussian') {
    $('.nuc-slider').attr({
      'min': 1,
      'max': 11,
      'step': 2,
      'value': 1
    });
  } else if (item == 'median') {
    $('.nuc-slider').attr({
      'min': 3,
      'max': 11,
      'step': 2,
      'value': 3
    });
  } else {
    $('.nuc-slider').attr({
      'min': 1,
      'max': 20,
      'step': 1,
      'value': 1
    });
  }
  let val = $('.nuc-slider').val(),
    min = $('.nuc-slider').attr('min'),
    max = $('.nuc-slider').attr('max');
  $('.nuc-slider').css('background', 'linear-gradient(to right, #059CFA, white ' + (val - min) / (max - min) * 100 + '%, white)');
  $('.smoothing-slider .value').html(val);
});

//smoothing 核大小滑动条
$('.nuc-slider').RangeSlider({
  min: 1,
  max: 20,
  step: 1,
  defaultVal: 3
}, function ($input) {
  $('.smoothing-slider .value').html($input.value);
});

//图像滤波 预览
$('.preview-smoothing-btn').bind('click', function () {
  imgProcessFn(this, 0, 'smoothing');
});
//图像滤波 应用
$('.put-smoothing-btn').bind('click', function () {
  imgProcessFn(this, 1, 'smoothing');
})

//morphology 手风琴菜单实例化
let imgMorp = new Accordion($('.img-morphology'));

//kernel 滑动条实例化
$('.k1-slider').RangeSlider({
  min: 1,
  max: 30,
  step: 1,
  defaultVal: 3
}, function ($input) {
  $('.erode-slider .value').html($input.value);
});

$('.k2-slider').RangeSlider({
  min: 1,
  max: 30,
  step: 1,
  defaultVal: 3
}, function ($input) {
  $('.dilate-slider .value').html($input.value);
});

$('.k3-slider').RangeSlider({
  min: 1,
  max: 30,
  step: 1,
  defaultVal: 3
}, function ($input) {
  $('.operation-slider .value').html($input.value);
});

// 腐蚀迭代次数
numInput($('.erode-iteration'), {
  min: 1,
  max: 10,
  step: 1,
  defaultVal: 1
});

// 膨胀迭代次数
numInput($('.dilate-iteration'), {
  min: 1,
  max: 10,
  step: 1,
  defaultVal: 1
});

//形态学运算下拉框实例化
let operationSel = new selectEvent('.operation-main');

//图像腐蚀 预览
$('.preview-erode-btn').bind('click', function () {
  imgProcessFn(this, 0, 'erode');
});

// 图像腐蚀 应用
$('.put-erode-btn').bind('click', function () {
  imgProcessFn(this, 1, 'erode');
});

//图像膨胀 预览
$('.preview-dilate-btn').bind('click', function () {
  imgProcessFn(this, 0, 'dilate');
});

//图像膨胀 应用
$('.put-dilate-btn').bind('click', function () {
  imgProcessFn(this, 1, 'dilate');
});

//图像形态学运算 预览
$('.preview-operation-btn').bind('click', function () {
  imgProcessFn(this, 0, 'operation');
});
//图像形态学运算 应用
$('.put-operation-btn').bind('click', function () {
  imgProcessFn(this, 1, 'operation');
});

//radio-btn 切换
$('.radio-btn-wrap').bind('click', function (event) {
  event = event || window.event;
  let target = event.target;
  if (target.tagName == 'LI') {
    $('.radio-btn-wrap .current').removeClass('current');
    target.classList.add('current');
  }
})

// 图像边缘检测手风琴菜单实例化
let edgeMenu = new Accordion($('.edge-section'));

//梯度计算检测 预览
$('.preview-edge-btn').bind('click', function () {
  imgProcessFn(this, 0, 'edge');
});

//梯度计算检测 应用
$('.put-edge-btn').bind('click', function () {
  imgProcessFn(this, 1, 'edge');
});

//canny边缘检测预览
$('.preview-canny-btn').bind('click', function () {
  imgProcessFn(this, 0, 'canny');
});

//canny边缘检测应用
$('.put-canny-btn').bind('click', function () {
  imgProcessFn(this, 1, 'canny');
});

// 图像轮廓提取手风琴菜单实例化
let contourMenu = new Accordion($('.contour-section'));

// epsilon 参数滑条实例化
$('.approx-slider').RangeSlider({
  min: 1,
  max: 30,
  step: 1,
  defaultVal: 2
}, function ($input) {
  $('.epsilon-slider .value').html($input.value);
});

//边界拟合下拉框实例化
let fitSel = new selectEvent('.fit-main');

//轮廓检索 预览
$('.preview-contour-btn').bind('click', function () {
  let isChecked = $('#toggle-knob').prop('checked');
  imgProcessFn(this, 0, 'contour', {
    'feature': 'allContours',
    'arg': isChecked ? 'outer' : 'all'
  });
});
//轮廓检索 应用
$('.put-contour-btn').bind('click', function () {
  let isChecked = $('#toggle-knob').prop('checked');
  imgProcessFn(this, 1, 'contour', {
    'feature': 'allContours',
    'arg': isChecked ? 'outer' : 'all'
  });
});

//轮廓近似 预览
$('.preview-approx-btn').bind('click', function () {
  let epsilon = $('.epsilon-slider .value').html();
  imgProcessFn(this, 0, 'contour', {
    'feature': 'approx',
    'arg': epsilon
  });
});
//轮廓近似 应用
$('.put-approx-btn').bind('click', function () {
  let epsilon = $('.epsilon-slider .value').html();
  imgProcessFn(this, 1, 'contour', {
    'feature': 'approx',
    'arg': epsilon
  });
});

//凸包 预览
$('.preview-convex-btn').bind('click', function () {
  imgProcessFn(this, 0, 'contour', {
    'feature': 'convex',
    'arg': 'all'
  });
});
//凸包 应用
$('.put-convex-btn').bind('click', function () {
  imgProcessFn(this, 1, 'contour', {
    'feature': 'convex',
    'arg': 'all'
  });
});

//边界拟合 预览
$('.preview-fit-btn').bind('click', function () {
  let feature = $('.fit-set-select').attr('data-current-item');
  imgProcessFn(this, 0, 'contour', {
    'feature': feature,
    'arg': 'all'
  });
});
//边界拟合 应用
$('.put-fit-btn').bind('click', function () {
  let feature = $('.fit-set-select').attr('data-current-item');
  imgProcessFn(this, 1, 'contour', {
    'feature': feature,
    'arg': 'all'
  });
});
/* -------------------- nav end ---------------------- */

/* -------------------- showImg ---------------------- */
//移入图片显示图片信息
$('.master-wrapper').bind('mouseenter', function () {
  if ($('.master-name').text()) {
    $('.master-name').css('display', 'block');
  }
  if ($('.master-size').text()) {
    $('.master-size').css('display', 'block');
  }
});

//移出图片隐藏图片信息
$('.master-wrapper').bind('mouseleave', function () {
  $('.master-name').css('display', 'none');
  $('.master-size').css('display', 'none');
});

//移入图片显示图片信息
$('.processing-wrapper').bind('mouseenter', function () {
  if ($('.processing-name').text()) {
    $('.processing-name').css('display', 'block');
  }
  if ($('.processing-size').text()) {
    $('.processing-size').css('display', 'block');
  }
});

//移出图片隐藏图片信息
$('.processing-wrapper').bind('mouseleave', function () {
  $('.processing-name').css('display', 'none');
  $('.processing-size').css('display', 'none');
});

/* --------------------- showImg end ------------------- */

/* --------------------- popup ------------------------- */
//大图查看
$('.master-wrapper').bind('click', function () {
  let masterImgEl = $('.master-wrapper img');
  if (masterImgEl.length) {
    $('.popup-wrap').css('display', 'block');
    $('.popup-img').attr('src', masterImgEl.attr('src'));
  }
});

$('.processing-wrapper').bind('click', function () {
  let processImgEl = $('.processing-wrapper img');
  if (processImgEl.length) {
    $('.popup-wrap').css('display', 'block');
    $('.popup-img').attr('src', processImgEl.attr('src'));
  }
});

//popup 关闭按钮
$('.popup-close-btn').bind('click', function () {
  $('.popup-wrap').css('display', 'none');
  $('.popup-img').attr('src', '');
});

/* --------------------- popup end ---------------------- */
/* ---------------------- calibrate popup ------------------ */
//calibrate-popup 关闭按钮
$('.calibrate-popup .close-btn').bind('click', function () {
  $('.calibrate-popup').css('display', 'none');
});

//取消按钮
$('.plate-cancel-btn').bind('click', function() {
  $('.calibrate-popup').css('display', 'none');
});
$('.gauge-cancel-btn').bind('click', function() {
  $('.calibrate-popup').css('display', 'none');
});

//标定Tab切换
$('.calibrate-tabs').bind('click', function (event) {
  event = event || window.event;
  let target = event.target;
  if (target.tagName === 'LI') {
    //tabs
    $('.calibrate-tabs li').removeClass('current');
    target.classList.add('current');

    //content
    $('.calibrate-nav-content>ul>li').removeClass('active');
    if (target.classList.contains('plate')) {
      $('.calibrate-plate').addClass('active');
    } else {
      $('.gauge-block').addClass('active');
    }
  }
})

//重新标定(标定板) 按钮
$('.plate-anew-btn').bind('click', function () {
  /* if ($('.plate-value').html() === '--') {
    return;
  } */
  //清空标定图片
  $('.plate-img-box').html('');
  //显示上传标定图片按钮
  $('.upload-plate-btn').css('display', 'block');
  //清空上一次上传的内容
  $('#upload-plate-inp').val('');

  //参数初始化
  $('#plate-num-m').val('');
  $('#plate-num-n').val('');
  $('#plate-ract-width').val('');
  $('#plate-height-inp').val('');
  $('.plate-value').html('--');

  //清空缓存的标定板图片
  $.post(
    '/clear_plate_folder',
    {},
    function (data) {
    }
  )

});

//标定板图片上传按钮
$('#upload-plate-inp').bind('change', function () {
  //已经选择了图片
  if (this.value) {
    let imgs = this.files;

    //清空缓存的标定板图片
    $.post(
      '/clear_plate_folder',
      {},
      function (data) {
      }
    )

    //隐藏上传标定图片按钮
    $('.upload-plate-btn').css('display', 'none');

    //显示loading图标
    $('.plate-loading-icon').css('display', 'block');

    //展示选择的多张图片
    for (let i = 0; i < imgs.length; i++) {
      showCalibrateImg(imgs[i], $('.plate-img-box')[0]);
    }

    //将标定板图片上传到后端
    let formData = new FormData();
    //添加多张图片
    for (let i = 0; i < imgs.length; i++) {
      formData.append('plate_imgs' + i, imgs[i], imgs[i].name);
    }

    $.ajax({
      type: 'post',
      url: '/upload_plate_img',
      data: formData,
      async: false,
      processData: false,
      contentType: false,
      error: function (xhr, type) {
        alert('标定板图片上传失败');
      }
    })
  }
});

//标定板标定按钮
$('.plate-confirm-btn').bind('click', function () {
  let plate_m = $('#plate-num-m').val(),
    plate_n = $('#plate-num-n').val(),
    plate_width = $('#plate-ract-width').val(),
    plate_h = $('#plate-height-inp').val();

  //标定中状态
  $('.plate-confirm-icon').css('display', 'inline-block');
  $('.plate-confirm-btn span').html('标定中');

  $.post(
    '/plate_cailbration',
    {
      'm': plate_m,
      'n': plate_n,
      'width': plate_width,
      'h': plate_h
    },
    function (data) {
      if (data.ok) {
        $('.plate-value').html(data.coefficient);
        $('.calibrate-info .value').html(data.coefficient);

        //标定完成状态
        $('.plate-confirm-icon').css('display', 'none');
        $('.plate-confirm-btn span').html('开始标定');
      }
    }
  )

});

//量块图片上传按钮
$('#upload-gauge-inp').bind('change', function () {
  if (this.value) {
    let gauge_img = this.files[0];
    let formData = new FormData();
    formData.append('gauge_img', gauge_img);

    //隐藏上传按钮
    $('.upload-gauge-btn').css('display', 'none');

    //展示量块图片
    showGaugeImg(gauge_img, $('.show-gauge-img'));

    //将量块图片上传到后端
    $.ajax({
      type: 'post',
      url: '/upload_gauge_img',
      data: formData,
      async: false,
      processData: false,
      contentType: false,
      /*success: function (data) {
        if (data.ok) {
          console.log('成功上传')
        }
      }, */
      error: function (xhr, type) {
        alert('量块图片上传失败');
      }
    });
  }
});

//量块标定 按钮
$('.gauge-confirm-btn').bind('click', function () {
  //没有上传量块图片时返回
  if ($('.show-gauge-img').has('img').length == 0) {
    return;
  }

  $.post(
    '/gauge_cailbration',
    {},
    function (data) {
      if (data.ok) {
        //展示标定后的图片
        let cailbrate_img = cacehe_base_path + data.cailbration_img;
        console.log(cailbrate_img)
        $('.show-gauge-img img').attr('src', cailbrate_img);
        //填充标定系数
        $('.gauge-value').text(data.coefficient);
        $('.calibrate-info .value').html(data.coefficient);
        //删除上传图片
        //deleteImg(currentImg, 0);

        //提示栏信息
        addHint('succeed', MESSAGE_DATA.cailbrate_succ);
      } else {

      }
    }
  )
});


//量块重新标定 按钮
$('.gauge-anew-btn').bind('click', function () {
  //清空量块图片
  $('.show-gauge-img').html('');
  //显示上传量块图片按钮
  $('.upload-gauge-btn').css('display', 'block');
  //清空标定系数
  $('.gauge-value').text('--');
  //清空上传控件中的内容
  $('#upload-gauge-inp').val('');
});

//展示上传的多张标定图片
function showCalibrateImg(file, imgBox) {
  if (window.FileReader) {
    var reader = new FileReader();
  } else {
    alert('你的设备不支持图片显示，请使用chrome浏览器查看');
  }
  var uploadImg = file;
  //图片读取完成时
  reader.onload = function (event) {
    var image = new Image();
    //图片加载完成时
    image.onload = function () {
      //隐藏loading图标
      $('.plate-loading-icon').css('display', 'none');
    };
    image.src = event.target.result;
    imgBox.append(image);
  };
  reader.readAsDataURL(uploadImg);
}

//展示量块图片
function showGaugeImg(img, imgBox) {
  if (window.FileReader) {
    var reader = new FileReader();
  } else {
    alert('你的设备不支持图片显示，请使用chrome浏览器查看');
  }
  reader.onload = function () {
    var image = new Image();
    //图片加载完成时
    image.onload = function () {
      //隐藏loading图标
      imgBox.find('i').css('display', 'none');
      //展示图片居中
      imgCenter(image, imgBox);
    };
    //显示loading图标
    imgBox.find('i').css('display', 'inline-block');
    image.src = event.target.result;
    imgBox.append(image);
  };

  reader.readAsDataURL(img);

}
/* ---------------------- calibrate popup end ------------------- */


/* --------------------- calibrate ----------------------  */
$('.calibrate-btn').bind('click', function () {
  $('.calibrate-popup').css('display', 'block');

});

/* --------------------- calibrate end ---------------------- */

/* ---------------------- gear-parameter ------------------ */
//齿轮检测按钮
$('.gear-detection-btn').bind('click', function () {
  if (currentImg == null) {
    return;
  }
  let cailbrateCoeff = $('.calibrate-info .value')[0].innerHTML;
  $.post(
    '/gear_detection',
    {
      'cailbrateCoeff': cailbrateCoeff
    },
    function (data) {
      if (data.ok) {
        let gear_parameter = data.parameter;
        //数据填充
        $('.addendum').text(gear_parameter.Ra + 'mm');
        $('.teeth').text(gear_parameter.z);
        $('.dedendum').text(gear_parameter.Rf + 'mm');
        $('.modulus').text(gear_parameter.m);
        $('.reference').text(gear_parameter.r + 'mm');
        $('.pitch').text(gear_parameter.p + 'mm');
        $('.tooth_add').text(gear_parameter.ha + 'mm');
        $('.tooth_ded').text(gear_parameter.hf + 'mm');

        //标记图片展示
        //删除上一个图片 
        deleteImg(currentImg, 0);

        currentImg = data.markImg;

        //修改title
        $('.master-title').html('检测后的标记图片');

        //在视图中展示噪声图片
        let image = new Image();

        //展示图片加载完成
        image.onload = function () {
          //展示图片居中
          imgCenter(image, $('.master-wrapper'));
          //显示图片信息
          $('.master-name').html(data.markImg);
          $('.master-size').html(image.width + ' × ' + image.height);
          //显示成功的提示信息
          addHint('succeed', MESSAGE_DATA.gear_detection_succ);
        }

        image.className = 'master-img';
        image.src = upload_base_path + currentImg;
        $('.master-wrapper').append(image);
      } else {
        addHint('error', MESSAGE_DATA.gear_detection_error);
      }
    }
  )
});
/* -------------------- gear-parameter end ---------------- */

/* --------------------- shaft-measure ----------------------- */
$('.shaft-detection-btn').bind('click', function() {
  if(currentImg == null) {
    return;
  }
  let cailbrateCoeff = $('.calibrate-info .value')[1].innerHTML;
  console.log(cailbrateCoeff)
  $.post(
    '/shaft_detection',
    {
      'cailbrateCoeff': cailbrateCoeff
    },
    function(data) {
      if(data.ok) {
        //填充数据
        let shaftSize = data.shaftSize;
        let html = ''
        for(let i=0; i < shaftSize.length; i++) {
          html += `
            <tr>
              <td>${i+1}</td>
              <td>${shaftSize[i][0]}mm</td>
              <td>${shaftSize[i][1]}mm</td>
            </tr>
          `;
        }
        $('.shaft-table tbody').html(html);

        //标记图片展示
        //删除上一个图片 
        deleteImg(currentImg, 0);

        currentImg = data.shaftImg;

        //修改title
        $('.master-title').html('检测出的轴段');

        //在视图中展示噪声图片
        let image = new Image();

        //展示图片加载完成
        image.onload = function () {
          //展示图片居中
          imgCenter(image, $('.master-wrapper'));
          //显示图片信息
          $('.master-name').html(data.shaftImg);
          $('.master-size').html(image.width + ' × ' + image.height);
          //显示成功的提示信息
          addHint('succeed', MESSAGE_DATA.shaft_detection_succ);
        };

        image.className = 'master-img';
        image.src = upload_base_path + currentImg;
        $('.master-wrapper').append(image);
      }else {
        addHint('error', MESSAGE_DATA.shaft_detection_error);
      }
    }
  )
})
/* --------------------- shaft-measure end ----------------------- */

//上传图片
function uploadImg(fileBtn, imgBox, fn) {
  const LOAD_IMG = 'file_img';
  let file = fileBtn.files[0];
  console.log(file)
  let formData = new FormData();
  formData.append(LOAD_IMG, file);
  //先加载图片
  showImg(fileBtn, imgBox)

  //发送上传图片请求
  $.ajax({
    type: 'post',
    url: '/upload',
    data: formData,
    async: false,
    processData: false,
    contentType: false,
    success: function (data) {
      if (data.ok) {
        currentImg = data.imgName;
        //调用回调函数
        fn && fn();
      }
    },
    error: function (xhr, type) {
      alert('图片上传失败');
    }
  });
}

//展示上传图片
function showImg(fileBtn, imgBox) {
  if (window.FileReader) {
    var reader = new FileReader();
  } else {
    alert('你的设备不支持图片显示，请使用chrome浏览器查看');
  }
  var uploadImg = fileBtn.files[0];
  //图片读取完成时
  reader.onload = function (event) {
    var image = new Image();
    //图片在页面上加载完时
    image.onload = function () {
      //让图片居中
      imgCenter(image, imgBox);
      //添加图片信息
      $('.master-name').html(uploadImg.name);
      $('.master-size').html(image.width + ' × ' + image.height);
      //添加成功信息
      addHint('succeed', MESSAGE_DATA.img_upload_succ);
    }
    image.className = 'master-img';
    image.src = event.target.result;
    imgBox.append(image);
  };
  reader.readAsDataURL(uploadImg)
}

//删除展示图片
function deleteImg(imgName, imgType) {
  if (imgName == currentImg) {
    $(MASTER_IMG_CLASS).remove();      //将加载的图片删除
    currentImg = null;                 //将当前图片置空
    //将加载图片的信息清空
    $('.master-name').html('');
    $('.master-size').html('');
    $('.master-title').html('原图');
  } else if (imgName == processedImg) {
    $(PROCESSING_IMG_CLASS).remove();
    processedImg = null;
    //将加载图片的信息清空
    $('.processing-name').html('');
    $('.processing-size').html('');
  }
  //删除后台缓存图片
  $.post('/delete',
    {
      'imgName': imgName,
      'imgType': imgType
    },
    function (data) {
      if (data.ok) {
        addHint('succeed', '图片删除成功');
      } else {
        addHint('error', '图片删除失败!');
      }
    })
}

//图像处理合集函数
function imgProcessFn(btnEl, isApply, type, data = {}) {
  if (currentImg == null) {
    return
  }
  //清空提示
  addHint('empty', '');
  //显示加载图标
  loadIcon(btnEl, 'show');

  //回调清除图标
  let callback = function () {
    loadIcon(btnEl, 'hide');
  }

  //图像处理分类
  switch (type) {
    case 'addnoise':
      //图片加噪
      let noiseType = $('.noise-set-select').attr('data-current-item');
      addNoise(noiseType, isApply, callback);
      break;

    case 'gray':
      //图片灰度化
      imgGray(callback);
      break;

    case 'threshold':
      //阈值分割
      let thresholdType = $('.threshold-set-select').attr('data-current-item');
      let thresh = $('.thresh-slider .value').html();
      imgThreshold(thresholdType, thresh, isApply, callback);
      break;

    case 'smoothing':
      //图像滤波
      let filterType = $('.smoothing-set').attr('data-current-item');
      let nucleus = $('.smoothing-slider .value').html()
      imgFilter(filterType, nucleus, isApply, callback);
      break;

    case 'erode':
      //图像腐蚀
      let kernel1 = $('.erode-slider .value').html();
      let iteration1 = $('.erode-iteration .num').val();
      imgMorphology(kernel1, iteration1, 0, isApply, callback);
      break;

    case 'dilate':
      //图像膨胀
      let kernel2 = $('.dilate-slider .value').html();
      let iteration2 = $('.dilate-iteration .num').val();
      imgMorphology(kernel2, iteration2, 1, isApply, callback);
      break;

    case 'operation':
      //图像形态学运算
      let kernel3 = $('.operation-slider .value').html();
      let type = $('.operation-set').attr('data-current-item');
      imgMorphology(kernel3, null, type, isApply, callback);
      break;

    case 'edge':
      //梯度计算
      let operator = $('.radio-btn-wrap .current').attr('data-item');
      imgEdge(operator, null, null, isApply, callback);
      break;

    case 'canny':
      //canny边缘检测
      let minVal = $('.threshold-val1').val();
      let maxVal = $('.threshold-val2').val();
      imgEdge('canny', minVal, maxVal, isApply, callback);
      break;

    case 'contour':
      //轮廓检索
      imgContour(data.feature, data.arg, isApply, callback);
      break;
  }
}


//图片添加噪声
function addNoise(noiseType, isApply, fn) {
  $.post('/add_noise',
    {
      'noiseType': noiseType,
    },
    function (data) {
      if (data.ok) {
        if (!isApply) { //预览
          showProcImg({
            imgName: data.noiseName,
            type: '加入' + noiseType + '噪声的图片',
            message: MESSAGE_DATA.img_add_noise_succ
          }, fn);
        } else {     //保存
          //展示保存图片
          showApplyImg({
            imgName: data.noiseName,
            type: '加入' + noiseType + '噪声的图片',
            message: MESSAGE_DATA.img_apply_succ
          }, fn);
        }
      } else {
        addHint('error', MESSAGE_DATA.img_add_noise_error);
      }
    })
}


//图片应用
function showApplyImg(imgInfo, fn) {

  //应用请求
  $.post(
    '/apply',
    {
      'loadImg': currentImg,
      'procImg': processedImg != null ? processedImg : 0
    },
    function (data) {
      if (data.ok) {
        //显示成功的提示信息
        addHint('succeed', data.message);

        //删除之前的图片和相关信息，将应用后的图片放置到当前图片中
        $(MASTER_IMG_CLASS).remove();
        $(PROCESSING_IMG_CLASS).remove();
        $('.processing-name').html('');
        $('.processing-size').html('');
        processedImg = null;
        currentImg = imgInfo.imgName;

        //修改title
        $('.master-title').html('应用后的图片');

        //在视图中展示噪声图片
        let image = new Image();

        //展示图片加载完成
        image.onload = function () {
          //展示图片居中
          imgCenter(image, $('.master-wrapper'));
          //显示图片信息
          $('.master-name').html(imgInfo.type);
          $('.master-size').html(image.width + ' × ' + image.height);
          //显示成功的提示信息
          addHint('succeed', imgInfo.message);

          //回调
          fn && fn();
        }

        image.className = 'master-img';
        image.src = upload_base_path + currentImg;
        $('.master-wrapper').append(image);
      }
    }
  );
}

//图片灰度化
function imgGray(fn) {
  console.log(currentImg)
  $.post(
    '/gray',
    {},
    function (data) {
      if (data.ok) {
        showApplyImg({
          imgName: data.grayName,
          type: '灰度化后的图片',
          message: MESSAGE_DATA.img_gray_succ
        }, fn);
      } else {
        addHint('error', MESSAGE_DATA.img_gray_error);
      }
    }
  )
}

//图像阈值分割
function imgThreshold(thresholdType, thresh, isApply, fn) {
  $.post(
    '/threshold',
    {
      'thresholdType': thresholdType,
      'thresh': thresh
    },
    function (data) {
      if (data.ok) {
        if (!isApply) {
          //预览
          showProcImg({
            imgName: data.thresholdName,
            type: '阈值化后的图片',
            message: MESSAGE_DATA.img_threshold_succ
          }, fn);
        } else {
          //应用
          showApplyImg({
            imgName: data.thresholdName,
            type: '阈值化后的图片',
            message: MESSAGE_DATA.img_apply_succ
          }, fn)
        }
      } else {
        addHint('error', MESSAGE_DATA.img_threshold_error);
      }
    }
  )
}

//图片滤波
function imgFilter(filterType, nucleus, isApply, fn) {
  $.post(
    '/smooth',
    {
      'filterType': filterType,
      'nucleus': nucleus
    },
    function (data) {
      //滤波成功
      if (data.ok) {
        if (!isApply) {
          showProcImg({
            imgName: data.filterImgName,
            type: filterType + '滤波后的图片',
            message: MESSAGE_DATA.img_filter_succ
          }, fn)
        } else {
          showApplyImg({
            imgName: data.filterImgName,
            type: filterType + '滤波后的图片',
            message: MESSAGE_DATA.img_apply_succ
          }, fn)
        }
      } else {
        addHint('error', MESSAGE_DATA.img_filter_error)
        loadIcon('.put-smoothing-btn', 'hide');
      }
    }
  )
}

// 图像形态学处理
function imgMorphology(kernel, iterations, type, isApply, fn) {
  $.post(
    '/morphology',
    {
      'kernel': kernel,
      'iterations': iterations,
      'type': type
    },
    function (data) {
      if (data.ok) {
        if (!isApply) {
          showProcImg({
            imgName: data.morphologyName,
            type: '形态学处理后的图片',
            message: MESSAGE_DATA.img_morphology_succ
          }, fn);
        } else {
          showApplyImg({
            imgName: data.morphologyName,
            type: '形态学处理后的图片',
            message: MESSAGE_DATA.img_apply_succ
          }, fn)
        }
      } else {
        addHint('error', MESSAGE_DATA.img_filter_error)
        loadIcon('.put-btn', 'hide');
      }
    }
  )
}

// 图像边缘检测
function imgEdge(operator, val1, val2, isApply, fn) {
  $.post(
    '/edge',
    {
      'operator': operator,
      'minVal': val1,
      'maxVal': val2
    },
    function (data) {
      if (data.ok) {
        if (!isApply) {
          showProcImg({
            imgName: data.edgeName,
            type: operator + '算子检测的边缘图片',
            message: MESSAGE_DATA.img_edge_succ
          }, fn);
        } else {
          showApplyImg({
            imgName: data.edgeName,
            type: operator + '算子检测的边缘图片',
            message: MESSAGE_DATA.img_apply_succ
          }, fn);
        }
      } else {
        addHint('error', MESSAGE_DATA.img_edge_erroe);
        loadIcon('put-edge-btn', 'hide');
      }
    }
  )
}

//图像轮廓提取
function imgContour(feature, arg, isApply, fn) {
  $.post(
    '/contour',
    {
      'feature': feature,
      'arg': arg
    },
    function (data) {
      if (data.ok) {
        if (!isApply) {
          //预览
          showProcImg({
            imgName: data.contourName,
            type: feature + '的图片',
            message: MESSAGE_DATA.img_contour_succ
          }, fn);
        } else {
          //应用
          showApplyImg({
            imgName: data.contourName,
            type: feature + '的图片',
            message: MESSAGE_DATA.img_contour_succ
          }, fn);
        }
      } else {
        addHint('error', MESSAGE_DATA.img_contour_error);
        loadIcon('put-btn', 'hide');
      }
    }
  )
}

//已处理图片区域展示
function showProcImg(imgInfo, fn) {

  if (processedImg != null) {
    //删除上一张图片
    deleteImg(processedImg, 1);
  }

  processedImg = imgInfo.imgName;

  //在视图中展示噪声图片
  let image = new Image();

  //展示图片加载完成
  image.onload = function () {
    //展示图片居中
    imgCenter(image, $('.processing-wrapper'));
    //显示图片信息
    $('.processing-name').html(imgInfo.type);
    $('.processing-size').html(image.width + ' × ' + image.height);
    //显示加噪成功的提示信息
    addHint('succeed', imgInfo.message);

    //回调
    fn && fn();
  }

  image.className = 'processing-img';
  image.src = cacehe_base_path + processedImg;
  $('.processing-wrapper').append(image);
}

//图片下载
function downloadImg(fileurl, filename) {
  // 创建隐藏的可下载链接
  var eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.style.display = 'none';
  eleLink.href = fileurl;
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}


//下拉框封装
function selectEvent(selectDom, fn) {
  //select 显示/隐藏
  $(selectDom + ' .select-set').bind('click', function () {
    $(selectDom).toggleClass('select-open');
  });

  //点击下拉框之外的区域隐藏select
  $('body').bind('click', function (event) {
    event = event || window.event;
    //若点击的元素不是目标元素，也不是目标元素的子元素
    if (!$(selectDom).is(event.target) && $(selectDom).has(event.target).length === 0) {
      //下拉框隐藏
      $(selectDom).removeClass('select-open');
    }
  });

  //select选项点击切换当前选项
  $(selectDom + ' .select-list').bind('click', function (event) {
    let e = event || window.event;
    if (e.target.tagName == 'LI') {
      $(selectDom + ' .select-set').attr('data-current-item', e.target.dataset.item);
      $(selectDom + ' .select-set span').html(e.target.innerHTML);

      $(selectDom).removeClass('select-open');
    }
    fn && fn(e.target);
  });
}

//按钮加载icon显示、隐藏
function loadIcon(btnDom, status) {
  let btnIcon = $(btnDom).find('i'),
    btnText = $(btnDom).find('span');

  if (status == 'show') {
    btnIcon.css('display', 'inline-block');
    btnText.css('display', 'none');
  } else if (status == 'hide') {
    btnIcon.css('display', 'none');
    btnText.css('display', 'inline-block');
  }
}

// 封装num-input
function numInput(el, config) {
  this.el = el;
  this.config = config || {
    min: 1,
    max: 10,
    step: 1,
    defaultVal: 1
  };
  let valEl = this.el.find('input');
  let minusEl = this.el.find('.minus');
  let addEl = this.el.find('.add');
  let _that = this;

  //初始化
  valEl.val(this.config.defaultVal);

  //绑定加、减事件
  minusEl.bind('click', function () {
    let currentVal = parseInt(valEl.val());
    if (currentVal <= _that.config.min) {
      return;
    }
    currentVal--;
    valEl.val(currentVal);
  });

  addEl.bind('click', function () {
    let currentVal = parseInt(valEl.val());
    if (currentVal >= _that.config.max) {
      return;
    }
    currentVal++;
    valEl.val(currentVal);
  });

}

//给底部提示栏添加信息(成功、错误、警告)
function addHint(status, message) {
  switch (status) {
    case 'error':   //错误状态
      $('.hint').attr('class', 'hint error');
      $('.hint i').attr('class', 'fa fa-exclamation-triangle');
      break;
    case 'warning':  //警告状态
      $('.hint').attr('class', 'hint warning');
      $('.hint i').attr('class', 'fa fa-info-circle');
      break;
    case 'succeed':  //成功状态
      $('.hint').attr('class', 'hint succeed');
      $('.hint i').attr('class', 'fa fa-check-circle');
      break;
    case 'empty':   //清空状态
      $('.hint').attr('class', 'hint');
      $('.hint i').attr('class', '');
  }

  $('.hint span').html(message);

}

//让图片水平、垂直居中展示
function imgCenter(oImg, imgBox) {
  let img_w = oImg.width,
    img_h = oImg.height,
    img_m_l = -img_w / 2,
    img_m_t = -img_h / 2,
    imgBox_w = imgBox.width(),
    imgBox_h = imgBox.height(),
    img_pre = img_w / img_h,
    img_w_pre = img_w / imgBox_w,
    img_h_pre = img_h / imgBox_h;

  //图片大小 < 容器时
  if (img_w_pre < 1 && img_h_pre < 1) {
    //设置img的左右margin
    oImg.style.marginLeft = img_m_l + 'px';
    oImg.style.marginTop = img_m_t + 'px';
    oImg.style.left = '50%';
    oImg.style.top = '50%';
  } else {
    //图片的宽占比 > 高占比
    if (img_w_pre >= img_h_pre) {
      oImg.width = imgBox_w;
      oImg.height = imgBox_w / img_pre;
      oImg.style.marginTop = (imgBox_h - oImg.height) / 2 + 'px';
    } else {
      //图片的宽占比 < 高占比
      oImg.height = imgBox_h;
      oImg.width = imgBox_h * img_pre;
      oImg.style.left = (imgBox_w - oImg.width) / 2 + 'px';
    }
  }
}