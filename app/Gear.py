import cv2
import numpy as np

""" 
针对标准直齿圆柱齿轮的参数测量
"""
class GearDetection(object):
  def __init__(self, src, gain_factor):
    self.src = src
    self.gain_factor = gain_factor

  def run(self):
    #原图
    image = cv2.imread(self.src)

    #中值滤波，降噪
    blur_img = cv2.medianBlur(image, 5)

    #Canny边缘检测，提取齿轮边缘
    edge_img = cv2.Canny(blur_img, 50, 150)

    #对齿轮边缘进行形态学闭运算，修复断裂的齿轮外轮廓
    kernel = np.ones((3, 3), np.uint8)
    close_edge_img = cv2.morphologyEx(edge_img, cv2.MORPH_CLOSE, kernel)

    #检索齿轮轮廓，检索图像的外轮廓 cv2.RETR_EXTERNAL
    contours, hierarchy = cv2.findContours(close_edge_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    #筛选出齿轮外轮廓，去除干扰轮廓
    gear_contour, gear_contour_img = self.filter_gear_contour(close_edge_img, contours)

    #填充轮廓
    fill_img = self.fill_contour(gear_contour_img)

    #齿轮的中心及齿顶圆检测
    gear_center, maxRadius, center_img = self.get_gear_center(gear_contour, image)

    #齿轮齿根圆检测
    minRadius, dedendum_img = self.get_dedendum_circle(gear_contour, gear_center, center_img)

    #齿数检测
    r = int((maxRadius + minRadius) / 2)
    self.teeth_num = self.get_teeth_number(fill_img, gear_center, r, center_img)

    print(maxRadius)
    print(minRadius)
    #将齿顶圆、齿根圆半径从像素值转换成mm
    self.Ra = np.round(maxRadius * self.gain_factor, 4)  #齿顶圆测量值
    self.Rf = np.round(minRadius * self.gain_factor, 4)  #齿根圆测量值
    
    #齿轮其它参数计算
    self.m, self.r, self.p, self.ha, self.hf = self.get_gear_other_parameter(self.Ra, self.Rf, self.teeth_num, self.gain_factor)

    #标记图片
    self.mark_img = center_img

    #画分度圆
    self.mark_img = cv2.circle(self.mark_img, gear_center, int(self.r / self.gain_factor), (0, 255, 0), 1)

    return self.Ra, self.Rf, self.teeth_num, self.m, self.r, self.p, self.ha, self.hf
   

  def get_mark_img(self):
    """ 
      返回标记图片
    """
    return self.mark_img

  def filter_gear_contour(self, img, cnts):
    """ 
      过滤干扰轮廓，提取齿轮外轮廓
      输入：
        img：需过滤轮廓图片
        cnts：图片中提取的轮廓
      返回：
        max_area_cnt：最外层轮廓
        img：齿轮外轮廓图
    """
    img = np.zeros(img.shape, dtype=np.uint8) 
    #找出其中轮廓面积最大的轮廓
    max_area = 0
    for cnt in cnts:
      area = cv2.contourArea(cnt)
      if area >= max_area:
        max_area_cnt = cnt
        max_area = area
    #绘制最大的轮廓（齿轮外轮廓）
    cv2.drawContours(img, [max_area_cnt], -1, (255, 255, 255), 2)

    return max_area_cnt, img

  def fill_contour(self, img):
    """ 
      对轮廓进行填充
    """
    img = img.copy()
    h, w = img.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    #以图片中心为种子点
    seed_point = (int(w / 2), int(h / 2))
    cv2.floodFill(img, mask, seed_point, (255, 255, 255), None, None, 8) #对轮廓内填充白色
    return img

  def get_gear_center(self, gear_contour, img):
    """ 
      齿轮中心检测
      返回数据：
        center：齿轮中心点坐标
        maxRadius：齿轮齿顶圆半径
        copyImg：绘制后的图像
    """
    copyImg = img.copy()
    #copyImg = cv2.cvtColor(copyImg, cv2.COLOR_GRAY2BGR)
    #hough变换法
    # #使用Hough变换的圆检测法
    # circles = cv2.HoughCircles(img, cv2.HOUGH_GRADIENT, 1, 100, param1=100, param2=120, minRadius=0, maxRadius=1000)
    # print(circles)
    # circles = np.uint16(np.around(circles))

    # for i in circles[0, :]:
    #     cv2.circle(copyImg, (i[0], i[1]), i[2], (0, 255, 0), 2)
    #     cv2.circle(copyImg, (i[0], i[1]), 2, (0, 0, 255), 3)

    """ 使用最小外接圆和最小边界矩形合成法 """
    #最小边界矩形检测中心
    rect = cv2.minAreaRect(gear_contour)
    #当成齿顶圆半径
    maxRadius = int((rect[1][0] + rect[1][1]) / 4)
  
    rectCenter = (int(rect[0][0]), int(rect[0][1])) #最小边界矩形的中心
  
    box = cv2.boxPoints(rect) #最小边界矩形的四个角点坐标
    box = np.int0(box)

    #最小外接圆检测中心
    (x, y), radius = cv2.minEnclosingCircle(gear_contour)
    circleCenter = (int(x), int(y))

    radius = int(radius)

    #算术平均法计算最终中心
    #center = (int((rectCenter[0] + circleCenter[0]) / 2), int((rectCenter[1] + circleCenter[1]) / 2))
    center = (int(rectCenter[0]), int(rectCenter[1]))

    #最小边界矩形绘制 红色
    # cv2.drawContours(copyImg, [box], 0, (0, 0, 255), 2)
    # opyImg = cv2.circle(copyImg, rectCenter, 2, (0, 0, 255), 2)

    #最小外接圆绘制 绿色
    # copyImg = cv2.circle(copyImg, circleCenter, 2, (0, 255, 0), 2)
    # copyImg = cv2.circle(copyImg, circleCenter, radius, (0, 255, 0), 2)

    #最终中心点的绘制 蓝色
    copyImg = cv2.circle(copyImg, center, 2, (255, 0, 0), 2)
    
    #齿顶圆绘制 红色
    #copyImg = cv2.circle(copyImg, center, maxRadius, (0, 0, 255), 2)


    return center, maxRadius, copyImg

  def get_dedendum_circle(self, gear_contour, center, img):
    """ 
      齿轮齿根圆检测
    """
    minR = np.sqrt(np.square(gear_contour[0][0][0] - center[0]) + np.square(gear_contour[0][0][1] - center[1]))
    
    #外轮廓点到中心点的距离，取最小值作为齿根圆半径
    for i in gear_contour:
      for j in i:
        rLen = np.sqrt(np.square(j[0] - center[0]) + np.square(j[1] - center[1]))
        minR = min(minR, rLen)

    minRadius = int(minR)
    img = cv2.circle(img, center, minRadius, (255, 0, 0), 2)

    return minRadius, img

  def get_teeth_number(self, img, center, radius, mark_img):
    """ 
      齿轮齿数检测
      输入：
        img：轮廓填充图像
        center：齿轮的中心点坐标
        radius：掩膜处理模板圆的半径
      返回：
        teeth_num：齿数
    """
    #创建圆形区域（用于掩膜处理）
    circle = np.zeros(img.shape, dtype=np.uint8)
    mask = cv2.bitwise_not(circle)
    cv2.circle(mask, center, radius, (0, 0, 0), -1)

    #掩膜处理
    image = cv2.add(img, circle, mask=mask)

    #连通区域分析
    contours, hierarchy = cv2.findContours(image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    #齿数
    teeth_num = len(contours)

    # copyImg = image.copy()
    #copyImg = cv2.cvtColor(copyImg, cv2.COLOR_GRAY2BGR)
    cv2.drawContours(circle, contours, -1, (255, 255, 255), 1)

    return teeth_num

  def get_gear_other_parameter(self, Ra, Rf, z, gain_factor):
    """ 
      计算齿轮模数m、分度圆半径r、齿距p
      返回
      m：模数
      r：分度圆半径
      p：齿距
    """
    #模数计算
    #标准模数第一系列
    first_series = [0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.25, 1.5,
                  2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 32, 40, 50]

    #初步计算出模数
    m = (Ra - Rf) / 2.25
    if m < 1:
      m = (Ra - Rf) / 2.35
    
    #从第一系列中选取标准模数
    for i in range(len(first_series)):
      if first_series[i] >=  m:
        if i > 0:
          if (first_series[i] - m) < (m - first_series[i - 1]):
            m = first_series[i]
          else:
            m = first_series[i-1]
        elif i == 0:
          m = first_series[0]
        break

    #计算分度圆半径，保留3位小数
    r = np.round(m * z / 2, 3)

    #计算齿距
    p = np.round(np.pi * m, 3)

    #计算齿顶高、齿根高
    ha = np.round(Ra - r, 3)
    hf = np.round(r - Rf, 3)

    return m, r, p, ha, hf

# gear = GearDetection('static/img/part13.jpg', 0.1956)
# gear_parameters = gear.run()
# print(gear_parameters)
# mark_img = gear.get_mark_img()

# cv2.imshow('mark_img', mark_img)
# cv2.waitKey()