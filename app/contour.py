import cv2
import numpy as np

def imgContour(src, feature, arg):
  img = cv2.imread(src)
  gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
  ret, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
  mode = cv2.RETR_TREE
 
  if arg == 'outer':
    mode = cv2.RETR_EXTERNAL

  contours, hierarchy = cv2.findContours(binary, mode, cv2.CHAIN_APPROX_SIMPLE)
  cnt = contours[0]
  copyImg = img.copy()
  if feature == 'allContours':
    cv2.drawContours(copyImg, contours, -1, (0, 255, 0), 3)

  elif feature == 'approx':
    '''
      轮廓近似
    '''
    #epsilon = 0.1 * cv2.arcLength(cnt, True)
    #epsilon = int(arg)
    epsilon = img.shape[0]/32
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    cv2.polylines(copyImg, [approx], True, (0, 255, 0), 2)

  elif feature == 'convex':
    '''
      凸包
    '''
    hull = cv2.convexHull(cnt)
    cv2.polylines(copyImg, [hull], True, (0, 255, 0), 2)

  elif feature == 'bounding':
    '''
      边界矩形
    '''
    x, y, w, h = cv2.boundingRect(cnt)
    copyImg = cv2.rectangle(copyImg, (x, y), (x + w, y + h), (0, 255, 0), 2)

  elif feature == 'minRect':
    '''
      最小边界矩形
    '''
    rect = cv2.minAreaRect(cnt)
    box = cv2.boxPoints(rect)
    box = np.int0(box)
    cv2.drawContours(copyImg, [box], 0, (0, 0, 255), 3)

  elif feature == 'minCircle':
    (x, y), radius = cv2.minEnclosingCircle(cnt)
    center = (int(x), int(y))
    radius = int(radius)
    copyImg = cv2.circle(copyImg, center, 2, (0, 0, 255), 3)
    copyImg = cv2.circle(copyImg, center, radius, (255, 0, 0), 3)

  elif feature == 'ellipse':
    ellipsis = cv2.fitEllipse(cnt)
    copyImg = cv2.ellipse(copyImg, ellipsis, (255, 0, 0), 2)

  return copyImg
  

""" newImg = imgContour('static/img/part5.jpg', 'approx', '10')
cv2.imshow('now', newImg)
cv2.waitKey()
 """