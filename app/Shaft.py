import cv2
import numpy as np

class ShaftDetection(object):
  def __init__(self, src, coeff):
    self.src = src
    self.coeff= coeff

  def run(self):
    image = cv2.imread(self.src)
    #灰度化
    gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    #中值滤波
    blur_img = cv2.medianBlur(gray_img, 7)
    #二值化
    retval, binary = cv2.threshold(blur_img, 45, 255, cv2.THRESH_BINARY_INV)
    #Canny边缘检测
    edge_img = cv2.Canny(binary, 100, 200)
    #对轴的轮廓进行提取
    contours, hierarchy = cv2.findContours(edge_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnt = contours[0]
    #通过对轮廓点的计算，找出每个轴段的分隔点
    shaft_shoulder = self.getShaftShoulder(cnt)

    # 对不同轴段的轴进行尺寸测量，得到像素尺寸
    copyImg = image.copy()
    shaft_size = []
    for i in range(len(shaft_shoulder) - 1):
      img, size, point = self.maskShaft(edge_img, shaft_shoulder[i][1], shaft_shoulder[i+1][1])
      cv2.putText(copyImg, str(i+1), (int((point[0][0] + point[1][0])/2 - 6), int((point[0][1] + point[1][1])/2)), cv2.FONT_HERSHEY_PLAIN, 2.0, (0, 0, 255), 1)
      cv2.rectangle(copyImg, point[0], point[1], (0, 255, 0))
      shaft_size.append((np.round(size[0] * self.coeff, 4), np.round(size[1] * self.coeff, 4)))

    return copyImg, shaft_size

  def maskShaft(self, img, top, bottom):
    #掩膜
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    mask[top:bottom, 0:img.shape[1]] = 255
    #得到其中一段轴
    img = cv2.add(img, np.zeros(np.shape(img), dtype=np.uint8), mask=mask)
    #获取轴的外轮廓
    contours, hierarchy = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    #合并多个断裂的轮廓
    cnt = np.vstack((contours[:]))

    #找到轴的一组对角点
    min_point = max_point = cnt[0,:,:][0][0] + cnt[0,:,:][0][1]

    for item in cnt:
      x = item[:,0][0]
      y = item[:,1][0]
      #找到左上角点
      if (x + y) <= min_point:
        min_point = x + y
        l_t_point = (x, y)
      #找到右下角点
      if (x + y) >= max_point:
        max_point = x + y
        r_b_point = (x, y)
    shaft_size = (r_b_point[0] - l_t_point[0], r_b_point[1] - l_t_point[1])

    return img, shaft_size, [l_t_point, r_b_point]

  def getShaftShoulder(self, cnt):
    compare_point = cnt[0,:,:][0]
    TH_VALUE = 10
    
    shaft_shoulder = []
    arr_y = [x[0, :][1] for x in cnt]
    for item in cnt:
      x = item[:,0][0]
      y = item[:,1][0]
      #让外轮廓点和左上角点做比较，x或y坐标变化超过阈值的记为轴段变化
      x_diff = abs(x - compare_point[0])
      y_diff = abs(y - compare_point[1])
      if x_diff >= TH_VALUE and y_diff >= TH_VALUE:
        shaft_shoulder_y = [y[1] for y in shaft_shoulder]
        some_num = [x for x in shaft_shoulder_y if abs(x - y) < 10]
        if arr_y.count(y) >= 3 and len(some_num) == 0:
          shaft_shoulder.append((x, y))
          #找到角点
          compare_point = (x, y)
    shaft_shoulder.sort(key=lambda x:x[1])
    return shaft_shoulder

# img, size = ShaftDetection('static/img/part15.jpg',0.244).run()
# print(size)