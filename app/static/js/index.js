const MASTER_IMG_CLASS = '.master-img';
const MASTER_WRAP_CLASS = '.master-wrapper';
const PROCESSING_IMG_CLASS = '.processing-img';
const MESSAGE_DATA = {
  img_not_upload: '你还没有导入图片，请先导入图片！',
  img_upload_succ: '图像导入成功',
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
  img_edge_erroe: '图像边缘检测失败'
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
      $('.put-btn').addClass('disable-button');
      $('.put-btn-green').addClass('disable-button');
    } else {
      //弹出提示框提示是否要删除
      let isDel = confirm('确定需要删除已经处理的图片吗？');

      if (isDel) {
        //删除原图和处理后的图片
        deleteImg(currentImg, 0);
        deleteImg(processedImg, 1);

        //给按钮添加禁用状态
        $('.put-btn').addClass('disable-button');
        $('.put-btn-green').addClass('disable-button');
      }
    }
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
  if (!currentImg) {
    addHint('warning', MESSAGE_DATA.img_not_upload);
    return;
  }
});
$('.put-btn-green').bind('click', function () {
  if (!currentImg) {
    addHint('warning', MESSAGE_DATA.img_not_upload);
    return;
  }
});

//noise 应用按钮
$('.put-noise-btn').bind('click', function () {
  if (currentImg) {
    let noiseType = $('.noise-set-select').attr('data-current-item');
    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.put-noise-btn', 'show');
    //图片加噪
    addNoise(noiseType, function () {
      //图片加载完隐藏加载图标
      loadIcon('.put-noise-btn', 'hide');
    });
  }
});

//gray 应用按钮
$('.gray-btn').bind('click', function () {
  if (currentImg) {
    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.gray-btn', 'show');
    //图片灰度化
    imgGray(function () {
      //图片加载完隐藏加载图标
      loadIcon('.gray-btn', 'hide');
    });
  }
});

