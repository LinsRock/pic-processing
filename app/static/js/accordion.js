// 手风琴菜单封装
function Accordion(el, multiple) {
  this.el = el || {};
  this.multiple = multiple || false;

  // 所有的link
  var links = this.el.find('.link');
  // 添加点击事件
  links.bind('click', {'el': this.el, 'multiple': this.multiple}, this.dropdown);
}

Accordion.prototype.dropdown = function(e) {
  var $el = e.data.el,
      $this = $(this),
      $next = $this.next();

  $next.slideToggle();
  $this.parent().toggleClass('open');

  if (!e.data.multiple) {
      $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
  };
}