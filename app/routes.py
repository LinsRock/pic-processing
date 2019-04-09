from flask import render_template, request, jsonify
from app import app
import os
import cv2
from werkzeug.utils import secure_filename
from app.noise import addNoise
from app.thresholdSeg import imgThreshold
from app.smooth import imgFilter
from app.morphology import imgMrophology
from app.edge import imgEdge
from app.pathUtil import Pic_name

#os.path.abspath() 
UPLOAD_BASE_PATH = os.path.dirname(__file__) + '/static/upload-img/'       #存放上传图片的路径
CACEHE_BASE_PATH = 'app/static/cache-img/'                                     #存入处理图片缓存的路径
active_img_name = ''
processed_img_name = ''

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

#上传图片
@app.route('/upload', methods=['POST'])
def change_img():
  global UPLOAD_BASE_PATH
  global active_img_name
  loadImg = request.files.get('file_img')                     #接收上传的图片文件
  ext = secure_filename(loadImg.filename).rsplit('.', 1)[1]
  active_img_name = Pic_name().create_uuid() + '.' + ext      #生成唯一的文件名
  loadImgPath = UPLOAD_BASE_PATH + active_img_name                   #上传图片的存入地址
  loadImg.save(loadImgPath)                                   #保存上传图片
  return jsonify({'ok': True,'message': '图片上传成功','imgName': active_img_name})

#删除图片
@app.route('/delete', methods=['POST'])
def delete_img():
  global active_img_name
  global processed_img_name
  delFileName = request.form.get('imgName')
  delFileType = request.form.get('imgType')
  if delFileType == '0':
    delFilePath = UPLOAD_BASE_PATH + delFileName
    active_img_name = ''
  else:
    delFilePath = os.path.dirname(__file__) + '/static/cache-img/' + delFileName
    processed_img_name = ''

  if delFilePath:
    os.remove(delFilePath)
    return jsonify({'ok': True, 'message': '文件已删除'})
  else:
    return jsonify({'ok': False, 'message': '文件删除失败'})


#添加噪声
@app.route('/add_noise', methods=['POST'])
def add_noise():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  noise_type = request.form.get('noiseType')
  if active_img_name:
    noise_path = UPLOAD_BASE_PATH + active_img_name
    noise_img = addNoise(noise_path, noise_type)
    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, noise_img)
    return jsonify({'ok': True, 'message': '图片加噪成功', 'noiseName': processed_img_name})
  else:
    return jsonify({'ok': False, 'message': '图片加噪声失败'})

#图片灰度化
@app.route('/gray', methods=['POST'])
def img_gray():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  print(active_img_name)
  if active_img_name:
    gray_path = UPLOAD_BASE_PATH + active_img_name
    active_img = cv2.imread(gray_path)
    gray_img = cv2.cvtColor(active_img, cv2.COLOR_BGR2GRAY)
    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, gray_img)
    return jsonify({'ok': True, 'message': '图片灰度化成功', 'grayName': processed_img_name})
  else:
    jsonify({'ok': False, 'message': '图片灰度化失败'})

#图片阈值分割
@app.route('/threshold', methods=['POST'])
def img_threshold():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  threshold_type = request.form.get('thresholdType')
  img_thresh = request.form.get('thresh')
  if processed_img_name or active_img_name:
    if processed_img_name:
      processed_img_path = os.path.dirname(__file__) + '/static/cache-img/' + processed_img_name
      htreshold_img = imgThreshold(processed_img_path, threshold_type, img_thresh)
    elif active_img_name:
      upload_img_path = UPLOAD_BASE_PATH + active_img_name
      htreshold_img = imgThreshold(upload_img_path, threshold_type, img_thresh)

    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, htreshold_img)
    return jsonify({'ok': True, 'message': '图像阈值分割成功', 'thresholdName': processed_img_name})

  else:
    return jsonify({'ok': False, 'message': '图片阈值分割失败'})

#图像滤波
@app.route('/smooth', methods=['POST'])
def img_filter():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  filter_type = request.form.get('filterType')
  filter_nucleus = request.form.get('nucleus')
  if processed_img_name or active_img_name:
    #已处理图像已经存在，对已处理图像进行滤波
    if processed_img_name:
      processed_img_path = os.path.dirname(__file__) + '/static/cache-img/' + processed_img_name
      filtered_img = imgFilter(processed_img_path, filter_type, filter_nucleus)
    #已处理图像不存在，对上传图像进行滤波
    elif active_img_name:
      upload_img_path = UPLOAD_BASE_PATH + active_img_name
      filtered_img = imgFilter(upload_img_path, filter_type, filter_nucleus)
    #将已滤波的图像保存在缓存文件夹中
    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, filtered_img)
    return jsonify({'ok': True, 'message': '图像滤波成功', 'filterImgName': processed_img_name})

  else:
    return jsonify({'ok': False, 'message': '图片滤波失败'})

#图像形态学操作
@app.route('/morphology', methods=['POST'])
def img_morphology():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  kernel = request.form.get('kernel')
  n = request.form.get('iterations')
  morphology_type = request.form.get('type')
  if processed_img_name or active_img_name:
    if processed_img_name:
      processed_img_path = os.path.dirname(__file__) + '/static/cache-img/' + processed_img_name
      morphology_img = imgMrophology(processed_img_path, kernel, n, morphology_type)
    elif active_img_name:
      upload_img_path = UPLOAD_BASE_PATH + active_img_name
      morphology_img = imgMrophology(upload_img_path, kernel, n, morphology_type)

    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, morphology_img)
    return jsonify({'ok': True, 'message': '图像形态学操作成功', 'morphologyName': processed_img_name})
  
  else:
    return jsonify({'ok': False, 'message': '图片形态学操作失败'})


#边缘检测
@app.route('/edge', methods=['POST'])
def img_edgo():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  operator = request.form.get('operator')
  minVal = request.form.get('minVal')
  maxVal = request.form.get('maxVal')
  if processed_img_name or active_img_name:
    if processed_img_name:
      processed_img_path = os.path.dirname(__file__) + '/static/cache-img/' + processed_img_name
      edge_img = imgEdge(processed_img_path, operator, minVal, maxVal)
    elif active_img_name:
      upload_img_path = UPLOAD_BASE_PATH + active_img_name
      edge_img = imgEdge(upload_img_path, operator, minVal, maxVal)

    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, edge_img)
    return jsonify({'ok': True, 'message': '图像边缘检测成功', 'edgeName': processed_img_name})
  
  else:
    return jsonify({'ok': False, 'message': '图像边缘检测失败'})