//threshold 应用按钮
$('.threshold-btn').bind('click', function () {
  if (currentImg) {
    let thresholdType = $('.threshold-set-select').attr('data-current-item');
    let thresh = $('.thresh-slider .value').html();
    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.threshold-btn', 'show');
    //阈值分割
    imgThreshold(thresholdType, thresh, function () {
      //图片加载完隐藏加载图标
      loadIcon('.threshold-btn', 'hide');
    });
  }
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

//图像滤波应用
$('.put-smoothing-btn').bind('click', function () {
  if (currentImg) {
    let filterType = $('.smoothing-set').attr('data-current-item');
    let nucleus = $('.smoothing-slider .value').html()
    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.put-smoothing-btn', 'show');
    //图像滤波
    imgFilter(filterType, nucleus, function () {
      //图片加载完隐藏加载图标
      loadIcon('.put-smoothing-btn', 'hide');
    });
  }
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

// 图像腐蚀应用
$('.put-erode-btn').bind('click', function () {
  if (currentImg) {
    let kernel = $('.erode-slider .value').html();
    let iteration = $('.erode-iteration .num').val();

    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.put-erode-btn', 'show');
    //图像腐蚀
    imgMorphology(kernel, iteration, 0, function () {
      //隐藏加载图标
      loadIcon('.put-erode-btn', 'hide');
    });
  }
});

//图像膨胀应用
$('.put-dilate-btn').bind('click', function () {
  if (currentImg) {
    let kernel = $('.dilate-slider .value').html();
    let iteration = $('.dilate-iteration .num').val();

    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.put-dilate-btn', 'show');
    //图像膨胀
    imgMorphology(kernel, iteration, 1, function () {
      //隐藏加载图标
      loadIcon('.put-dilate-btn', 'hide');
    });
  }
});

//图像形态学运算应用
$('.put-operation-btn').bind('click', function () {
  if(currentImg) {
    let kernel = $('.operation-slider .value').html();
    let type = $('.operation-set').attr('data-current-item');
  
    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.put-operation-btn', 'show');
    imgMorphology(kernel, null, type, function () {
      //隐藏加载图标
      loadIcon('.put-operation-btn', 'hide');
    });
  }
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

//梯度计算检测应用
$('.put-edge-btn').bind('click', function () {
  if(currentImg) {
    let operator = $('.radio-btn-wrap .current').attr('data-item');

    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.put-edge-btn', 'show');
    //梯度计算
    imgEdge(operator, null, null, function () {
      //隐藏加载图标
      loadIcon('.put-edge-btn', 'hide');
    });
  }
});

//canny边缘检测应用
$('.put-canny-btn').bind('click', function() {
  if(currentImg) {
    let minVal = $('.threshold-val1').val();
    let maxVal = $('.threshold-val2').val();

    //清空提示
    addHint('empty', '');
    //显示加载图标
    loadIcon('.put-canny-btn', 'show');
    //canny边缘检测
    imgEdge('canny', minVal, maxVal, function() {
      loadIcon('.put-canny-btn', 'hide');
    });
  }
});

/* -------------------- nav end ---------------------- */

/* -------------------- showImg ---------------------- */
//移入图片显示图片信息
$('.master-wrapper').bind('mouseenter', function () {
  $('.master-name').css('display', 'block');
  $('.master-size').css('display', 'block');
});

//移出图片隐藏图片信息
$('.master-wrapper').bind('mouseleave', function () {
  $('.master-name').css('display', 'none');
  $('.master-size').css('display', 'none');
});

//移入图片显示图片信息
$('.processing-wrapper').bind('mouseenter', function () {
  $('.processing-name').css('display', 'block');
  $('.processing-size').css('display', 'block');
});

//移出图片隐藏图片信息
$('.processing-wrapper').bind('mouseleave', function () {
  $('.processing-name').css('display', 'none');
  $('.processing-size').css('display', 'none');
});

/* --------------------- showImg end ------------------- */

//上传图片
function uploadImg(fileBtn, imgBox, fn) {
  const LOAD_IMG = 'file_img';
  let file = fileBtn.files[0];
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


//图片添加噪声
function addNoise(noiseType, fn) {
  $.post('/add_noise',
    {
      'noiseType': noiseType
    },
    function (data) {
      if (data.ok) {
        showProcImg({
          imgName: data.noiseName,
          type: '加入' + noiseType + '噪声的图片',
          message: MESSAGE_DATA.img_add_noise_succ
        }, fn);
      } else {
        addHint('error', MESSAGE_DATA.img_add_noise_error);
      }
    })
}

//图片灰度化
function imgGray(fn) {
  $.post(
    '/gray',
    {},
    function (data) {
      if (data.ok) {
        showProcImg({
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
function imgThreshold(thresholdType, thresh, fn) {
  $.post(
    '/threshold',
    {
      'thresholdType': thresholdType,
      'thresh': thresh
    },
    function (data) {
      if (data.ok) {
        showProcImg({
          imgName: data.thresholdName,
          type: '阈值化后的图片',
          message: MESSAGE_DATA.img_threshold_succ
        }, fn);
      } else {
        addHint('error', MESSAGE_DATA.img_threshold_error);
      }
    }
  )
}

//图片滤波
function imgFilter(filterType, nucleus, fn) {
  $.post(
    '/smooth',
    {
      'filterType': filterType,
      'nucleus': nucleus
    },
    function (data) {
      //滤波成功
      if (data.ok) {
        showProcImg({
          imgName: data.filterImgName,
          type: filterType + '滤波后的图片',
          message: MESSAGE_DATA.img_filter_succ
        }, fn)
      } else {
        addHint('error', MESSAGE_DATA.img_filter_error)
        loadIcon('.put-smoothing-btn', 'hide');
      }
    }
  )
}

// 图像形态学处理
function imgMorphology(kernel, iterations, type, fn) {
  $.post(
    '/morphology',
    {
      'kernel': kernel,
      'iterations': iterations,
      'type': type
    },
    function (data) {
      if (data.ok) {
        showProcImg({
          imgName: data.morphologyName,
          type: '形态学处理后的图片',
          message: MESSAGE_DATA.img_morphology_succ
        }, fn);
      } else {
        addHint('error', MESSAGE_DATA.img_filter_error)
        loadIcon('.put-btn', 'hide');
      }
    }
  )
}

// 图像边缘检测
function imgEdge(operator, val1, val2, fn) {
  $.post(
    '/edge',
    {
      'operator': operator,
      'minVal': val1,
      'maxVal': val2
    },
    function (data) {
      if (data.ok) {
        showProcImg({
          imgName: data.edgeName,
          type: operator + '算子检测的边缘图片',
          message: MESSAGE_DATA.img_edge_succ
        }, fn);
      } else {
        addHint('error', MESSAGE_DATA.img_edge_erroe);
        loadIcon('put-edge-btn', 'hide');
      }
    }
  )
}

//已处理图片区域展示
function showProcImg(imgInfo, fn) {
  const cacehe_base_path = '../static/cache-img/';

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
  if (status == 'show') {
    $(btnDom + ' i').css('display', 'inline-block');
    $(btnDom + ' span').css('display', 'none');
  } else if (status == 'hide') {
    $(btnDom + ' i').css('display', 'none');
    $(btnDom + ' span').css('display', 'inline-block');
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