import cv2
import numpy as np

def imgFilter(src, filterType, nucleus):
  print(filterType)
  img = cv2.imread(src)
  nucleus = int(nucleus)
  if filterType == 'blur':
    """ 
      均值滤波
    """
    img = cv2.blur(img, (nucleus, nucleus))
  
  elif filterType == 'boxFilter':
    """ 
      方框滤波
    """
    img = cv2.boxFilter(img, -1, (nucleus, nucleus), True)

  elif filterType == 'gaussian':
    """ 
      高斯滤波
    """
    img = cv2.GaussianBlur(img, (nucleus, nucleus), 0)

  elif filterType == 'median':
    """ 
      中值滤波
    """
    img = cv2.medianBlur(img, nucleus)

  return img
