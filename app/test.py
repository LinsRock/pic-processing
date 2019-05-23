# import cv2
#
# cap =cv2.VideoCapture(0, cv2.CAP_DSHOW)
# print(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
# print(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
#
# cap.set(3, 700)
# cap.set(4, 700)
#
# print(cap.get(3))
# print(cap.get(4))
# while(cap.isOpened()):
#     ret, frame = cap.read()
#     if ret == True:
#
#         gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#         cv2.imshow('frame', gray)
#
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
#     else:
#         break
#
# cap.release()
# cv2.destroyAllWindows()

import cv2
import numpy as np
from Gear import GearDetection

gear = GearDetection('static/img/part7.jpg')
gear_parameters = gear.run()
print(gear_parameters)
mark_img = gear.get_mark_img()
cv2.imshow('mark_img', mark_img)
cv2.waitKey()

def draw_contour(img):
    # gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # ret, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
    # 轮廓检索
    #copyImg = img.copy()
    contours, hierarchy = cv2.findContours(img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    # 绘制轮廓
    #cv2.drawContours(copyImg, contours, -1, (0, 255, 0), 3)
    return img

def draw_approx_hull_polygon(img, cnts):
    # img = np.copy(img)
    img = np.zeros(img.shape, dtype=np.uint8)

    min_side_len = img.shape[0] / 32  # 多边形边长的最小值 the minimum side length of polygon
    min_poly_len = img.shape[0] / 16  # 多边形周长的最小值 the minimum round length of polygon
    min_side_num = 3  # 多边形边数的最小值
    min_area = 16.0  # 多边形面积的最小值
    approxs = [cv2.approxPolyDP(cnt, min_side_len, True) for cnt in cnts]  # 以最小边长为限制画出多边形
    approxs = [approx for approx in approxs if cv2.arcLength(approx, True) > min_poly_len]  # 筛选出周长大于 min_poly_len 的多边形
    approxs = [approx for approx in approxs if len(approx) > min_side_num]  # 筛选出边长数大于 min_side_num 的多边形
    #approxs = [approx for approx in approxs if cv2.contourArea(approx) > min_area]  # 筛选出面积大于 min_area_num 的多边形
    # Above codes are written separately for the convenience of presentation.

    #hulls = [cv2.convexHull(cnt) for cnt in cnts]
    #cv2.polylines(img, hulls, True, (0, 0, 255), 2)  # red

    return img

def fillHole(src):
    '''
    针对二值图像的孔洞填充
    '''
    #灰度化
    #img_in = cv2.imread(src, cv2.IMREAD_GRAYSCALE)
    img_in = cv2.imread(src)
    #二值化
    #th, img_th = cv2.threshold(img_in, 200, 255, cv2.THRESH_BINARY_INV)
    #canny边缘检测
    img_th = cv2.Canny(img_in, 100, 120)
    cv2.imshow('canny', img_th)
    #轮廓检索
    contours, hierarchy = cv2.findContours(img_th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    #绘制
    copyImg = img_in.copy()
    #cv2.drawContours(copyImg, contours, -1, (0, 255, 0), 3)
    #cv2.imshow('img_th', copyImg)

    filter_img = draw_approx_hull_polygon(copyImg, contours)
    cv2.imshow('filter_img', filter_img)

    #膨胀
    kernel = np.ones((int(9), int(9)), np.uint8)
    dst = cv2.dilate(img_th, kernel, iterations=1)
    #腐蚀
    img_th = cv2.erode(dst, kernel, iterations=1)

    #img_th = cv2.adaptiveThreshold(dst, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2)

    #中值滤波
    #img_th = cv2.medianBlur(img_th, 11)

    im_floodfill = img_th.copy()

    h, w = img_th.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    #从像素点(0, 0)填充颜色
    cv2.floodFill(im_floodfill, mask, (0, 0), 255, None, None, 8)

    #反转图像颜色
    im_floodfill_inv = cv2.bitwise_not(im_floodfill)

    #合成前景图像
    img_out = img_th | im_floodfill_inv

    return img_out


# newImg = fillHole("static/img/part7.jpg")
# cv2.imshow("Foreground", newImg)
# cv2.waitKey(0)

def getCenter(src):
    img = cv2.imread(src, cv2.IMREAD_GRAYSCALE)
    img = cv2.medianBlur(img, 9)
    cimg = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    circles = cv2.HoughCircles(img, cv2.HOUGH_GRADIENT, 1, 100, param1=100, param2=100, minRadius=0, maxRadius=500)

    circles = np.uint16(np.around(circles))


    for i in circles[0, :]:
        #画圆
        #cv2.circle(cimg, (i[0], i[1]), i[2], (0, 255, 0), 2)
        #画圆心
        #cv2.circle(cimg, (i[0], i[1]), 2, (0, 0, 255), 3)
        center = [i[0], i[1]]

    return center
    #cv2.imshow('img', cimg)
    #cv2.waitKey(0)


# #获取填充图形
# newImg = fillHole("static/img/part9.jpg")
# copyImg = cv2.imread('static/img/part9.jpg')
# #获取图形的外轮廓
# contours, hierarchy = cv2.findContours(newImg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
# cnt = contours[0]
#
# cv2.imshow('new', newImg)
#
# (x, y), radius = cv2.minEnclosingCircle(cnt)
# center = (int(x), int(y))
# radius = int(radius)
#
# #绘制外轮廓
# cv2.drawContours(copyImg, contours, -1, (0, 255, 0), 2)
#
# #获取轮廓的中心点
# cenPoint = getCenter('static/img/part9.jpg')
#
# print(contours)
# #获得外轮廓到中心点的最大和最小距离
# minR = np.sqrt(np.square(contours[0][0][0][0] - cenPoint[0]) + np.square(contours[0][0][0][1] - cenPoint[1]))
# maxR = minR
# for x in contours:
#     for i in x:
#         for j in i:
#             len = np.sqrt(np.square(j[0] - cenPoint[0]) + np.square(j[1] - cenPoint[1]))
#
#             maxR = max(maxR, len)
#             minR = min(minR, len)
#
#
# minR = int(minR)
# maxR = int(maxR)
# print(minR)
# print(maxR)
# cenPoint = (cenPoint[0], cenPoint[1])
# copyImg = cv2.circle(copyImg, cenPoint, maxR, (0, 255, 0), 2)
# copyImg = cv2.circle(copyImg, cenPoint, minR, (255, 0, 0), 2)
#
# copyImg = cv2.circle(copyImg, cenPoint, 2, (0, 0, 255), 2)
# #copyImg = cv2.circle(copyImg, center, radius, (255, 0, 0), 2)
# cv2.imshow('copy', copyImg)
# cv2.waitKey(0)