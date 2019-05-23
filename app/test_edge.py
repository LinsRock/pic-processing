import cv2
import numpy as np


#分量法
# image = cv2.imread('static/img/lenna.bmp')
#
# width,height = image.shape[:2][::-1]
# grayImgR = np.zeros(image.shape, dtype=np.uint8)
# grayImgG = np.zeros(image.shape, dtype=np.uint8)
# grayImgB = np.zeros(image.shape, dtype=np.uint8)
#
# for i in range(height):
#     for j in range(width):
#         grayImgR[i, j] = image[i, j][0]
#         grayImgG[i, j] = image[i, j][1]
#         grayImgB[i, j] = image[i, j][2]
#
# cv2.imwrite('r.bmp', grayImgR)
# cv2.imwrite('g.bmp', grayImgG)
# cv2.imwrite('b.bmp', grayImgB)
# cv2.imshow('image', image)
# cv2.imshow('grayImg1', grayImgR)
# cv2.imshow('grayImg2', grayImgG)
# cv2.imshow('grayImg3', grayImgB)
# cv2.waitKey()


#平均值法
# image = cv2.imread('static/img/lenna.bmp')
#
# width,height = image.shape[:2][::-1]
# grayImg = np.zeros(image.shape, dtype=np.uint8)
#
# for i in range(height):
#     for j in range(width):
#         grayImg[i, j] = max(image[i, j][0], image[i, j][1], image[i, j][2])
#
#
# cv2.imshow('image', image)
# cv2.imshow('grayImg', grayImg)
# cv2.waitKey()


#最大值法
# image = cv2.imread('static/img/lenna.bmp')
#
# width,height = image.shape[:2][::-1]
# grayImg = np.zeros(image.shape, dtype=np.uint8)
#
# for i in range(height):
#     for j in range(width):
#         grayImg[i, j] = (image[i, j][0] + image[i, j][1] + image[i, j][2])/3
#
# cv2.imwrite('2.bmp', grayImg)
# cv2.imshow('image', image)
# cv2.imshow('grayImg', grayImg)
# cv2.waitKey()


#加权值法
image = cv2.imread('static/img/lenna.bmp')

width,height = image.shape[:2][::-1]
grayImg = np.zeros(image.shape, dtype=np.uint8)

for i in range(height):
    for j in range(width):
        grayImg[i, j] = 0.288 * image[i, j][0] + 0.57 * image[i, j][1] + 0.114 * image[i, j][2]

cv2.imwrite('3.bmp', grayImg)
cv2.imshow('image', image)
cv2.imshow('grayImg', grayImg)
cv2.waitKey()