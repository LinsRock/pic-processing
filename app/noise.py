import cv2
import numpy as np
import skimage

def addNoise(src, noise_type):
  image = cv2.imread(src)
  if (noise_type == 'salt' or noise_type == 'pepper' or noise_type == 's&p'):
    """ 
      添加椒盐噪声
      src：需要加噪的图片地址
      type：加入盐噪声(SALT)、椒噪声(PEPPER)还是椒盐噪声(SALTANDPEPPER)
      percetage：加入噪声的百分比
    """
    percetage = 0.1
    SP_NoiseImg = image
    rows, cols, chn = SP_NoiseImg.shape
    SP_NoiseNum = int(percetage * rows * cols)

    for i in range(SP_NoiseNum):
      randx = np.random.randint(0, rows)
      randy = np.random.randint(0, cols)
      if noise_type == 'salt':
        SP_NoiseImg[randx, randy] = 255
      elif noise_type == 'pepper':
        SP_NoiseImg[randx, randy] = 0
      elif noise_type == 's&p':
        if np.random.randint(0, 2) == 0:
          SP_NoiseImg[randx, randy] = 0
        else:
          SP_NoiseImg[randx, randy] = 255

    return SP_NoiseImg

  elif noise_type == 'gaussian':
    """ 
      添加高斯噪声
      src：需要添加噪声的图像地址
      mean：均值
      var：方差
    """
    Gauss_NoiseImg = skimage.util.random_noise(image, mode="gaussian", clip = True, mean = 0, var = 0.01)
    Gauss_NoiseImg = skimage.img_as_ubyte(Gauss_NoiseImg)

    return Gauss_NoiseImg

  elif noise_type == 'poisson':
    """ 
      添加泊松噪声
    """
    Poi_NoiseImg = skimage.util.random_noise(image, mode="poisson", clip=True)
    Poi_NoiseImg = skimage.img_as_ubyte(Poi_NoiseImg)

    return Poi_NoiseImg

  elif noise_type == 'speckle':
    """ 
      添加斑点噪声
    """
    Speckle_NoiseImg = skimage.util.random_noise(image, mode="speckle", clip=True, mean=0, var=0.01)
    Speckle_NoiseImg = skimage.img_as_ubyte(Speckle_NoiseImg)

    return Speckle_NoiseImg
