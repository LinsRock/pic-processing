from flask import render_template, request, jsonify
from app import app
import shutil,os
import cv2
from werkzeug.utils import secure_filename
from app.noise import addNoise
from app.thresholdSeg import imgThreshold
from app.smooth import imgFilter
from app.morphology import imgMrophology
from app.edge import imgEdge
from app.contour import imgContour
from app.cailbration import Cailbration
from app.Gear import GearDetection
from app.Shaft import ShaftDetection
from app.pathUtil import Pic_name

#os.path.abspath() 
UPLOAD_BASE_PATH = os.path.dirname(__file__) + '/static/upload-img/'       #存放上传图片的路径
CACEHE_BASE_PATH = 'app/static/cache-img/'                                     #存入处理图片缓存的路径
PLATE_IMG_PATH = 'app/static/plate_cailbration_imgs/'
active_img_name = ''
processed_img_name = ''
gauge_img_name = ''

@app.route('/')
@app.route('/index')
def index():
  return render_template('index.html')

@app.route('/test')
def test():
  return render_template('xxll.html')

#上传图片
@app.route('/upload', methods=['POST'])
def change_img():
  global UPLOAD_BASE_PATH
  global active_img_name
  loadImg = request.files.get('file_img')                     #接收上传的图片文件
  ext = secure_filename(loadImg.filename).rsplit('.', 1)[1]
  active_img_name = Pic_name().create_uuid() + '.' + ext      #生成唯一的文件名
  loadImgPath = UPLOAD_BASE_PATH + active_img_name            #上传图片的存入地址
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

#应用图片
@app.route('/apply', methods=['POST'])
def apply_img():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  delLoadImg = request.form.get('loadImg')
  delProcImg = request.form.get('procImg')
  #删除已上传图片
  delImgPath = UPLOAD_BASE_PATH + delLoadImg
  os.remove(delImgPath)
  #删除已处理图片
  if delProcImg != '0':
    delImgPath = os.path.dirname(__file__) + '/static/cache-img/' + delProcImg
    os.remove(delImgPath)
    
  #移动图片文件
  processed_img_path = os.path.dirname(__file__) + '/static/cache-img/' + processed_img_name
  shutil.move(processed_img_path, UPLOAD_BASE_PATH)
  #修正图片名
  active_img_name = processed_img_name
  processed_img_name = ''
  return jsonify({'ok': True, 'message': '图片应用成功'})


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
  if active_img_name:
    gray_path = UPLOAD_BASE_PATH + active_img_name
    active_img = cv2.imread(gray_path)
    gray_img = cv2.cvtColor(active_img, cv2.COLOR_BGR2GRAY)
    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, gray_img)
    return jsonify({'ok': True, 'message': '图片灰度化成功', 'grayName': processed_img_name})
  else:
    return jsonify({'ok': False, 'message': '图片灰度化失败'})

#图片阈值分割
@app.route('/threshold', methods=['POST'])
def img_threshold():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  threshold_type = request.form.get('thresholdType')
  img_thresh = request.form.get('thresh')
  if active_img_name:
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
  if active_img_name:
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
  if active_img_name:
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
  if active_img_name:
    upload_img_path = UPLOAD_BASE_PATH + active_img_name
    edge_img = imgEdge(upload_img_path, operator, minVal, maxVal)

    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, edge_img)
    return jsonify({'ok': True, 'message': '图像边缘检测成功', 'edgeName': processed_img_name})
  
  else:
    return jsonify({'ok': False, 'message': '图像边缘检测失败'})


#轮廓提取
@app.route('/contour', methods=['POST'])
def img_contour():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global active_img_name
  global processed_img_name
  feature = request.form.get('feature')
  arg = request.form.get('arg')
  if active_img_name:
    upload_img_path = UPLOAD_BASE_PATH + active_img_name
    contour_img = imgContour(upload_img_path, feature, arg)

    processed_img_name = Pic_name().create_uuid() + '.jpg'
    catch_img_path = CACEHE_BASE_PATH + processed_img_name
    cv2.imwrite(catch_img_path, contour_img)
    return jsonify({'ok': True, 'message': '图像轮廓提取成功', 'contourName': processed_img_name})
  
  else:
    return jsonify({'ok': False, 'message': '图像轮廓提取失败'})

#上传量块图片
@app.route('/upload_gauge_img', methods=['POST'])
def upload_gauge_img():
  global UPLOAD_BASE_PATH
  global gauge_img_name

  gaugeImg = request.files.get('gauge_img')                     #接收上传的图片文件
  ext = secure_filename(gaugeImg.filename).rsplit('.', 1)[1]
  gauge_img_name = Pic_name().create_uuid() + '.' + ext      #生成唯一的文件名
  gaugeImgPath = UPLOAD_BASE_PATH + gauge_img_name           #上传图片的存入地址
  gaugeImg.save(gaugeImgPath)                                 #保存上传图片
  return jsonify({'ok': True, 'message': '量块图片上传成功'})

