import cv2
import numpy as np
from matplotlib import pyplot as plt
import time
import os

# a = cv2.imread('static/chess2/chess3.jpg')
# b = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
# #提取角点信息
# ret, corners = cv2.findChessboardCorners(a, (6, 4), None)
# print(len(corners))
#
# #迭代的终止条件
# criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.01)
# #提取亚像素角点信息
# corners2 = cv2.cornerSubPix(b, corners, (11, 11), (-1, -1), criteria)
# #画出角点
# cv2.drawChessboardCorners(a, (6, 4), corners, True)
# #cv2.namedWindow('winname', cv2.WINDOW_NORMAL)
# #cv2.imwrite('3.jpg', a)
# cv2.imshow('img', a)
# cv2.waitKey()


# path = 'static/chess2'
# objp = np.zeros((6 * 4, 3), np.float32)
# objp[:, :2] = np.mgrid[0:6, 0:4].T.reshape(-1, 2) * 10
# op = []
# imgpoints = []
# for i in os.listdir(path):
#     file = '/'.join((path, i))
#     print(file)
#     a = cv2.imread(file)
#     b = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
#     ret, corners = cv2.findChessboardCorners(a, (6, 4), None)
#     criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.01)
#     if ret == True:
#         # 提取亚像素角点信息
#         corners2 = cv2.cornerSubPix(b, corners, (11, 11), (-1, -1), criteria)
#         imgpoints.append(corners2)
#         op.append(objp)
#         # 画出角点
#         #cv2.drawChessboardCorners(a, (6, 4), corners2, True)

# ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(op, imgpoints, b.shape[::-1], None, None)
# print(ret)
# print(mtx)
# print(len(rvecs), rvecs[0])
# print(len(tvecs), rvecs[0])

# '''
# 评价标定结果的指标
# '''
# tot_error = 0
# for i in range(len(op)):
#     imgpoints2, _ = cv2.projectPoints(op[i], rvecs[i], tvecs[i], mtx, dist)
#     error = cv2.norm(imgpoints[i], imgpoints2, cv2.NORM_L2) / len(imgpoints2)
#     tot_error += error

# print(tot_error / 15)

# '''
# 校正部分
# '''
# h, w = a.shape[:2]
# newcameramtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (h, w), 1)
# dst = cv2.undistort(a, mtx, dist, None)

# mapx, mapy = cv2.initUndistortRectifyMap(mtx, dist, None, newcameramtx, (w, h), 5)
# dst = cv2.remap(a, mapx, mapy, cv2.INTER_LINEAR)

# #x, y, w, h = roi
# #dst = dst[y:y + h, x:x + w]

# a = cv2.cvtColor(a, cv2.COLOR_BGR2RGB)
# dst = cv2.cvtColor(dst, cv2.COLOR_BGR2RGB)

# plt.subplot(121), plt.imshow(a), plt.title('source')
# plt.subplot(122), plt.imshow(dst), plt.title('undistorted')
# plt.show()

class Cailbration(object):
    # def __init__(self, height):
    #     self.height = height

    def gaugeCailbration(self, src):
        img = cv2.imread(src)
        # 灰度化
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # 二值化
        res, dst = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY)
        # 形态学开运算
        kernel = np.ones((10, 10), np.uint8)
        dst = cv2.morphologyEx(dst, cv2.MORPH_OPEN, kernel)
        # 最小边界矩形
        contours, hierarchy = cv2.findContours(
            dst, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        cnt = contours[0]
        rect = cv2.minAreaRect(cnt)
        box = cv2.boxPoints(rect)
        box = np.int0(box)
        dst = cv2.cvtColor(dst, cv2.COLOR_GRAY2BGR)
        cv2.drawContours(dst, [box], 0, (0, 0, 255), 3)
        px_len = (rect[1][0] + rect[1][1]) / 2
        mm_len = 72
        scale = np.round(mm_len / px_len, 4)
        return scale, dst

    def plateCailbration(self, m, n, width, h):
        path = 'app/static/plate_cailbration_imgs'
        m = m - 1
        n = n - 1
        objp = np.zeros((m * n, 3), np.float32)
        objp[:, :2] = np.mgrid[0:m, 0:n].T.reshape(-1, 2) * 10
        op = []
        imgpoints = []
        for i in os.listdir(path):
            file = '/'.join((path, i))
            print(file)
            a = cv2.imread(file)
            b = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
            ret, corners = cv2.findChessboardCorners(a, (m, n), None)
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, width, 0.01)
            if ret == True:
                # 提取亚像素角点信息
                corners2 = cv2.cornerSubPix(b, corners, (11, 11), (-1, -1), criteria)
                imgpoints.append(corners2)
                op.append(objp)
                # 画出角点
                #cv2.drawChessboardCorners(a, (6, 4), corners2, True)

        ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(op, imgpoints, b.shape[::-1], None, None)

        coeff = np.round(h / mtx[0][0], 4)
        print(coeff)

        # '''
        # 评价标定结果的指标
        # '''
        # tot_error = 0
        # for i in range(len(op)):
        #     imgpoints2, _ = cv2.projectPoints(op[i], rvecs[i], tvecs[i], mtx, dist)
        #     error = cv2.norm(imgpoints[i], imgpoints2, cv2.NORM_L2) / len(imgpoints2)
        #     tot_error += error
        #
        # print(tot_error / 15)

        return coeff

# cail = Cailbration()
# cail.plateCailbration(7, 5, 40, 200)

#scale, img = cail.imgCailbration('static/img/gauge1.jpg')
#print(scale)
# cv2.imshow('img', img)
# cv2.waitKey()
