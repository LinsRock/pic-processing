import cv2
import numpy as np

def imgEdge(src, operator, min, max):
  img = cv2.imread(src)
  if operator == 'sobel':
    """ 
      Sobel算子
      细节一般
    """
    sobelx = cv2.Sobel(img, cv2.CV_64F, 1, 0)
    sobely = cv2.Sobel(img, cv2.CV_64F, 0, 1)
    #修正
    sobelx = cv2.convertScaleAbs(sobelx)
    sobely = cv2.convertScaleAbs(sobely)
    #合成
    sobelxy = cv2.addWeighted(sobelx, 0.5, sobely, 0.5, 0)
    return sobelxy

  elif operator == 'scharr':
    """ 
      Scharr算子
      精度最高，细节最多
    """
    scharrx = cv2.Scharr(img, cv2.CV_64F, 1, 0)
    scharry = cv2.Scharr(img, cv2.CV_64F, 0, 1)
    #修正
    scharrx = cv2.convertScaleAbs(scharrx)
    scharry = cv2.convertScaleAbs(scharry)
    #合成
    scharrxy = cv2.addWeighted(scharrx, 0.5, scharry, 0.5, 0)
    return scharrxy

  elif operator == 'laplacian':
    """ 
      Laplacian算子
      边界最平滑，细节较少
    """
    dst = cv2.Laplacian(img, cv2.CV_64F)
    #修正
    dst = cv2.convertScaleAbs(dst)
    return dst

  elif operator == 'canny':
    """ 
      canny边缘检测
      阈值越小，细节越多；阈值越大，细节越少
    """
    dst = cv2.Canny(img, int(min), int(max))
    return dst


""" newImg1 = imgEdge('static/img/part2.png', 'canny', 200, 100)
newImg2 = imgEdge('static/img/part2.png', 'canny', 60, 60)
cv2.imshow('img1', newImg1)
cv2.imshow('img2', newImg2)
cv2.waitKey() """