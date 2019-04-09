import cv2
import numpy as np

def imgMrophology(src, kernel, n, type):
  img = cv2.imread(src)
  kernel = np.ones((int(kernel), int(kernel)), np.uint8)
  if type == '0':
    """ 
      腐蚀
    """
    dst = cv2.erode(img, kernel, iterations = int(n))
  elif type == '1':
    """ 
      膨胀
    """
    dst = cv2.dilate(img, kernel, iterations = int(n))

  elif type == '2':
    """ 
      开运算
    """
    dst = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)

  elif type == '3':
    """ 
      闭运算
    """
    dst = cv2.morphologyEx(img ,cv2.MORPH_CLOSE, kernel)

  elif type == '4':
    """ 
      梯度运算
    """
    dst = cv2.morphologyEx(img, cv2.MORPH_GRADIENT, kernel)

  elif type == '5':
    """ 
      顶帽操作
    """
    dst = cv2.morphologyEx(img, cv2.MORPH_TOPHAT, kernel)
  elif type == '6':
    """ 
      黑帽操作
    """
    dst = cv2.morphologyEx(img, cv2.MORPH_BLACKHAT, kernel)
  return dst


""" newImg = imgMrophology('static/img/two.bmp', 10, 1, '3')
cv2.imshow('new', newImg)
cv2.waitKey() """