#量块标定
@app.route('/gauge_cailbration', methods=['POST'])
def gear_gauge_cailbration():
  global UPLOAD_BASE_PATH
  global CACEHE_BASE_PATH
  global gauge_img_name
  if gauge_img_name:

    gauge_img_path = UPLOAD_BASE_PATH + gauge_img_name
    cailbrate =  Cailbration()
    #量块标定
    coefficient, newImg = cailbrate.gaugeCailbration(gauge_img_path)
    cailbration_img_name  = Pic_name().create_uuid() + '.jpg'
    cailbration_img_path = CACEHE_BASE_PATH + cailbration_img_name
    cv2.imwrite(cailbration_img_path, newImg)

    return jsonify({'ok': True, 'message': '标定成功', 'coefficient': coefficient, 'cailbration_img': cailbration_img_name})

  else:
    return jsonify({'ok': False, 'message': '标定失败'})

#上传标定板图片
@app.route('/upload_plate_img', methods=['POST'])
def upload_plate_img():
  global PLATE_IMG_PATH
  #缓存
  for i in range(len(request.files)):
    plateImg = request.files.get('plate_imgs' + str(i))
    plateImgPath = PLATE_IMG_PATH + str(i+1) + '.jpg'
    plateImg.save(plateImgPath)  

  return jsonify({'ok': True, 'message': '标定板图片上传成功'})

#清空标定板图片文件夹
@app.route('/clear_plate_folder', methods=['POST'])
def clear_plate_folder():
  global PLATE_IMG_PATH
  #判断目录是否存在
  if os.path.isdir(PLATE_IMG_PATH):
    shutil.rmtree(PLATE_IMG_PATH)
    os.mkdir('app/static/plate_cailbration_imgs')
  else:
    os.mkdir('app/static/plate_cailbration_imgs')

  return jsonify({'ok': True, 'message': '标定板图片清空成功'})


#标定板标定
@app.route('/plate_cailbration', methods=['POST'])
def plate_cailbration():
  m = request.form.get('m')
  n = request.form.get('n')
  width = request.form.get('width')
  h = request.form.get('h')
  cailbrate = Cailbration()
  #标定板
  coefficient = cailbrate.plateCailbration(int(m), int(n), int(width), float(h))
  return jsonify({'ok': True, 'message': '标定成功', 'coefficient': coefficient})

#齿轮检测
@app.route('/gear_detection', methods=['POST'])
def gear_detection():
  global UPLOAD_BASE_PATH
  global active_img_name
  caibbrate_coeff = request.form.get('cailbrateCoeff')
  if active_img_name:
    upload_img_path = UPLOAD_BASE_PATH + active_img_name
    gear = GearDetection(upload_img_path, float(caibbrate_coeff))
    #获取齿轮检测出的参数
    Ra, Rf, z, m, r, p, ha, hf = gear.run()
  
    #获取齿轮检测的标记图片
    mark_img = gear.get_mark_img()

    active_img_name = Pic_name().create_uuid() + '.jpg'
    upload_img_path = UPLOAD_BASE_PATH + active_img_name
    cv2.imwrite(upload_img_path, mark_img)
    return jsonify({'ok': True, 'message': '齿轮检测成功', 'parameter': {'Ra': Ra, 'Rf': Rf, 'z': z, 'm': m, 'r': r, 'p': p, 'ha': ha, 'hf': hf}, 'markImg': active_img_name})

  else:
    return jsonify({'ok': False, 'message': '齿轮检测失败'})


#轴尺寸测量
@app.route('/shaft_detection', methods=['POST'])
def shaft_detection():
  global UPLOAD_BASE_PATH
  global active_img_name
  caibbrate_coeff = request.form.get('cailbrateCoeff')
  if active_img_name:
    upload_img_path = UPLOAD_BASE_PATH + active_img_name
    shaft_img, shaft_size = ShaftDetection(upload_img_path, float(caibbrate_coeff)).run()

    active_img_name = Pic_name().create_uuid() + '.jpg'
    upload_img_path = UPLOAD_BASE_PATH + active_img_name
    cv2.imwrite(upload_img_path, shaft_img)
    return jsonify({'ok': True, 'message': '轴尺寸测量成功', 'shaftSize': shaft_size, 'shaftImg': active_img_name})

  else:
    return jsonify({'ok': False, 'message': '轴尺寸测量失败'})
