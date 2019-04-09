import cv2
import numpy as np

def imgThreshold(src, threshold_type, img_thresh):
  img = cv2.imread(src)
  if threshold_type == '0':
    type = cv2.THRESH_BINARY
  elif threshold_type == '1':
    type = cv2.THRESH_BINARY_INV
  elif threshold_type == '2':
    type = cv2.THRESH_TRUNC
  elif threshold_type == '3':
    type = cv2.THRESH_TOZERO_INV
  elif threshold_type == '4':
    type = cv2.THRESH_TOZERO

  retval, dst = cv2.threshold(img, int(img_thresh), 255, type)
  return dst

